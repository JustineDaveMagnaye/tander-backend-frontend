package com.tander.tandermobile.service.encryption;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting/decrypting ID photos using AES-256-GCM.
 * Provides GDPR-compliant encryption at rest for sensitive data.
 * 100% FREE - uses Java's built-in cryptography libraries.
 */
@Service
public class EncryptionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EncryptionService.class);

    private static final String ALGORITHM = "AES";
    private static final int GCM_IV_LENGTH = 12; // 96 bits
    private static final int GCM_TAG_LENGTH = 128; // 128 bits auth tag

    @Value("${encryption.key}")
    private String base64Key;

    @Value("${encryption.algorithm}")
    private String algorithm;

    @Value("${encryption.enabled}")
    private boolean enabled;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Encrypts data using AES-256-GCM.
     * Returns Base64-encoded string: [IV (12 bytes)][Encrypted Data][Auth Tag (16 bytes)]
     *
     * @param data data to encrypt
     * @return Base64-encoded encrypted data with IV and auth tag
     * @throws Exception if encryption fails
     */
    public String encrypt(byte[] data) throws Exception {
        if (!enabled) {
            LOGGER.warn("⚠️ Encryption is DISABLED - storing data in plaintext (not recommended)");
            return Base64.getEncoder().encodeToString(data);
        }

        try {
            // Generate random IV (Initialization Vector)
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Prepare encryption cipher
            SecretKey key = getKey();
            Cipher cipher = Cipher.getInstance(algorithm);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);

            // Encrypt data (includes authentication tag)
            byte[] encryptedData = cipher.doFinal(data);

            // Combine IV + encrypted data for storage
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + encryptedData.length);
            byteBuffer.put(iv);
            byteBuffer.put(encryptedData);

            // Return as Base64 for safe storage
            String result = Base64.getEncoder().encodeToString(byteBuffer.array());
            LOGGER.debug("✅ Data encrypted successfully ({} bytes -> {} bytes)",
                    data.length, byteBuffer.array().length);
            return result;

        } catch (Exception e) {
            LOGGER.error("❌ Encryption failed: {}", e.getMessage(), e);
            throw new Exception("Failed to encrypt data: " + e.getMessage());
        }
    }

    /**
     * Decrypts data that was encrypted with encrypt().
     *
     * @param encryptedBase64 Base64-encoded encrypted data (IV + ciphertext + auth tag)
     * @return decrypted data
     * @throws Exception if decryption fails
     */
    public byte[] decrypt(String encryptedBase64) throws Exception {
        if (!enabled) {
            LOGGER.warn("⚠️ Encryption is DISABLED - reading plaintext data");
            return Base64.getDecoder().decode(encryptedBase64);
        }

        try {
            // Decode from Base64
            byte[] decoded = Base64.getDecoder().decode(encryptedBase64);

            // Extract IV and encrypted data
            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] encryptedData = new byte[byteBuffer.remaining()];
            byteBuffer.get(encryptedData);

            // Prepare decryption cipher
            SecretKey key = getKey();
            Cipher cipher = Cipher.getInstance(algorithm);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);

            // Decrypt and verify authentication tag
            byte[] decryptedData = cipher.doFinal(encryptedData);

            LOGGER.debug("✅ Data decrypted successfully ({} bytes)", decryptedData.length);
            return decryptedData;

        } catch (Exception e) {
            LOGGER.error("❌ Decryption failed: {}", e.getMessage(), e);
            throw new Exception("Failed to decrypt data: " + e.getMessage());
        }
    }

    /**
     * Gets the encryption key from configuration.
     */
    private SecretKey getKey() throws Exception {
        try {
            byte[] decodedKey = Base64.getDecoder().decode(base64Key);
            if (decodedKey.length != 32) {
                throw new Exception("Invalid key length: " + decodedKey.length + " bytes (expected 32 for AES-256)");
            }
            return new SecretKeySpec(decodedKey, 0, decodedKey.length, ALGORITHM);
        } catch (Exception e) {
            throw new Exception("Failed to load encryption key: " + e.getMessage());
        }
    }

    /**
     * Checks if encryption is enabled.
     */
    public boolean isEnabled() {
        return enabled;
    }
}

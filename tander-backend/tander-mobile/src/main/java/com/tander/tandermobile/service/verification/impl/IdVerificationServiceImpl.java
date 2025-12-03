package com.tander.tandermobile.service.verification.impl;

import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.repository.user.UserRepository;
import com.tander.tandermobile.service.verification.IdVerificationService;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Implementation of ID verification service using Tesseract OCR.
 * Fully automated, 100% free solution for age verification from Philippine IDs.
 */
@Service
public class IdVerificationServiceImpl implements IdVerificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(IdVerificationServiceImpl.class);
    private static final int MINIMUM_AGE = 60;

    @Autowired
    private UserRepository userRepository;

    private final Tesseract tesseract;

    public IdVerificationServiceImpl() {
        // Initialize Tesseract OCR
        tesseract = new Tesseract();
        // Set data path for Tesseract (default: tessdata folder in project root)
        // Download eng.traineddata from: https://github.com/tesseract-ocr/tessdata
        tesseract.setDatapath("/usr/share/tesseract-ocr/4.00/tessdata");
        tesseract.setLanguage("eng");
        tesseract.setPageSegMode(1); // Automatic page segmentation with OSD
        tesseract.setOcrEngineMode(1); // Neural nets LSTM engine only
    }

    @Override
    public String verifyUserAge(User user, MultipartFile idPhotoFront, MultipartFile idPhotoBack) throws Exception {
        try {
            LOGGER.info("🔍 Starting automated ID verification for user: {}", user.getUsername());

            // Update status to PROCESSING
            user.setIdVerificationStatus("PROCESSING");
            userRepository.save(user);

            // Extract text from front photo (primary)
            String extractedText = extractTextFromImage(idPhotoFront);
            LOGGER.info("📄 Extracted text from ID: {}", extractedText);

            // If front photo fails, try back photo
            if (extractedText.isEmpty() && idPhotoBack != null && !idPhotoBack.isEmpty()) {
                LOGGER.info("🔄 Front extraction empty, trying back photo...");
                extractedText = extractTextFromImage(idPhotoBack);
            }

            if (extractedText.isEmpty()) {
                LOGGER.error("❌ No text extracted from ID images");
                user.setIdVerificationStatus("FAILED");
                user.setVerificationFailureReason("Unable to extract text from ID. Please ensure the image is clear and well-lit.");
                user.setIdVerified(false);
                user.setVerifiedAt(new Date());
                userRepository.save(user);
                throw new Exception("Unable to extract text from ID images");
            }

            // Parse birthdate from extracted text
            Date birthdate = parseBirthdate(extractedText);

            if (birthdate == null) {
                LOGGER.error("❌ No birthdate found in extracted text");
                user.setIdVerificationStatus("FAILED");
                user.setVerificationFailureReason("Could not find birthdate in ID. Please ensure the birthdate is clearly visible.");
                user.setIdVerified(false);
                user.setVerifiedAt(new Date());
                userRepository.save(user);
                throw new Exception("Could not extract birthdate from ID");
            }

            // Calculate age
            int age = calculateAge(birthdate);
            LOGGER.info("📅 Extracted birthdate: {}, Calculated age: {}", birthdate, age);

            // Store extracted data
            user.setExtractedBirthdate(birthdate);
            user.setExtractedAge(age);
            user.setVerifiedAt(new Date());

            // Auto-approve or auto-reject based on age
            if (age >= MINIMUM_AGE) {
                LOGGER.info("✅ AUTO-APPROVED: Age {} is >= {} years", age, MINIMUM_AGE);
                user.setIdVerificationStatus("APPROVED");
                user.setIdVerified(true);
                user.setVerificationFailureReason(null);
                userRepository.save(user);
                return String.format("ID verification successful! Age: %d years (verified)", age);
            } else {
                LOGGER.info("❌ AUTO-REJECTED: Age {} is < {} years", age, MINIMUM_AGE);
                user.setIdVerificationStatus("REJECTED");
                user.setIdVerified(false);
                user.setVerificationFailureReason(String.format("Age requirement not met. Minimum age: %d years, Your age: %d years", MINIMUM_AGE, age));
                userRepository.save(user);
                throw new Exception(String.format("Age requirement not met. You must be at least %d years old.", MINIMUM_AGE));
            }

        } catch (Exception e) {
            LOGGER.error("🔴 ID verification error: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public String extractTextFromImage(MultipartFile idPhoto) throws Exception {
        try {
            // Convert MultipartFile to BufferedImage
            BufferedImage image = ImageIO.read(idPhoto.getInputStream());

            if (image == null) {
                throw new Exception("Invalid image file");
            }

            // Run OCR
            String text = tesseract.doOCR(image);

            return text != null ? text : "";

        } catch (TesseractException e) {
            LOGGER.error("Tesseract OCR error: {}", e.getMessage());
            throw new Exception("OCR processing failed: " + e.getMessage());
        }
    }

    @Override
    public Date parseBirthdate(String extractedText) {
        if (extractedText == null || extractedText.isEmpty()) {
            return null;
        }

        // Common patterns for Philippine IDs
        // Pattern 1: MM/DD/YYYY (e.g., 01/15/1960, 12/31/1963)
        // Pattern 2: DD/MM/YYYY (e.g., 15/01/1960)
        // Pattern 3: YYYY-MM-DD (e.g., 1960-01-15)
        // Pattern 4: Month DD, YYYY (e.g., January 15, 1960)

        String[] datePatterns = {
                "MM/dd/yyyy",
                "dd/MM/yyyy",
                "yyyy-MM-dd",
                "MMMM dd, yyyy",
                "MMM dd, yyyy"
        };

        // Regex patterns to find dates in text
        String[] regexPatterns = {
                "\\b(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/(19[0-9]{2}|20[0-2][0-9])\\b", // MM/DD/YYYY
                "\\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/(19[0-9]{2}|20[0-2][0-9])\\b", // DD/MM/YYYY
                "\\b(19[0-9]{2}|20[0-2][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\\b"  // YYYY-MM-DD
        };

        // Look for keywords like "BIRTHDATE", "DATE OF BIRTH", "DOB", "BORN"
        String normalizedText = extractedText.toUpperCase();

        for (int i = 0; i < regexPatterns.length; i++) {
            Pattern pattern = Pattern.compile(regexPatterns[i]);
            Matcher matcher = pattern.matcher(extractedText);

            while (matcher.find()) {
                String dateStr = matcher.group();
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat(datePatterns[i]);
                    sdf.setLenient(false);
                    Date parsedDate = sdf.parse(dateStr);

                    // Validate that the date is reasonable (between 1900 and current year)
                    LocalDate localDate = parsedDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    int year = localDate.getYear();

                    if (year >= 1900 && year <= LocalDate.now().getYear()) {
                        LOGGER.info("✅ Found valid birthdate: {} (parsed from: {})", parsedDate, dateStr);
                        return parsedDate;
                    }

                } catch (ParseException e) {
                    // Continue to next pattern
                    LOGGER.debug("Failed to parse date with pattern {}: {}", datePatterns[i], dateStr);
                }
            }
        }

        LOGGER.warn("⚠️ No valid birthdate found in extracted text");
        return null;
    }

    @Override
    public int calculateAge(Date birthdate) {
        if (birthdate == null) {
            return 0;
        }

        LocalDate birthLocalDate = birthdate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate currentDate = LocalDate.now();

        return Period.between(birthLocalDate, currentDate).getYears();
    }
}

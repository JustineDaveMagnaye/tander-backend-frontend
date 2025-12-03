package com.tander.tandermobile.service.verification.impl;

import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.repository.user.UserRepository;
import com.tander.tandermobile.service.verification.IdVerificationService;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class IdVerificationServiceImpl implements IdVerificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(IdVerificationServiceImpl.class);
    private static final int MINIMUM_AGE = 60;
    private static final double BLUR_THRESHOLD = 100.0; // Laplacian variance threshold

    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload.id-verification-path}")
    private String uploadPath;

    @Value("${tesseract.datapath}")
    private String tessDataPath;

    @Value("${tesseract.language:eng}")
    private String tessLanguage;

    private Tesseract tesseract;

    @PostConstruct
    public void init() {
        tesseract = new Tesseract();
        tesseract.setDatapath(tessDataPath);
        tesseract.setLanguage(tessLanguage);
        tesseract.setPageSegMode(1); // Automatic page segmentation
        tesseract.setOcrEngineMode(1); // LSTM only
        LOGGER.info("Tesseract initialized with datapath: {}", tessDataPath);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String verifyUserAge(User user, MultipartFile idPhotoFront, MultipartFile idPhotoBack) throws Exception {
        try {
            LOGGER.info("🔍 Verifying age for user: {}", user.getUsername());

            // Validate file type and size
            validateIdPhoto(idPhotoFront, "Front");
            if (idPhotoBack != null && !idPhotoBack.isEmpty()) {
                validateIdPhoto(idPhotoBack, "Back");
            }

            // Save front photo
            String frontPhotoPath = saveIdPhoto(idPhotoFront, user.getUsername(), "front");
            user.setIdPhotoFrontUrl(frontPhotoPath);
            userRepository.save(user);
            LOGGER.info("💾 Saved front photo to {}", frontPhotoPath);

            // Check image quality
            if (!isImageQualityAcceptable(idPhotoFront)) {
                user.setIdVerificationStatus("FAILED");
                user.setIdVerified(false);
                user.setVerificationFailureReason("ID photo too blurry");
                userRepository.save(user);
                throw new Exception("ID photo too blurry");
            }

            // Extract text
            String extractedText = extractTextFromImage(idPhotoFront);
            LOGGER.info("📄 Extracted text: {}", extractedText);

            // Parse birthdate
            Date birthdate = parseBirthdate(extractedText);
            if (birthdate == null) {
                user.setIdVerificationStatus("FAILED");
                user.setIdVerified(false);
                user.setVerificationFailureReason("Birthdate extraction failed");
                userRepository.save(user);
                throw new Exception("Birthdate extraction failed");
            }

            // Calculate age
            int age = calculateAge(birthdate);
            LOGGER.info("📅 Calculated age: {}", age);

            // Save to user
            user.setExtractedBirthdate(birthdate);
            user.setExtractedAge(age);
            user.setVerifiedAt(new Date());

            // Check minimum age
            if (age >= MINIMUM_AGE) {
                user.setIdVerificationStatus("APPROVED");
                user.setIdVerified(true);
                user.setVerificationFailureReason(null);
                userRepository.save(user);
                return String.format("✅ Age verification passed. Age: %d", age);
            } else {
                user.setIdVerificationStatus("REJECTED");
                user.setIdVerified(false);
                user.setVerificationFailureReason(
                        String.format("Age requirement not met. Minimum: %d, Your age: %d", MINIMUM_AGE, age));
                userRepository.save(user);
                throw new Exception(String.format("❌ Age requirement not met. You must be at least %d years old.", MINIMUM_AGE));
            }

        } catch (Exception e) {
            LOGGER.error("🔴 Verification error: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public String extractTextFromImage(MultipartFile idPhoto) throws Exception {
        BufferedImage image = ImageIO.read(idPhoto.getInputStream());
        if (image == null) throw new Exception("Invalid image file");
        try {
            return tesseract.doOCR(image);
        } catch (TesseractException e) {
            throw new Exception("OCR failed: " + e.getMessage());
        }
    }

    @Override
    public Date parseBirthdate(String text) {
        if (text == null) return null;

        // Clean text for better OCR error handling
        text = cleanOcrText(text);

        // Try multiple date patterns (Philippine ID formats)
        Date result = null;

        // Pattern 1: YYYY/MM/DD or YYYY-MM-DD (ISO format)
        result = tryParsePattern(text, "\\b(19|20)\\d{2}[/-](0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])\\b",
                new String[]{"yyyy/MM/dd", "yyyy-MM-dd"});
        if (result != null) return result;

        // Pattern 2: DD/MM/YYYY or DD-MM-YYYY (Common Philippine format)
        result = tryParsePattern(text, "\\b(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[0-2])[/-](19|20)\\d{2}\\b",
                new String[]{"dd/MM/yyyy", "dd-MM-yyyy"});
        if (result != null) return result;

        // Pattern 3: MM/DD/YYYY or MM-DD-YYYY (US format, common in some Philippine IDs)
        result = tryParsePattern(text, "\\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])[/-](19|20)\\d{2}\\b",
                new String[]{"MM/dd/yyyy", "MM-dd-yyyy"});
        if (result != null) return result;

        // Pattern 4: Month DD, YYYY (e.g., "January 15, 1960")
        result = tryParsePattern(text, "\\b(January|February|March|April|May|June|July|August|September|October|November|December|" +
                        "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\\s+(0?[1-9]|[12][0-9]|3[01]),?\\s+(19|20)\\d{2}\\b",
                new String[]{"MMMM dd, yyyy", "MMMM dd yyyy", "MMM dd, yyyy", "MMM dd yyyy"});
        if (result != null) return result;

        // Pattern 5: DD Month YYYY (e.g., "15 January 1960")
        result = tryParsePattern(text, "\\b(0?[1-9]|[12][0-9]|3[01])\\s+(January|February|March|April|May|June|July|August|September|October|November|December|" +
                        "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\\s+(19|20)\\d{2}\\b",
                new String[]{"dd MMMM yyyy", "dd MMM yyyy"});
        if (result != null) return result;

        LOGGER.warn("⚠️ Could not parse birthdate from text: {}", text.substring(0, Math.min(100, text.length())));
        return null;
    }

    /**
     * Cleans OCR text to handle common OCR errors
     */
    private String cleanOcrText(String text) {
        // Replace common OCR misreads
        text = text.replaceAll("O", "0"); // O -> 0
        text = text.replaceAll("l", "1"); // lowercase L -> 1
        text = text.replaceAll("I", "1"); // uppercase I -> 1
        text = text.replaceAll("S", "5"); // S -> 5 (in dates)
        text = text.replaceAll("B", "8"); // B -> 8
        return text;
    }

    /**
     * Tries to parse a date using a regex pattern and multiple format strings
     */
    private Date tryParsePattern(String text, String regexPattern, String[] formats) {
        Pattern pattern = Pattern.compile(regexPattern, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            String dateStr = matcher.group();
            for (String format : formats) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat(format);
                    sdf.setLenient(false);
                    Date date = sdf.parse(dateStr);

                    // Validate year range (must be between 1900 and current year)
                    int year = Integer.parseInt(new SimpleDateFormat("yyyy").format(date));
                    int currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR);
                    if (year >= 1900 && year <= currentYear) {
                        LOGGER.info("✅ Parsed birthdate: {} using format: {}", dateStr, format);
                        return date;
                    }
                } catch (ParseException | NumberFormatException e) {
                    // Try next format
                }
            }
        }
        return null;
    }

    @Override
    public int calculateAge(Date birthdate) {
        LocalDate birthLocal = birthdate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        return Period.between(birthLocal, LocalDate.now()).getYears();
    }

    @Override
    public boolean isImageQualityAcceptable(MultipartFile idPhoto) throws Exception {
        BufferedImage image = ImageIO.read(idPhoto.getInputStream());
        if (image == null) throw new Exception("Invalid image file");
        return calculateLaplacianVariance(image) >= BLUR_THRESHOLD;
    }

    private double calculateLaplacianVariance(BufferedImage image) {
        int w = image.getWidth(), h = image.getHeight();
        int[][] gray = new int[h][w];
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb = image.getRGB(x, y);
                gray[y][x] = ((rgb >> 16) & 0xFF + (rgb >> 8) & 0xFF + rgb & 0xFF) / 3;
            }
        }

        double sum = 0, sumSq = 0;
        int count = 0;
        for (int y = 1; y < h - 1; y++) {
            for (int x = 1; x < w - 1; x++) {
                int lap = gray[y-1][x] + gray[y+1][x] + gray[y][x-1] + gray[y][x+1] - 4*gray[y][x];
                sum += lap;
                sumSq += lap*lap;
                count++;
            }
        }
        double mean = sum / count;
        return (sumSq / count) - (mean * mean);
    }

    /**
     * Validates ID photo file type, size, and basic properties.
     * Prevents malicious file uploads and ensures proper image format.
     */
    private void validateIdPhoto(MultipartFile file, String photoType) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new Exception(photoType + " photo is required");
        }

        // Validate file size (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new Exception(photoType + " photo size exceeds 10MB limit");
        }

        // Validate content type (MIME type)
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") ||
                                     contentType.equals("image/jpg") ||
                                     contentType.equals("image/png"))) {
            throw new Exception(photoType + " photo must be JPEG or PNG format");
        }

        // Validate filename extension
        String filename = file.getOriginalFilename();
        if (filename != null) {
            String ext = filename.toLowerCase();
            if (!ext.endsWith(".jpg") && !ext.endsWith(".jpeg") && !ext.endsWith(".png")) {
                throw new Exception(photoType + " photo must have .jpg, .jpeg, or .png extension");
            }
        }

        // Validate image can be read (prevents malformed images)
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new Exception(photoType + " photo is not a valid image file");
            }
            // Reset input stream for later use
            file.getInputStream().reset();
        } catch (IOException e) {
            throw new Exception(photoType + " photo is corrupted or not a valid image");
        }

        LOGGER.info("✅ {} photo validation passed", photoType);
    }

    private String saveIdPhoto(MultipartFile file, String username, String type) throws IOException {
        if (file == null || file.isEmpty()) return null;

        Path dir = Paths.get(uploadPath);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        // Sanitize filename and validate extension to prevent path traversal
        String originalFilename = file.getOriginalFilename();
        String ext = ".jpg"; // Default extension

        if (originalFilename != null && originalFilename.contains(".")) {
            // Extract extension and sanitize (remove any path separators)
            String rawExt = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            // Remove any path traversal characters
            rawExt = rawExt.replaceAll("[^a-z0-9.]", "");

            // Whitelist allowed extensions
            if (rawExt.equals(".jpg") || rawExt.equals(".jpeg") || rawExt.equals(".png")) {
                ext = rawExt;
            } else {
                LOGGER.warn("Invalid file extension {} for user {}, using .jpg", rawExt, username);
            }
        }

        // Sanitize username to prevent path traversal
        String safeUsername = username.replaceAll("[^a-zA-Z0-9_-]", "_");

        String filename = String.format("%s_%s_%s_%s%s",
                safeUsername, type, new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()),
                UUID.randomUUID().toString().substring(0, 8), ext);

        Path path = dir.resolve(filename);

        // Verify path is still within upload directory (defense in depth)
        if (!path.normalize().startsWith(dir.normalize())) {
            throw new IOException("Invalid file path detected");
        }

        Files.copy(file.getInputStream(), path);
        return path.toString();
    }
}

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
    private static final double BLUR_THRESHOLD = 100.0;

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
        tesseract.setPageSegMode(1);
        tesseract.setOcrEngineMode(1);
        LOGGER.info("Tesseract initialized with datapath: {}", tessDataPath);
    }

    @Override
    public String verifyUserAge(User user, org.springframework.web.multipart.MultipartFile idPhotoFront, org.springframework.web.multipart.MultipartFile idPhotoBack) throws Exception {

        LOGGER.info("🔍 Verifying age for user: {}", user.getUsername());

        // Validate photos
        validateIdPhoto(idPhotoFront, "Front");
        if (idPhotoBack != null && !idPhotoBack.isEmpty()) {
            validateIdPhoto(idPhotoBack, "Back");
        }

        // Save front photo
        String frontPhotoPath = saveIdPhoto(idPhotoFront, user.getUsername(), "front");
        user.setIdPhotoFrontUrl(frontPhotoPath);
        userRepository.save(user);
        LOGGER.info("💾 Saved front ID photo: {}", frontPhotoPath);

        // Check image quality
        if (!isImageQualityAcceptable(idPhotoFront)) {
            throw new Exception("❌ ID photo is too blurry.");
        }

        // Extract OCR text
        String extractedText = extractTextFromImage(idPhotoFront);
        LOGGER.info("📄 OCR extracted: {}", extractedText);

        // Parse birthdate
        Date birthdate = parseBirthdate(extractedText);
        if (birthdate == null) {
            throw new Exception("❌ Birthdate extraction failed. Please upload clearer ID.");
        }

        // Calculate age
        int age = calculateAge(birthdate);
        LOGGER.info("📅 User calculated age: {}", age);

        // Set user info
        user.setExtractedBirthdate(birthdate);
        user.setExtractedAge(age);
        user.setVerifiedAt(new Date());

        // Enforce age requirement
        if (age < MINIMUM_AGE) {
            user.setIdVerificationStatus("REJECTED");
            user.setIdVerified(false);
            user.setVerificationFailureReason(
                    String.format("Age requirement not met. Minimum: %d, Your age: %d", MINIMUM_AGE, age)
            );
            userRepository.save(user);
            throw new Exception(String.format("❌ Age requirement not met. You must be at least %d years old.", MINIMUM_AGE));
        }

        user.setIdVerificationStatus("APPROVED");
        user.setIdVerified(true);
        user.setVerificationFailureReason(null);
        userRepository.save(user);

        return String.format("✅ Age verification passed. Age: %d", age);
    }

    @Override
    public String extractTextFromImage(org.springframework.web.multipart.MultipartFile idPhoto) throws Exception {
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

        text = cleanOcrText(text);

        Date result;
        result = tryParsePattern(text, "\\b(19|20)\\d{2}[/-](0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])\\b",
                new String[]{"yyyy/MM/dd", "yyyy-MM-dd"});
        if (result != null) return result;

        result = tryParsePattern(text, "\\b(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[0-2])[/-](19|20)\\d{2}\\b",
                new String[]{"dd/MM/yyyy", "dd-MM-yyyy"});
        if (result != null) return result;

        result = tryParsePattern(text, "\\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])[/-](19|20)\\d{2}\\b",
                new String[]{"MM/dd/yyyy", "MM-dd-yyyy"});
        if (result != null) return result;

        result = tryParsePattern(text, "\\b(January|February|March|April|May|June|July|August|September|October|November|December|" +
                        "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\\s+(0?[1-9]|[12][0-9]|3[01]),?\\s+(19|20)\\d{2}\\b",
                new String[]{"MMMM dd, yyyy", "MMMM dd yyyy", "MMM dd, yyyy", "MMM dd yyyy"});
        if (result != null) return result;

        result = tryParsePattern(text, "\\b(0?[1-9]|[12][0-9]|3[01])\\s+(January|February|March|April|May|June|July|August|September|October|November|December|" +
                        "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\\s+(19|20)\\d{2}\\b",
                new String[]{"dd MMMM yyyy", "dd MMM yyyy"});
        if (result != null) return result;

        LOGGER.warn("⚠️ Could not parse birthdate from text: {}", text.substring(0, Math.min(100, text.length())));
        return null;
    }

    private String cleanOcrText(String text) {
        text = text.replaceAll("O", "0");
        text = text.replaceAll("l", "1");
        text = text.replaceAll("I", "1");
        text = text.replaceAll("S", "5");
        text = text.replaceAll("B", "8");
        return text;
    }

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
                    int year = Integer.parseInt(new SimpleDateFormat("yyyy").format(date));
                    int currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR);
                    if (year >= 1900 && year <= currentYear) {
                        LOGGER.info("✅ Parsed birthdate: {} using format: {}", dateStr, format);
                        return date;
                    }
                } catch (ParseException | NumberFormatException ignored) {}
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
    public boolean isImageQualityAcceptable(org.springframework.web.multipart.MultipartFile idPhoto) throws Exception {
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

    private void validateIdPhoto(org.springframework.web.multipart.MultipartFile file, String photoType) throws Exception {
        if (file == null || file.isEmpty()) throw new Exception(photoType + " photo is required");
        long maxSize = 10 * 1024 * 1024;
        if (file.getSize() > maxSize) throw new Exception(photoType + " photo exceeds 10MB");

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png"))) {
            throw new Exception(photoType + " photo must be JPEG or PNG");
        }

        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) throw new Exception(photoType + " photo is invalid or corrupted");

        LOGGER.info("✅ {} photo validation passed", photoType);
    }

    private String saveIdPhoto(org.springframework.web.multipart.MultipartFile file, String username, String type) throws IOException {
        if (file == null || file.isEmpty()) return null;
        Path dir = Paths.get(uploadPath);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String ext = ".jpg";
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            String rawExt = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            rawExt = rawExt.replaceAll("[^a-z0-9.]", "");
            if (rawExt.equals(".jpg") || rawExt.equals(".jpeg") || rawExt.equals(".png")) ext = rawExt;
        }

        String safeUsername = username.replaceAll("[^a-zA-Z0-9_-]", "_");
        String filename = String.format("%s_%s_%s_%s%s",
                safeUsername, type, new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()),
                UUID.randomUUID().toString().substring(0, 8), ext);

        Path path = dir.resolve(filename);
        if (!path.normalize().startsWith(dir.normalize())) throw new IOException("Invalid file path");

        Files.copy(file.getInputStream(), path);
        return path.toString();
    }
}

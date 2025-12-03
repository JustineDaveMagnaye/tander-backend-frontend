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
    public String verifyUserAge(User user, MultipartFile idPhotoFront, MultipartFile idPhotoBack) throws Exception {
        try {
            LOGGER.info("🔍 Verifying age for user: {}", user.getUsername());

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

        // Pattern: YYYY/MM/DD or YYYY-MM-DD
        Pattern pattern = Pattern.compile("\\b(19|20)\\d{2}[/-](0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])\\b");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String dateStr = matcher.group();
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(dateStr.contains("/") ? "yyyy/MM/dd" : "yyyy-MM-dd");
                sdf.setLenient(false);
                return sdf.parse(dateStr);
            } catch (ParseException ignored) {}
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

    private String saveIdPhoto(MultipartFile file, String username, String type) throws IOException {
        if (file == null || file.isEmpty()) return null;

        Path dir = Paths.get(uploadPath);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                : ".jpg";

        String filename = String.format("%s_%s_%s_%s%s",
                username, type, new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()),
                UUID.randomUUID().toString().substring(0, 8), ext);

        Path path = dir.resolve(filename);
        Files.copy(file.getInputStream(), path);
        return path.toString();
    }
}

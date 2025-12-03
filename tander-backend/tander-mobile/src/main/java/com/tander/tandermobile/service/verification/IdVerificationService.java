package com.tander.tandermobile.service.verification;

import com.tander.tandermobile.domain.user.User;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for automated ID verification using OCR.
 * Extracts birthdate from ID images and validates age requirements (60+).
 */
public interface IdVerificationService {

    /**
     * Verifies user ID by extracting birthdate via OCR and validating age.
     *
     * @param user the user to verify
     * @param idPhotoFront front photo of the ID
     * @param idPhotoBack back photo of the ID (optional)
     * @return verification result message
     * @throws Exception if verification fails
     */
    String verifyUserAge(User user, MultipartFile idPhotoFront, MultipartFile idPhotoBack) throws Exception;

    /**
     * Extracts text from ID image using Tesseract OCR.
     *
     * @param idPhoto the ID image file
     * @return extracted text
     * @throws Exception if OCR fails
     */
    String extractTextFromImage(MultipartFile idPhoto) throws Exception;

    /**
     * Parses birthdate from OCR extracted text using regex patterns.
     * Supports Philippine ID formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
     *
     * @param extractedText text extracted from ID
     * @return parsed birthdate or null if not found
     */
    java.util.Date parseBirthdate(String extractedText);

    /**
     * Calculates age from birthdate.
     *
     * @param birthdate the birthdate to calculate age from
     * @return calculated age in years
     */
    int calculateAge(java.util.Date birthdate);
}

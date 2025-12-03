# Automated ID Verification Setup Guide

## Overview

This system uses **Tesseract OCR** (100% free) to automatically verify user IDs by:
1. Extracting text from ID images
2. Parsing the birthdate
3. Calculating age
4. Auto-approving users aged 60+ years
5. Auto-rejecting users under 60 years

## Prerequisites

### 1. Install Tesseract OCR

#### **Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-eng  # English language data
```

#### **macOS (Homebrew):**
```bash
brew install tesseract
```

#### **Windows:**
Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
- Install to `C:\Program Files\Tesseract-OCR\`
- Add to PATH

### 2. Download Tesseract Language Data

English trained data is required:
```bash
# Download eng.traineddata
wget https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata

# Place in tessdata folder
sudo mv eng.traineddata /usr/share/tesseract-ocr/4.00/tessdata/
```

### 3. Verify Installation

```bash
tesseract --version
# Should output: tesseract 4.x.x or higher
```

## Configuration

### Update Tesseract Data Path

In `IdVerificationServiceImpl.java`, update the tessdata path if needed:

```java
// Default path (Linux/Ubuntu)
tesseract.setDatapath("/usr/share/tesseract-ocr/4.00/tessdata");

// macOS (Homebrew)
tesseract.setDatapath("/opt/homebrew/share/tessdata");

// Windows
tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata");
```

## How It Works

### 1. User Uploads ID Photos

- **Required:** Front photo of government-issued ID
- **Optional:** Back photo (for backup extraction)

### 2. OCR Processing

```
Upload ID Image
      ↓
Tesseract OCR Extracts Text
      ↓
Parse Birthdate (MM/DD/YYYY, DD/MM/YYYY, etc.)
      ↓
Calculate Age
      ↓
Age >= 60?
   ├─ YES → Auto-APPROVE ✅ (idVerified = true)
   └─ NO  → Auto-REJECT ❌ (idVerified = false)
```

### 3. Supported ID Formats

The system recognizes Philippine ID formats:
- **Senior Citizen ID**
- **Driver's License**
- **Passport**
- **UMID**
- **SSS ID**
- **PhilHealth ID**

### 4. Birthdate Patterns Recognized

- `MM/DD/YYYY` (e.g., 01/15/1960)
- `DD/MM/YYYY` (e.g., 15/01/1960)
- `YYYY-MM-DD` (e.g., 1960-01-15)
- `Month DD, YYYY` (e.g., January 15, 1960)

## API Usage

### Endpoint: `POST /user/verify-id`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `username` (string, required): Username of the user to verify
- `idPhotoFront` (file, required): Front photo of ID (JPEG, PNG)
- `idPhotoBack` (file, optional): Back photo of ID

**Example using cURL:**
```bash
curl -X POST http://localhost:8080/user/verify-id \
  -F "username=john_doe" \
  -F "idPhotoFront=@front_id.jpg" \
  -F "idPhotoBack=@back_id.jpg"
```

**Success Response (Age >= 60):**
```json
{
  "message": "ID verification successful! Age: 65 years (verified)",
  "status": 200
}
```

**Failure Response (Age < 60):**
```json
{
  "message": "Age requirement not met. You must be at least 60 years old.",
  "status": 400
}
```

**Failure Response (OCR Failed):**
```json
{
  "message": "Could not extract birthdate from ID",
  "status": 400
}
```

## Database Schema

### New Columns in `login` table:

| Column | Type | Description |
|--------|------|-------------|
| `id_verified` | BOOLEAN | True if age >= 60 (auto-approved) |
| `id_verification_status` | VARCHAR(20) | PENDING, PROCESSING, APPROVED, REJECTED, FAILED |
| `extracted_birthdate` | DATE | Birthdate extracted from ID via OCR |
| `extracted_age` | INTEGER | Age calculated from birthdate |
| `id_photo_front_url` | VARCHAR(500) | Path to front ID photo |
| `id_photo_back_url` | VARCHAR(500) | Path to back ID photo |
| `verification_failure_reason` | VARCHAR(500) | Reason if verification failed |
| `verified_at` | TIMESTAMP | When verification was completed |

## Troubleshooting

### OCR Returns Empty Text

**Causes:**
- Image is blurry or low quality
- Poor lighting
- Text is too small
- ID is partially obscured

**Solutions:**
- Ask user to retake photo in good lighting
- Ensure ID is flat and fully visible
- Use higher resolution images (min 1000x1000px)

### Birthdate Not Found

**Causes:**
- OCR misreads numbers (e.g., "O" instead of "0")
- Birthdate format not recognized
- Birthdate is handwritten (hard to OCR)

**Solutions:**
- Add more date format patterns in `parseBirthdate()`
- Preprocess image (enhance contrast, denoise)
- Add manual review fallback

### Age Calculation Wrong

**Causes:**
- Date format ambiguity (MM/DD vs DD/MM)
- Timezone issues

**Solutions:**
- Prioritize MM/DD/YYYY for Philippine IDs
- Add validation for reasonable birth years (1900-current)

## Performance

- **Average OCR Time:** 1-3 seconds per image
- **Accuracy:** 85-95% for clear images
- **Cost:** 100% FREE (no API limits)

## Security

- ID photos should be stored securely (encrypted storage recommended)
- Implement rate limiting to prevent abuse
- Log all verification attempts for audit trail
- Delete ID photos after verification (GDPR compliance)

## Future Enhancements

1. **Face Matching:** Compare ID photo with selfie
2. **Image Quality Check:** Auto-reject blurry images
3. **Liveness Detection:** Video selfie to prevent fake IDs
4. **Multi-Language Support:** For other country IDs

## Support

For issues or questions, please refer to:
- Tesseract Documentation: https://tesseract-ocr.github.io/
- Tess4J GitHub: https://github.com/nguyenq/tess4j

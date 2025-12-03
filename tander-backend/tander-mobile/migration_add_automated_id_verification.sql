-- Migration script for automated ID verification fields
-- Run this script to add OCR-based ID verification columns

-- Step 1: Add ID verification status column
-- ALTER TABLE login ADD id_verification_status VARCHAR2(20) DEFAULT 'PENDING';

-- Step 2: Add extracted birthdate from OCR
-- ALTER TABLE login ADD extracted_birthdate TIMESTAMP(6);

-- Step 3: Add extracted age from OCR
-- ALTER TABLE login ADD extracted_age NUMBER(3);

-- Step 4: Add ID photo URLs
-- ALTER TABLE login ADD id_photo_front_url VARCHAR2(500);
-- ALTER TABLE login ADD id_photo_back_url VARCHAR2(500);

-- Step 5: Add verification failure reason
-- ALTER TABLE login ADD verification_failure_reason VARCHAR2(500);

-- Step 6: Add verified timestamp
-- ALTER TABLE login ADD verified_at TIMESTAMP(6);

-- Step 7: Update existing users to have PENDING status
UPDATE login
SET id_verification_status = 'PENDING'
WHERE id_verification_status IS NULL;

COMMIT;

-- Step 8: Verify the updates
SELECT username, email, profile_completed, id_verified, id_verification_status
FROM login;

-- Expected result:
-- - All users should have id_verification_status = 'PENDING'
-- - Automated OCR verification will process IDs and update to:
--   * 'APPROVED' if age >= 60
--   * 'REJECTED' if age < 60
--   * 'FAILED' if OCR cannot extract birthdate

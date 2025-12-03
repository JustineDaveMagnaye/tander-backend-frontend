-- Migration script for adding ID verification field
-- Run this script to add the id_verified column to the login table

-- Step 1: The id_verified column should be added by Hibernate automatically
-- If not, add it manually:
-- ALTER TABLE login ADD id_verified NUMBER(1,0) DEFAULT 0;

-- Step 2: Update existing users to mark them as not ID verified by default
-- New users will have id_verified = 0 (false) by default
UPDATE login
SET id_verified = 0
WHERE id_verified IS NULL;

COMMIT;

-- Step 3: Verify the update
SELECT username, email, profile_completed, id_verified
FROM login;

-- Expected result: All users should have id_verified = 0 (false) by default
-- Users will need to complete ID verification as phase 3 of registration

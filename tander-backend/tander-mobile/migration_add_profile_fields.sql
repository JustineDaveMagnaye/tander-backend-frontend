-- Migration script for adding 2-phase registration fields
-- Run this script to update existing user accounts

-- Step 1: The profileCompleted column should already be added by Hibernate
-- If not, add it manually:
-- ALTER TABLE login ADD profile_completed NUMBER(1,0) DEFAULT 0;

-- Step 2: The soft_deleted_at column should already be added by Hibernate
-- If not, add it manually:
-- ALTER TABLE login ADD soft_deleted_at TIMESTAMP(6);

-- Step 3: The profile_id column should already be added by Hibernate
-- If not, add it manually:
-- ALTER TABLE login ADD profile_id NUMBER(19,0);
-- ALTER TABLE login ADD CONSTRAINT UK3lnrbfcnb4dq037yd3gcend8m UNIQUE (profile_id);
-- ALTER TABLE login ADD CONSTRAINT FKe0ght7n5cjx8tnheha9mpn8l3 FOREIGN KEY (profile_id) REFERENCES profile(id);

-- Step 4: Update existing users to mark them as having completed profile registration
-- This assumes existing users are fully registered and should be able to login
UPDATE login
SET profile_completed = 1
WHERE profile_completed IS NULL OR profile_completed = 0;

COMMIT;

-- Step 5: Verify the update
SELECT username, email, profile_completed, soft_deleted_at
FROM login;

-- Expected result: All existing users should have profile_completed = 1

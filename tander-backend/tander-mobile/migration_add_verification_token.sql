-- Migration script for adding verification_token column to login table
-- This token is used to prevent ID spoofing during Phase 3 (ID verification)
-- Generated during Phase 2 (profile completion) and validated during Phase 3

-- Step 1: Add verification_token column
-- Hibernate should handle this automatically, but if manual migration is needed:
ALTER TABLE login ADD verification_token VARCHAR2(64);

-- Step 2: Generate tokens for existing users who have completed profiles but haven't verified IDs
-- This is optional - existing users will get tokens on next profile update
-- UPDATE login SET verification_token = SYS_GUID() WHERE profile_completed = 1 AND verification_token IS NULL;

-- Step 3: Verify the column was added
SELECT username, profile_completed, id_verified, verification_token
FROM login
WHERE profile_completed = 1;

COMMIT;

-- Note: verification_token is nullable and optional for backward compatibility
-- New registrations (Phase 2 onwards) will automatically generate tokens

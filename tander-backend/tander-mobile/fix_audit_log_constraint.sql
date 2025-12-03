-- Fix script for audit_log CHECK constraint violation
-- This script will identify and drop the problematic CHECK constraint

-- Step 1: Find all CHECK constraints on audit_log table
SELECT
    constraint_name,
    search_condition,
    status
FROM user_constraints
WHERE table_name = 'AUDIT_LOG'
  AND constraint_type = 'C'
  AND constraint_name LIKE 'SYS_C%';

-- Step 2: Drop the specific constraint causing the issue
-- Uncomment and run this after verifying the constraint name from Step 1
-- ALTER TABLE audit_log DROP CONSTRAINT SYS_C007886;

-- Step 3: If you want to recreate CHECK constraints properly, use these:
-- For event_type column (allows all enum values from AuditEventType)
-- ALTER TABLE audit_log ADD CONSTRAINT chk_event_type CHECK (
--     event_type IN (
--         'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT',
--         'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'PASSWORD_RESET_FAILURE',
--         'REGISTRATION_PHASE1_SUCCESS', 'REGISTRATION_PHASE1_FAILURE',
--         'REGISTRATION_PHASE2_SUCCESS', 'REGISTRATION_PHASE2_FAILURE',
--         'REGISTRATION_PHASE3_SUCCESS', 'REGISTRATION_PHASE3_FAILURE',
--         'OTP_SENT', 'OTP_VERIFICATION_SUCCESS', 'OTP_VERIFICATION_FAILURE',
--         'PROFILE_VIEW', 'PROFILE_UPDATE_SUCCESS', 'PROFILE_UPDATE_FAILURE', 'PROFILE_DELETE',
--         'CHAT_MESSAGE_SENT', 'CHAT_MESSAGE_RECEIVED', 'CHAT_MESSAGE_FAILED', 'CHAT_MESSAGE_DELETED',
--         'CHAT_CONVERSATION_STARTED', 'CHAT_CONVERSATION_ENDED',
--         'VIDEO_CALL_INITIATED', 'VIDEO_CALL_CONNECTED', 'VIDEO_CALL_FAILED',
--         'VIDEO_CALL_ENDED', 'VIDEO_CALL_REJECTED', 'VIDEO_CALL_MISSED',
--         'PROFILE_SWIPED_RIGHT', 'PROFILE_SWIPED_LEFT', 'PROFILE_SUPER_LIKED',
--         'MATCH_CREATED', 'MATCH_DELETED', 'UNMATCH',
--         'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'ACCOUNT_SOFT_DELETED', 'ACCOUNT_REACTIVATED'
--     )
-- );

-- For status column (allows all enum values from AuditStatus)
-- ALTER TABLE audit_log ADD CONSTRAINT chk_status CHECK (
--     status IN ('SUCCESS', 'FAILURE', 'PENDING', 'BLOCKED', 'ERROR')
-- );

-- Step 4: Verify the fix by attempting to insert a test record
-- INSERT INTO audit_log (
--     id, username, event_type, status, description, created_at
-- ) VALUES (
--     audit_log_seq.NEXTVAL, 'test', 'REGISTRATION_PHASE3_FAILURE', 'FAILURE',
--     'Test audit log entry', CURRENT_TIMESTAMP
-- );
-- ROLLBACK;

COMMIT;

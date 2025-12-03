-- Quick fix: Drop the problematic CHECK constraint
-- This will allow all enum values to be inserted into audit_log

-- Drop the constraint that's causing the issue
ALTER TABLE audit_log DROP CONSTRAINT SYS_C007886;

COMMIT;

-- Verify the constraint is dropped
SELECT constraint_name, constraint_type, search_condition
FROM user_constraints
WHERE table_name = 'AUDIT_LOG'
  AND constraint_type = 'C';

-- Expected: SYS_C007886 should not appear in the results

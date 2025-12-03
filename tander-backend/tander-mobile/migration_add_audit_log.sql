-- Migration script for creating audit_log table
-- Run this script to create the audit logging table
-- Note: If using Hibernate with ddl-auto: update, this table will be created automatically
-- This script is provided for manual creation or troubleshooting

-- Step 1: Create the audit_log table
-- (Skip if Hibernate has already created it)
CREATE TABLE audit_log (
    id NUMBER(19,0) NOT NULL,
    user_id NUMBER(19,0),
    username VARCHAR2(255 CHAR),
    event_type VARCHAR2(50 CHAR) NOT NULL,
    status VARCHAR2(20 CHAR) NOT NULL,
    entity_type VARCHAR2(100 CHAR),
    entity_id NUMBER(19,0),
    ip_address VARCHAR2(45 CHAR),
    user_agent VARCHAR2(500 CHAR),
    description VARCHAR2(1000 CHAR),
    old_value CLOB,
    new_value CLOB,
    error_message VARCHAR2(1000 CHAR),
    session_id VARCHAR2(255 CHAR),
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id)
);

-- Step 2: Create sequence for ID generation
-- (Skip if Hibernate has already created it)
CREATE SEQUENCE audit_log_seq START WITH 1 INCREMENT BY 1;

-- Step 3: Create indexes for better query performance
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_username ON audit_log(username);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_status ON audit_log(status);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_user_event ON audit_log(user_id, event_type);

-- Step 4: Verify table creation
SELECT COUNT(*) as audit_log_count FROM audit_log;

-- Expected result: 0 rows (empty table)

COMMIT;

-- Step 5: Test audit log insertion (optional)
-- INSERT INTO audit_log (
--     id, user_id, username, event_type, status, description, created_at
-- ) VALUES (
--     audit_log_seq.NEXTVAL, 1, 'testuser', 'LOGIN_SUCCESS', 'SUCCESS',
--     'Test audit log entry', CURRENT_TIMESTAMP
-- );
-- COMMIT;

-- Step 6: Query recent audit logs
-- SELECT id, username, event_type, status, description, created_at
-- FROM audit_log
-- ORDER BY created_at DESC
-- FETCH FIRST 10 ROWS ONLY;

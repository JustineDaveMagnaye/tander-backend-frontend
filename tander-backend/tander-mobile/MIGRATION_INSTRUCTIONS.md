# Database Migration Instructions for 2-Phase Registration

## Issue
The application failed to start because Hibernate tried to add a NOT NULL column (`profile_completed`) to a table with existing data. Oracle doesn't allow this operation.

## Solution Applied
1. Changed `profile_completed` field to be nullable at the database level (with default value `false`)
2. Existing users need to be marked as having completed their profiles

## Steps to Complete Migration

### Option 1: Automatic (Restart Application)
1. **Stop the application** if it's still running
2. **Restart the application** - Hibernate will now successfully add the new columns
3. **Run the migration script** (see Option 2, Step 2) to update existing users

### Option 2: Manual Migration
1. **Stop the application** if running
2. **Run the migration script**:
   ```sql
   sqlplus username/password@database @migration_add_profile_fields.sql
   ```
   Or execute the SQL commands from `migration_add_profile_fields.sql` in your Oracle SQL client

3. **Restart the application**

## What the Migration Does

### New Database Columns Added:
- `profile_completed` (NUMBER(1,0)) - Tracks if user completed phase 2 registration
- `soft_deleted_at` (TIMESTAMP) - Timestamp for soft-deleted accounts
- `profile_id` (NUMBER(19,0)) - Foreign key to Profile table

### Existing Users:
All existing users will be marked as `profile_completed = 1` (true), meaning they can log in immediately. This assumes they are fully registered users.

### New Users (After Migration):
- **Phase 1**: User registers with username/email/password → `profile_completed = 0`
- **Phase 2**: User completes profile → `profile_completed = 1`
- **Login**: Only allowed if `profile_completed = 1`

## Verification

After migration, verify the changes:

```sql
-- Check that all existing users have profile_completed = 1
SELECT username, email, profile_completed, soft_deleted_at, join_date
FROM login
ORDER BY join_date DESC;
```

## Rollback (If Needed)

If you need to rollback these changes:

```sql
-- Remove the added columns
ALTER TABLE login DROP CONSTRAINT FKe0ght7n5cjx8tnheha9mpn8l3;
ALTER TABLE login DROP CONSTRAINT UK3lnrbfcnb4dq037yd3gcend8m;
ALTER TABLE login DROP COLUMN profile_id;
ALTER TABLE login DROP COLUMN soft_deleted_at;
ALTER TABLE login DROP COLUMN profile_completed;
COMMIT;
```

## Support

If you encounter any issues during migration, check:
1. Database user has ALTER TABLE permissions
2. No active transactions are locking the login table
3. Application is fully stopped before running migration

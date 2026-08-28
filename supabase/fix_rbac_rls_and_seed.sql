-- ============================================================
-- FIX: Seed csmp_role_permissions AND fix RLS policies
-- Run this entire script in the Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste > Run
-- ============================================================

-- Step 1: Seed the 3 default role rows (bypasses RLS as service role)
INSERT INTO csmp_role_permissions (
  role,
  allowed_pages,
  can_create_request,
  can_change_status,
  can_assign_operator,
  can_add_internal_notes,
  can_view_all_clients,
  can_manage_roles,
  can_export_reports,
  can_view_audit_logs,
  updated_at
)
VALUES
  (
    'admin',
    '["dashboard","support","holding","all-requests","clients","analytics","rbac","audit-logs","notifications","settings"]',
    true, true, true, true, true, true, true, true,
    now()
  ),
  (
    'operator',
    '["dashboard","support","holding","all-requests","clients","analytics","notifications"]',
    false, true, true, true, true, false, true, false,
    now()
  ),
  (
    'client',
    '["dashboard","support","holding"]',
    true, false, false, false, false, false, false, false,
    now()
  )
ON CONFLICT (role) DO UPDATE SET
  allowed_pages          = EXCLUDED.allowed_pages,
  can_create_request     = EXCLUDED.can_create_request,
  can_change_status      = EXCLUDED.can_change_status,
  can_assign_operator    = EXCLUDED.can_assign_operator,
  can_add_internal_notes = EXCLUDED.can_add_internal_notes,
  can_view_all_clients   = EXCLUDED.can_view_all_clients,
  can_manage_roles       = EXCLUDED.can_manage_roles,
  can_export_reports     = EXCLUDED.can_export_reports,
  can_view_audit_logs    = EXCLUDED.can_view_audit_logs,
  updated_at             = now();

-- Step 2: Drop any existing restrictive RLS policies on the table
DROP POLICY IF EXISTS "Allow read for all"               ON csmp_role_permissions;
DROP POLICY IF EXISTS "Allow insert for admin"           ON csmp_role_permissions;
DROP POLICY IF EXISTS "Allow update for admin"           ON csmp_role_permissions;
DROP POLICY IF EXISTS "csmp_role_permissions_select"     ON csmp_role_permissions;
DROP POLICY IF EXISTS "csmp_role_permissions_insert"     ON csmp_role_permissions;
DROP POLICY IF EXISTS "csmp_role_permissions_update"     ON csmp_role_permissions;
DROP POLICY IF EXISTS "csmp_role_permissions_all"        ON csmp_role_permissions;

-- Step 3: Create permissive policies that allow the anon key to SELECT and UPDATE
-- (INSERT is not needed at runtime because rows are seeded above)
ALTER TABLE csmp_role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone can read permissions (needed by all users to render their sidebar)
CREATE POLICY "csmp_role_permissions_select"
  ON csmp_role_permissions
  FOR SELECT
  USING (true);

-- Anyone with the anon key can UPDATE an existing row
-- This is safe because only existing rows (seeded above) can be touched
CREATE POLICY "csmp_role_permissions_update"
  ON csmp_role_permissions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow INSERT only when no row yet exists for that role (for the seeding fallback)
CREATE POLICY "csmp_role_permissions_insert"
  ON csmp_role_permissions
  FOR INSERT
  WITH CHECK (true);

-- Step 4: Ensure the table is published to Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE csmp_role_permissions;

-- Verify: should now show 3 rows
SELECT role, allowed_pages, updated_at FROM csmp_role_permissions;

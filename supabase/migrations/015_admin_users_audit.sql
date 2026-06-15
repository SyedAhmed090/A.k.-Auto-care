-- Staff accounts, roles & audit log (#12). The shared ADMIN_SECRET login keeps
-- working (treated as role "owner") so no one is locked out; these tables add
-- optional per-user accounts on top. Run in the Supabase SQL editor.

-- ── Per-user admin accounts ──
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive email lookup at login.
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_lower_idx ON admin_users (lower(email));

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON admin_users;
CREATE POLICY "Service role only" ON admin_users USING (auth.role() = 'service_role');

-- ── Audit trail ──
CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_via     TEXT,                       -- 'secret' | 'user' | 'unknown'
  action        TEXT NOT NULL,              -- e.g. order.status_change, product.delete
  entity        TEXT,
  entity_id     TEXT,
  meta          JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON audit_log;
CREATE POLICY "Service role only" ON audit_log USING (auth.role() = 'service_role');

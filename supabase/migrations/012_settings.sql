-- Business settings: key/value JSON store for editable configuration
-- (shipping, tax, payment, store, social). Rows are written by the admin
-- Settings page. While empty, the app falls back to DEFAULT_SETTINGS in
-- lib/settings.ts, so launch behaviour is unchanged.
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service-role only: never readable/writable by the anon (public) client.
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON settings;
CREATE POLICY "Service role only" ON settings USING (auth.role() = 'service_role');

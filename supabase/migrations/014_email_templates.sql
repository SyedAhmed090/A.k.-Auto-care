-- Email templates (#13): editable subject + message body for transactional
-- order-status emails. While a row is absent the app falls back to
-- DEFAULT_TEMPLATES in lib/email-templates.ts, so launch behaviour is unchanged.
-- Run in the Supabase SQL editor.
CREATE TABLE IF NOT EXISTS email_templates (
  key        TEXT PRIMARY KEY,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service-role only: never readable/writable by the anon (public) client.
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON email_templates;
CREATE POLICY "Service role only" ON email_templates USING (auth.role() = 'service_role');

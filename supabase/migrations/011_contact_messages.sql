-- Contact form message inbox
-- Stores every contact submission so an inquiry is never lost if the email is missed.
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'handled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_status_idx  ON contact_messages(status);
CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages(created_at DESC);

-- Service-role only: never readable/writable by the anon (public) client.
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON contact_messages;
CREATE POLICY "Service role only" ON contact_messages USING (auth.role() = 'service_role');

-- Customer profiles + saved address, linked to Supabase Auth users.
-- Run in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  province    TEXT,
  postcode    TEXT,
  country     TEXT DEFAULT 'PK',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Each authenticated user can only see and edit their own row.
DROP POLICY IF EXISTS "own_profile_select" ON profiles;
CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "own_profile_insert" ON profiles;
CREATE POLICY "own_profile_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "own_profile_update" ON profiles;
CREATE POLICY "own_profile_update" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Invitations: the whole invitation (couple, events, envelope, guests…) is one JSON document.
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Guest replies
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  invite_id TEXT NOT NULL,
  guest_id TEXT,
  name TEXT NOT NULL,
  attending INTEGER NOT NULL,
  guests INTEGER NOT NULL DEFAULT 0,
  dietary TEXT,
  message TEXT,
  lang TEXT,
  source TEXT NOT NULL DEFAULT 'guest',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rsvps_invite ON rsvps(invite_id, created_at DESC);

-- Leads from the order form on the landing page
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

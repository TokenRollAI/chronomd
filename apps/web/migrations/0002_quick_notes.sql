-- Create quick_notes table for lightweight, ephemeral notes
CREATE TABLE IF NOT EXISTS quick_notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_archived INTEGER DEFAULT 0
);

-- Index for efficient timeline queries
CREATE INDEX IF NOT EXISTS idx_quick_notes_timeline
  ON quick_notes(is_archived, created_at DESC);

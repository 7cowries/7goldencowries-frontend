-- Add url column to quests table if it does not exist
ALTER TABLE quests ADD COLUMN IF NOT EXISTS url TEXT;

-- Backfill urls for existing quests
UPDATE quests SET url='https://x.com/7goldencowries' WHERE id=1 AND (url IS NULL OR url='');
UPDATE quests SET url='https://x.com/7goldencowries/status/194759' WHERE id=2 AND (url IS NULL OR url='');
UPDATE quests SET url='https://x.com/7goldencowries/status/194759' WHERE id=3 AND (url IS NULL OR url='');
UPDATE quests SET url='https://t.me/7goldencowries' WHERE id=4 AND (url IS NULL OR url='');
UPDATE quests SET url='/quests/onchain' WHERE id=5 AND (url IS NULL OR url='');

-- Seed daily quests (ids 41 and 42)
INSERT OR IGNORE INTO quests (id, title, type, xp, url, active)
VALUES
  (41, 'Sample Daily Quest A', 'link', 20, 'https://example.com/daily1', 1),
  (42, 'Sample Daily Quest B', 'link', 30, 'https://example.com/daily2', 1);

-- Add agenda_number column if it doesn't exist
ALTER TABLE letters ADD COLUMN IF NOT EXISTS agenda_number SERIAL;

-- Note: SERIAL makes it auto-increment, but for specific logic (like resetting every year), 
-- we might want to handle it in application logic or a trigger.
-- For now, let's keep it simple: Just an integer column. 
-- Assuming we want to control it manually via application logic (Max + 1):
ALTER TABLE letters ALTER COLUMN agenda_number DROP DEFAULT;
ALTER TABLE letters ALTER COLUMN agenda_number TYPE INTEGER;

-- Optional: Backfill existing records with sequential numbers matching created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM letters
  WHERE agenda_number IS NULL
)
UPDATE letters
SET agenda_number = numbered.rn
FROM numbered
WHERE letters.id = numbered.id;

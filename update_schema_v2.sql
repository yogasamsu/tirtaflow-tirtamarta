-- Add recommended_pic column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'letters' AND column_name = 'recommended_pic') THEN
        ALTER TABLE letters ADD COLUMN recommended_pic text;
    END IF;
END $$;

-- Enable DELETE policy for letters
-- Dropping existing policy if exists to avoid conflicts (optional but safer for re-runs)
DROP POLICY IF EXISTS "Only 'umum' and 'admin' can delete letters" ON letters;

CREATE POLICY "Only 'umum' and 'admin' can delete letters"
  ON letters FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('umum', 'admin')
    )
  );

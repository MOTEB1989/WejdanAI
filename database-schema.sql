-- WejdanAI Database Schema Migration
-- Run this script on your PostgreSQL database to set up the models table and link it to logs

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create logs table if it doesn't exist (may already exist)
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add model_id column to link logs to models
-- This will fail if the column already exists, which is fine
DO $$
BEGIN
  BEGIN
    ALTER TABLE logs ADD COLUMN model_id INT REFERENCES models(id) ON DELETE SET NULL;
  EXCEPTION
    WHEN duplicate_column THEN
      RAISE NOTICE 'Column model_id already exists in logs table';
  END;
END
$$;

-- Insert some sample models for testing
INSERT INTO models (name, version, description) VALUES 
  ('GPT-4', '4.0', 'OpenAI GPT-4 model'),
  ('Claude-3', '3.0', 'Anthropic Claude-3 model'),
  ('Gemini Pro', '1.0', 'Google Gemini Pro model')
ON CONFLICT DO NOTHING;

-- Display the current models
SELECT * FROM models ORDER BY created_at DESC;
-- 20260827000009_diversity_metrics.sql

-- Add demographic fields to candidates
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT;

-- Add demographic and flight risk fields to employees
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS flight_risk_score NUMERIC,
ADD COLUMN IF NOT EXISTS flight_risk_reason TEXT;

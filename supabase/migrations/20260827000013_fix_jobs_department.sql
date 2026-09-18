-- Add missing department column (local initial schema was modified after apply)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS department TEXT;

-- Drop department_id if it exists to clean up
ALTER TABLE public.jobs DROP COLUMN IF EXISTS department_id;

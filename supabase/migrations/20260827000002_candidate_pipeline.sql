-- Candidate Pipeline and Resumes Schema

CREATE TYPE pipeline_stage AS ENUM (
    'APPLIED',
    'AI_REVIEWED',
    'RECRUITER_REVIEW',
    'SHORTLISTED',
    'SCREENING_CALL',
    'INTERVIEW',
    'OFFER_APPROVAL',
    'OFFER_SENT',
    'OFFER_ACCEPTED',
    'JOINED',
    'REJECTED',
    'WITHDRAWN'
);

-- Candidate Applications Table
CREATE TABLE public.candidate_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    stage pipeline_stage DEFAULT 'APPLIED',
    fit_score NUMERIC,
    eligibility_status TEXT DEFAULT 'PENDING',
    recruiter_owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(candidate_id, job_id)
);

-- Resumes Table
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    parsed_text TEXT,
    parsing_status TEXT DEFAULT 'PENDING',
    parsing_confidence NUMERIC,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_candidate_apps_updated_at 
BEFORE UPDATE ON public.candidate_applications 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Note: We assume the storage bucket "resumes" is created either via the dashboard or a separate storage seed script.
-- If running locally, you can create it via:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

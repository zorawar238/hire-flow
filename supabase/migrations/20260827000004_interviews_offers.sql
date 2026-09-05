-- Interviews and Offers Schema

CREATE TYPE interview_status AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);

CREATE TYPE offer_status AS ENUM (
    'DRAFT',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
);

-- Interviews Table
CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    status interview_status DEFAULT 'SCHEDULED',
    feedback_notes TEXT,
    feedback_score INTEGER, -- 1 to 5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Offers Table
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
    base_salary NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    equity_details TEXT,
    signing_bonus NUMERIC,
    start_date DATE,
    status offer_status DEFAULT 'DRAFT',
    offer_document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_interviews_updated_at 
BEFORE UPDATE ON public.interviews 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_offers_updated_at 
BEFORE UPDATE ON public.offers 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;


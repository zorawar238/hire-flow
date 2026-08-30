-- Preboarding and Employee Conversion Schema

CREATE TYPE task_type AS ENUM ('CANDIDATE', 'INTERNAL');
CREATE TYPE task_status AS ENUM ('PENDING', 'COMPLETED');
CREATE TYPE doc_status AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'REJECTED');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'ON_LEAVE', 'SEPARATED');

-- Onboarding Tasks
CREATE TABLE public.onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type task_type DEFAULT 'INTERNAL',
    status task_status DEFAULT 'PENDING',
    due_date DATE,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL, -- for internal tasks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Candidate Documents
CREATE TABLE public.candidate_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status doc_status DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Employees
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
    employee_code TEXT,
    department TEXT,
    designation TEXT,
    joining_date DATE,
    status employee_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_onboarding_tasks_updated_at 
BEFORE UPDATE ON public.onboarding_tasks 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_candidate_documents_updated_at 
BEFORE UPDATE ON public.candidate_documents 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
BEFORE UPDATE ON public.employees 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

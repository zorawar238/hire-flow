-- Separation Management Schema

CREATE TYPE separation_type AS ENUM ('RESIGNATION', 'TERMINATION');
CREATE TYPE separation_status AS ENUM ('PENDING', 'APPROVED', 'COMPLETED');
CREATE TYPE offboarding_task_status AS ENUM ('PENDING', 'COMPLETED');

-- Separations Table
CREATE TABLE public.separations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    type separation_type NOT NULL,
    reason TEXT,
    last_working_day DATE NOT NULL,
    status separation_status DEFAULT 'PENDING',
    initiated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Offboarding Tasks Table
CREATE TABLE public.offboarding_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    separation_id UUID REFERENCES public.separations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type task_type DEFAULT 'INTERNAL', -- reusing task_type from preboarding (CANDIDATE/INTERNAL) but here Candidate means Employee
    status offboarding_task_status DEFAULT 'PENDING',
    due_date DATE,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_separations_updated_at 
BEFORE UPDATE ON public.separations 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_offboarding_tasks_updated_at 
BEFORE UPDATE ON public.offboarding_tasks 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.separations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_tasks ENABLE ROW LEVEL SECURITY;

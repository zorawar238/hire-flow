-- Create Departments Table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    head_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_org_dept_name UNIQUE(organization_id, name)
);

-- Create Team Invitations Table
CREATE TABLE public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'RECRUITER',
    status TEXT DEFAULT 'PENDING',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add triggers
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON public.team_invitations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add department_id to users and jobs
ALTER TABLE public.users ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- Migrate existing departments
INSERT INTO public.departments (organization_id, name)
SELECT DISTINCT organization_id, department FROM public.users WHERE department IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.departments (organization_id, name)
SELECT DISTINCT organization_id, department FROM public.jobs WHERE department IS NOT NULL
ON CONFLICT DO NOTHING;

UPDATE public.users u
SET department_id = d.id
FROM public.departments d
WHERE u.organization_id = d.organization_id AND u.department = d.name;

UPDATE public.jobs j
SET department_id = d.id
FROM public.departments d
WHERE j.organization_id = d.organization_id AND j.department = d.name;

-- Drop old columns
ALTER TABLE public.users DROP COLUMN department;
ALTER TABLE public.jobs DROP COLUMN department;

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Basic MVP RLS Policies
CREATE POLICY "Allow authenticated all on departments" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all on team_invitations" ON public.team_invitations FOR ALL TO authenticated USING (true) WITH CHECK (true);

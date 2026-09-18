-- Add missing RLS policies for candidate_applications and resumes

-- candidate_applications
CREATE POLICY "Candidate applications viewable by org members" ON public.candidate_applications FOR SELECT TO authenticated
USING (
  job_id IN (SELECT id FROM public.jobs WHERE organization_id = get_user_organization())
  OR get_user_role() = 'SUPER_ADMIN'
);

CREATE POLICY "Candidate applications writable by specific roles" ON public.candidate_applications FOR ALL TO authenticated
USING (
  (job_id IN (SELECT id FROM public.jobs WHERE organization_id = get_user_organization()) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  (job_id IN (SELECT id FROM public.jobs WHERE organization_id = get_user_organization()) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
);

-- resumes
CREATE POLICY "Resumes viewable by org members" ON public.resumes FOR SELECT TO authenticated
USING (
  candidate_id IN (SELECT id FROM public.candidates WHERE organization_id = get_user_organization())
  OR get_user_role() = 'SUPER_ADMIN'
);

CREATE POLICY "Resumes writable by specific roles" ON public.resumes FOR ALL TO authenticated
USING (
  (candidate_id IN (SELECT id FROM public.candidates WHERE organization_id = get_user_organization()) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  (candidate_id IN (SELECT id FROM public.candidates WHERE organization_id = get_user_organization()) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
);

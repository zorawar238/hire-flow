-- Missing RLS Policies for interviews, onboarding_tasks, candidate_documents, employees

-- 1. interviews
CREATE POLICY "Interviews viewable by org members" ON public.interviews FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  )
  OR get_user_role() = 'SUPER_ADMIN'
);

CREATE POLICY "Interviews writable by specific roles" ON public.interviews FOR ALL TO authenticated
USING (
  (application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  ) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  (application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  ) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
);

-- 2. onboarding_tasks
CREATE POLICY "Onboarding tasks viewable by org members" ON public.onboarding_tasks FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  )
  OR get_user_role() = 'SUPER_ADMIN'
);

CREATE POLICY "Onboarding tasks writable by specific roles" ON public.onboarding_tasks FOR ALL TO authenticated
USING (
  (application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  ) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN', 'HR_HEAD')) 
  OR get_user_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  (application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  ) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN', 'HR_HEAD')) 
  OR get_user_role() = 'SUPER_ADMIN'
);

-- 3. candidate_documents
CREATE POLICY "Candidate documents viewable by org members" ON public.candidate_documents FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  )
  OR get_user_role() = 'SUPER_ADMIN'
);

CREATE POLICY "Candidate documents writable by specific roles" ON public.candidate_documents FOR ALL TO authenticated
USING (
  (application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  ) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN', 'HR_HEAD')) 
  OR get_user_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  (application_id IN (
    SELECT ca.id FROM public.candidate_applications ca
    JOIN public.jobs j ON ca.job_id = j.id
    WHERE j.organization_id = get_user_organization()
  ) AND get_user_role() IN ('RECRUITER', 'ORG_ADMIN', 'HR_HEAD')) 
  OR get_user_role() = 'SUPER_ADMIN'
);

-- 4. employees
CREATE POLICY "Employees viewable by org members" ON public.employees FOR SELECT TO authenticated
USING (
  organization_id = get_user_organization()
  OR get_user_role() = 'SUPER_ADMIN'
);

CREATE POLICY "Employees writable by HR" ON public.employees FOR ALL TO authenticated
USING (
  (organization_id = get_user_organization() AND get_user_role() IN ('HR_HEAD', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  (organization_id = get_user_organization() AND get_user_role() IN ('HR_HEAD', 'ORG_ADMIN')) 
  OR get_user_role() = 'SUPER_ADMIN'
);

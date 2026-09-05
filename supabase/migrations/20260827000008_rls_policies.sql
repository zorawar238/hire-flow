-- Basic MVP RLS Policies to allow authenticated users to interact with tables

-- Organizations
CREATE POLICY "Allow authenticated all on organizations" ON public.organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Users
CREATE POLICY "Allow authenticated all on users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Jobs
CREATE POLICY "Allow authenticated all on jobs" ON public.jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Candidates
CREATE POLICY "Allow authenticated all on candidates" ON public.candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Performance Goals
CREATE POLICY "Allow authenticated all on performance_goals" ON public.performance_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Performance Reviews
CREATE POLICY "Allow authenticated all on performance_reviews" ON public.performance_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Employee Feedback
CREATE POLICY "Allow authenticated all on employee_feedback" ON public.employee_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Meeting Notes
CREATE POLICY "Allow authenticated all on meeting_notes" ON public.meeting_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Career Paths
CREATE POLICY "Allow authenticated all on career_paths" ON public.career_paths FOR ALL TO authenticated USING (true) WITH CHECK (true);

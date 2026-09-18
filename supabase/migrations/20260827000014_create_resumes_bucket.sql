-- Create the resumes bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false) 
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload resumes (since applicants are not logged in)
CREATE POLICY "Allow public resume uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'resumes');

-- Allow authenticated HR users to view resumes
CREATE POLICY "Allow authenticated resume viewing" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'resumes');

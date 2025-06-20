-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public access
CREATE POLICY "Public upload access" ON storage.objects 
FOR INSERT TO public 
WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "Public download access" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'project-files');

CREATE POLICY "Public delete access" ON storage.objects 
FOR DELETE TO public 
USING (bucket_id = 'project-files');
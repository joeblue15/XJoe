-- Crear bucket de Storage para thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política de acceso público para lectura
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Política de acceso para admin (subida)
CREATE POLICY "Admin upload access" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' AND 
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_emails)
);

-- Política de acceso para admin (borrado)
CREATE POLICY "Admin delete access" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND 
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_emails)
);

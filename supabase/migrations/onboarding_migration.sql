-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Try to create enum, ignore if exists
DO $$ BEGIN
    CREATE TYPE vendor_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alter vendor_profiles
ALTER TABLE vendor_profiles 
  ALTER COLUMN status TYPE vendor_status USING status::vendor_status;

ALTER TABLE vendor_profiles
  ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('individual','partnership','pvt_ltd','llp','other')),
  ADD COLUMN IF NOT EXISTS category TEXT[],
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS gstin_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

ALTER TABLE vendor_profiles
  ALTER COLUMN status SET DEFAULT 'pending';

-- Create vendor_documents
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('gstin_certificate','pan_card','cancelled_cheque','business_registration','address_proof','other')),
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendor_profiles_updated_at ON vendor_profiles;
CREATE TRIGGER vendor_profiles_updated_at
  BEFORE UPDATE ON vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;

-- Vendor can read/write own profile
DROP POLICY IF EXISTS vendor_own_profile ON vendor_profiles;
CREATE POLICY vendor_own_profile ON vendor_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Admin can read/write all profiles (using role in jwt)
DROP POLICY IF EXISTS admin_all_profiles ON vendor_profiles;
CREATE POLICY admin_all_profiles ON vendor_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Vendors manage own docs
DROP POLICY IF EXISTS vendor_own_docs ON vendor_documents;
CREATE POLICY vendor_own_docs ON vendor_documents
  FOR ALL USING (
    vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid())
  );

-- Admins read all docs
DROP POLICY IF EXISTS admin_all_docs ON vendor_documents;
CREATE POLICY admin_all_docs ON vendor_documents
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Also create the storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-docs', 'vendor-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS (Bucket: vendor-docs)
DROP POLICY IF EXISTS "Vendors can upload their docs" ON storage.objects;
CREATE POLICY "Vendors can upload their docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vendor-docs' AND (auth.uid() = (SELECT user_id FROM vendor_profiles WHERE id::text = (string_to_array(name, '/'))[1])));

DROP POLICY IF EXISTS "Vendors can read their docs" ON storage.objects;
CREATE POLICY "Vendors can read their docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vendor-docs' AND (auth.uid() = (SELECT user_id FROM vendor_profiles WHERE id::text = (string_to_array(name, '/'))[1])));

DROP POLICY IF EXISTS "Admins can read all docs" ON storage.objects;
CREATE POLICY "Admins can read all docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vendor-docs' AND auth.jwt() ->> 'role' = 'admin');

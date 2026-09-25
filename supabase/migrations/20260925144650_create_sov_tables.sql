/*
# Create S.O.V tables with user isolation

## Overview
Creates the core tables for the S.O.V (Serviço de Oftalmologia Veterinária) application:
patients, consultations, and eye_photos. Each table is scoped to the authenticated user
via user_id with RLS policies, so every login sees only its own prontuário.

## New Tables

### 1. patients
- id (uuid, PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid() — owner of the record)
- name (text, NOT NULL)
- species (text)
- breed (text)
- sex (text)
- age (text)
- weight (text)
- owner_name (text)
- owner_phone (text)
- owner_email (text)
- notes (text)
- created_at (timestamptz)

### 2. consultations
- id (uuid, PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid())
- patient_id (uuid, FK → patients.id ON DELETE CASCADE)
- date (date, NOT NULL)
- history (text)
- od (jsonb — eye exam right)
- oe (jsonb — eye exam left)
- diagnosis (text)
- treatment (text)
- return_date (date)
- created_at (timestamptz)

### 3. eye_photos
- id (uuid, PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid())
- patient_id (uuid, FK → patients.id ON DELETE CASCADE)
- consultation_id (uuid, nullable, FK → consultations.id ON DELETE SET NULL)
- side (text — 'OD' or 'OE')
- storage_path (text — path in Supabase Storage)
- created_at (timestamptz)

## Security
- RLS enabled on all three tables.
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE), scoped TO authenticated
  with auth.uid() = user_id ownership checks.
- user_id columns default to auth.uid() so inserts omitting user_id succeed.
*/

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text DEFAULT '',
  breed text DEFAULT '',
  sex text DEFAULT '',
  age text DEFAULT '',
  weight text DEFAULT '',
  owner_name text DEFAULT '',
  owner_phone text DEFAULT '',
  owner_email text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_patients" ON patients;
CREATE POLICY "select_own_patients" ON patients FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_patients" ON patients;
CREATE POLICY "insert_own_patients" ON patients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_patients" ON patients;
CREATE POLICY "update_own_patients" ON patients FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_patients" ON patients;
CREATE POLICY "delete_own_patients" ON patients FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Consultations
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  history text DEFAULT '',
  od jsonb DEFAULT '{}',
  oe jsonb DEFAULT '{}',
  diagnosis text DEFAULT '',
  treatment text DEFAULT '',
  return_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_consultations" ON consultations;
CREATE POLICY "select_own_consultations" ON consultations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_consultations" ON consultations;
CREATE POLICY "insert_own_consultations" ON consultations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_consultations" ON consultations;
CREATE POLICY "update_own_consultations" ON consultations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_consultations" ON consultations;
CREATE POLICY "delete_own_consultations" ON consultations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Eye photos
CREATE TABLE IF NOT EXISTS eye_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id uuid REFERENCES consultations(id) ON DELETE SET NULL,
  side text DEFAULT '',
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE eye_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_eye_photos" ON eye_photos;
CREATE POLICY "select_own_eye_photos" ON eye_photos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_eye_photos" ON eye_photos;
CREATE POLICY "insert_own_eye_photos" ON eye_photos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_eye_photos" ON eye_photos;
CREATE POLICY "update_own_eye_photos" ON eye_photos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_eye_photos" ON eye_photos;
CREATE POLICY "delete_own_eye_photos" ON eye_photos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_eye_photos_patient_id ON eye_photos(patient_id);
CREATE INDEX IF NOT EXISTS idx_eye_photos_consultation_id ON eye_photos(consultation_id);

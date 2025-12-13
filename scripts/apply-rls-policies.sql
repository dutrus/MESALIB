-- Script SQL para aplicar políticas RLS básicas en Supabase
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- ============================================================================
-- HABILITAR RLS EN TABLAS PRINCIPALES
-- ============================================================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA matches
-- ============================================================================

-- Eliminar políticas existentes si existen (opcional, para evitar duplicados)
DROP POLICY IF EXISTS "therapists_can_view_their_matches" ON matches;
DROP POLICY IF EXISTS "therapists_can_update_their_matches" ON matches;
DROP POLICY IF EXISTS "patients_can_view_their_matches" ON matches;
DROP POLICY IF EXISTS "allow_match_creation" ON matches;

-- Terapeutas pueden ver sus matches
CREATE POLICY "therapists_can_view_their_matches"
ON matches FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = matches.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
);

-- Terapeutas pueden actualizar sus matches
CREATE POLICY "therapists_can_update_their_matches"
ON matches FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = matches.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = matches.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
);

-- Pacientes pueden ver sus matches
CREATE POLICY "patients_can_view_their_matches"
ON matches FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE patient_profiles.id = matches.patient_id
    AND patient_profiles.user_id = auth.uid()
  )
);

-- Permitir creación de matches (para el sistema/matching automático)
CREATE POLICY "allow_match_creation"
ON matches FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- POLÍTICAS PARA patient_profiles
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "patients_can_view_own_profile" ON patient_profiles;
DROP POLICY IF EXISTS "allow_patient_profiles_for_matching" ON patient_profiles;
DROP POLICY IF EXISTS "patients_can_insert_own_profile" ON patient_profiles;
DROP POLICY IF EXISTS "patients_can_update_own_profile" ON patient_profiles;

-- Pacientes pueden ver su propio perfil
CREATE POLICY "patients_can_view_own_profile"
ON patient_profiles FOR SELECT
USING (user_id = auth.uid());

-- Permitir ver perfiles para matching (terapeutas y sistema)
CREATE POLICY "allow_patient_profiles_for_matching"
ON patient_profiles FOR SELECT
USING (true);

-- Pacientes pueden crear su propio perfil
CREATE POLICY "patients_can_insert_own_profile"
ON patient_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Pacientes pueden actualizar su propio perfil
CREATE POLICY "patients_can_update_own_profile"
ON patient_profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- POLÍTICAS PARA therapist_profiles
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "therapists_can_view_own_profile" ON therapist_profiles;
DROP POLICY IF EXISTS "allow_therapist_profiles_for_matching" ON therapist_profiles;
DROP POLICY IF EXISTS "therapists_can_insert_own_profile" ON therapist_profiles;
DROP POLICY IF EXISTS "therapists_can_update_own_profile" ON therapist_profiles;

-- Terapeutas pueden ver su propio perfil
CREATE POLICY "therapists_can_view_own_profile"
ON therapist_profiles FOR SELECT
USING (user_id = auth.uid());

-- Permitir ver perfiles para matching
CREATE POLICY "allow_therapist_profiles_for_matching"
ON therapist_profiles FOR SELECT
USING (true);

-- Terapeutas pueden crear su propio perfil
CREATE POLICY "therapists_can_insert_own_profile"
ON therapist_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Terapeutas pueden actualizar su propio perfil
CREATE POLICY "therapists_can_update_own_profile"
ON therapist_profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());






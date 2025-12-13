-- Script SQL para crear todas las tablas faltantes en Supabase
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- ============================================================================
-- TABLA: sessions
-- Para agendar y gestionar sesiones de terapia
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 60,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist_id ON sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_match_id ON sessions(match_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_time ON sessions(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();

-- ============================================================================
-- TABLA: mood_entries
-- Para registrar estados de ánimo de pacientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  mood VARCHAR(10) NOT NULL CHECK (mood IN ('good', 'okay', 'bad')),
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, date) -- Un registro por día por paciente
);

CREATE INDEX IF NOT EXISTS idx_mood_entries_patient_id ON mood_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date DESC);

-- ============================================================================
-- TABLA: messages
-- Para mensajería entre paciente y terapeuta
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- user_id del remitente
  receiver_id UUID NOT NULL, -- user_id del receptor
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- TABLA: clinical_notes
-- Para notas clínicas del terapeuta
-- ============================================================================
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient_id ON clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_therapist_id ON clinical_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_session_id ON clinical_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_created_at ON clinical_notes(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_clinical_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinical_notes_updated_at
  BEFORE UPDATE ON clinical_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_notes_updated_at();

-- ============================================================================
-- TABLA: community_posts
-- Para posts de la comunidad
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  needs TEXT[], -- Array de necesidades relacionadas
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_needs ON community_posts USING GIN(needs);

-- ============================================================================
-- TABLA: resources
-- Para recursos educativos
-- ============================================================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50), -- 'article', 'video', 'exercise'
  category VARCHAR(100),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- ============================================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS BÁSICAS PARA sessions
-- ============================================================================
-- Pacientes pueden ver sus propias sesiones
CREATE POLICY "patients_can_view_own_sessions"
ON sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE patient_profiles.id = sessions.patient_id
    AND patient_profiles.user_id = auth.uid()
  )
);

-- Terapeutas pueden ver sesiones de sus pacientes
CREATE POLICY "therapists_can_view_their_sessions"
ON sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = sessions.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
);

-- Terapeutas pueden crear sesiones
CREATE POLICY "therapists_can_create_sessions"
ON sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = sessions.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
);

-- Terapeutas pueden actualizar sus sesiones
CREATE POLICY "therapists_can_update_their_sessions"
ON sessions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = sessions.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = sessions.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- POLÍTICAS RLS BÁSICAS PARA mood_entries
-- ============================================================================
-- Pacientes pueden ver y crear sus propios registros de ánimo
CREATE POLICY "patients_can_manage_own_mood_entries"
ON mood_entries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE patient_profiles.id = mood_entries.patient_id
    AND patient_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE patient_profiles.id = mood_entries.patient_id
    AND patient_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- POLÍTICAS RLS BÁSICAS PARA messages
-- ============================================================================
-- Usuarios pueden ver mensajes donde son remitente o receptor
CREATE POLICY "users_can_view_own_messages"
ON messages FOR SELECT
USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Usuarios pueden crear mensajes donde son remitente
CREATE POLICY "users_can_send_messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Usuarios pueden marcar como leídos mensajes donde son receptor
CREATE POLICY "users_can_update_received_messages"
ON messages FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- ============================================================================
-- POLÍTICAS RLS BÁSICAS PARA clinical_notes
-- ============================================================================
-- Terapeutas pueden ver y crear notas de sus pacientes
CREATE POLICY "therapists_can_manage_their_notes"
ON clinical_notes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = clinical_notes.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = clinical_notes.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- POLÍTICAS RLS BÁSICAS PARA community_posts
-- ============================================================================
-- Cualquiera autenticado puede ver posts
CREATE POLICY "authenticated_can_view_posts"
ON community_posts FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Pacientes pueden crear sus propios posts
CREATE POLICY "patients_can_create_posts"
ON community_posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE patient_profiles.id = community_posts.author_id
    AND patient_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- POLÍTICAS RLS BÁSICAS PARA resources
-- ============================================================================
-- Cualquiera autenticado puede ver recursos
CREATE POLICY "authenticated_can_view_resources"
ON resources FOR SELECT
USING (auth.uid() IS NOT NULL);






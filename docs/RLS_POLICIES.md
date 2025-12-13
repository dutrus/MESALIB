# Políticas RLS (Row Level Security) para Supabase

Este documento describe las políticas RLS necesarias para que el sistema funcione correctamente.

## Tabla: `matches`

### Política 1: Permitir SELECT de matches para terapeutas
**Nombre:** `therapists_can_view_their_matches`
**Tipo:** SELECT
**Definición:**
```sql
CREATE POLICY "therapists_can_view_their_matches"
ON matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM therapist_profiles
    WHERE therapist_profiles.id = matches.therapist_id
    AND therapist_profiles.user_id = auth.uid()
  )
);
```

### Política 2: Permitir UPDATE de matches para terapeutas (solo sus matches)
**Nombre:** `therapists_can_update_their_matches`
**Tipo:** UPDATE
**Definición:**
```sql
CREATE POLICY "therapists_can_update_their_matches"
ON matches
FOR UPDATE
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
```

### Política 3: Permitir SELECT de matches para pacientes
**Nombre:** `patients_can_view_their_matches`
**Tipo:** SELECT
**Definición:**
```sql
CREATE POLICY "patients_can_view_their_matches"
ON matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patient_profiles
    WHERE patient_profiles.id = matches.patient_id
    AND patient_profiles.user_id = auth.uid()
  )
);
```

### Política 4: Permitir INSERT de matches (para admins o sistema)
**Nombre:** `allow_match_creation`
**Tipo:** INSERT
**Definición:**
```sql
CREATE POLICY "allow_match_creation"
ON matches
FOR INSERT
WITH CHECK (true);
```

**Nota:** Esta política permite a cualquier usuario autenticado crear matches. Si quieres restringirlo solo a admins, puedes usar:
```sql
CREATE POLICY "allow_match_creation"
ON matches
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);
```

## Tabla: `patient_profiles`

### Política 1: Permitir SELECT de su propio perfil
**Nombre:** `patients_can_view_own_profile`
**Tipo:** SELECT
**Definición:**
```sql
CREATE POLICY "patients_can_view_own_profile"
ON patient_profiles
FOR SELECT
USING (user_id = auth.uid());
```

### Política 2: Permitir SELECT para matching (terapeutas y admins)
**Nombre:** `allow_patient_profiles_for_matching`
**Tipo:** SELECT
**Definición:**
```sql
CREATE POLICY "allow_patient_profiles_for_matching"
ON patient_profiles
FOR SELECT
USING (true);
```

**Nota:** Esta política permite a cualquier usuario autenticado ver perfiles de pacientes para matching. Si quieres restringirlo, puedes usar políticas más específicas.

### Política 3: Permitir INSERT de su propio perfil
**Nombre:** `patients_can_insert_own_profile`
**Tipo:** INSERT
**Definición:**
```sql
CREATE POLICY "patients_can_insert_own_profile"
ON patient_profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());
```

### Política 4: Permitir UPDATE de su propio perfil
**Nombre:** `patients_can_update_own_profile`
**Tipo:** UPDATE
**Definición:**
```sql
CREATE POLICY "patients_can_update_own_profile"
ON patient_profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## Tabla: `therapist_profiles`

### Política 1: Permitir SELECT de su propio perfil
**Nombre:** `therapists_can_view_own_profile`
**Tipo:** SELECT
**Definición:**
```sql
CREATE POLICY "therapists_can_view_own_profile"
ON therapist_profiles
FOR SELECT
USING (user_id = auth.uid());
```

### Política 2: Permitir SELECT para matching
**Nombre:** `allow_therapist_profiles_for_matching`
**Tipo:** SELECT
**Definición:**
```sql
CREATE POLICY "allow_therapist_profiles_for_matching"
ON therapist_profiles
FOR SELECT
USING (true);
```

### Política 3: Permitir INSERT de su propio perfil
**Nombre:** `therapists_can_insert_own_profile`
**Tipo:** INSERT
**Definición:**
```sql
CREATE POLICY "therapists_can_insert_own_profile"
ON therapist_profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());
```

### Política 4: Permitir UPDATE de su propio perfil
**Nombre:** `therapists_can_update_own_profile`
**Tipo:** UPDATE
**Definición:**
```sql
CREATE POLICY "therapists_can_update_own_profile"
ON therapist_profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## Cómo aplicar estas políticas

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** → **Policies** o **Table Editor** → Selecciona la tabla → **Policies**
3. Para cada tabla, haz clic en **New Policy**
4. Copia y pega las políticas SQL correspondientes
5. Asegúrate de que RLS está habilitado en cada tabla (debería estar por defecto)

## Verificar que RLS está habilitado

Para cada tabla, ejecuta:
```sql
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
```

## Solución rápida (solo para desarrollo/testing)

Si necesitas una solución rápida para testing, puedes temporalmente deshabilitar RLS:

```sql
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profiles DISABLE ROW LEVEL SECURITY;
```

**⚠️ ADVERTENCIA:** Solo haz esto en desarrollo. NUNCA deshabilites RLS en producción.











# Scripts de Utilidad

## seed-mock-users.ts

Script para crear usuarios mock (pacientes y terapeutas) para probar el sistema de matching.

### Requisitos

1. **Service Role Key de Supabase**: Necesitas obtener la Service Role Key desde tu proyecto de Supabase:
   - Ve a tu proyecto en Supabase Dashboard
   - Settings → API
   - Copia la "service_role" key (⚠️ **NUNCA** la uses en el cliente, solo para scripts)

2. **Variables de entorno**: Agrega estas variables a tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # ⚠️ Solo para scripts
```

### Uso

```bash
npm run seed:mock
```

### Qué crea el script

- **5 Pacientes** con diferentes perfiles:
  - María González (Ansiedad, Argentina)
  - Carlos Rodríguez (Depresión, México)
  - Ana Martínez (Estrés, España)
  - Luis Fernández (Trauma, Colombia)
  - Laura Sánchez (Duelo, Argentina)

- **4 Terapeutas** con diferentes especialidades:
  - Dra. Sofía Ramírez (Ansiedad, Depresión)
  - Dr. Javier Morales (Depresión, Trauma)
  - Lic. Carmen López (Pareja, Adolescencia)
  - Dra. Patricia Vega (Trauma, Ansiedad)

### Credenciales de prueba

Todos los usuarios tienen la misma contraseña: `test123456`

**Pacientes:**
- paciente1@test.com
- paciente2@test.com
- paciente3@test.com
- paciente4@test.com
- paciente5@test.com

**Terapeutas:**
- terapeuta1@test.com
- terapeuta2@test.com
- terapeuta3@test.com
- terapeuta4@test.com

### Notas

- El script verifica si los usuarios ya existen antes de crearlos
- Si un usuario ya existe, se omite su creación
- Los emails se auto-confirman para facilitar el testing
- Puedes ejecutar el script múltiples veces sin crear duplicados











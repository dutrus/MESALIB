// scripts/seed-mock-users.ts
// Script para crear usuarios mock y probar el sistema de matching

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Datos mock de pacientes
const mockPatients = [
  {
    email: 'paciente1@test.com',
    password: 'test123456',
    profile: {
      name: 'María González',
      ageRange: '25-34',
      pronouns: 'ella/she',
      contactPreference: 'whatsapp',
      country: 'Argentina',
      timezone: 'America/Buenos_Aires',
      mainReason: 'He estado experimentando mucha ansiedad en el trabajo, especialmente antes de presentaciones importantes.',
      needs: ['Ansiedad / ataques de pánico', 'Estrés académico / laboral'],
      urgency: 'medium',
      preferredProfessional: 'psychologist',
      languages: ['Español'],
      budgetRange: 'low-cost',
      availability: 'Lunes a viernes por la tarde, después de las 18:00'
    }
  },
  {
    email: 'paciente2@test.com',
    password: 'test123456',
    profile: {
      name: 'Carlos Rodríguez',
      ageRange: '18-24',
      pronouns: 'él/he',
      contactPreference: 'email',
      country: 'México',
      timezone: 'America/Mexico_City',
      mainReason: 'Me siento muy triste últimamente, he perdido interés en las cosas que antes disfrutaba.',
      needs: ['Tristeza prolongada / depresión'],
      urgency: 'high',
      preferredProfessional: 'no-preference',
      languages: ['Español', 'Inglés'],
      budgetRange: 'free',
      availability: 'Fines de semana y algunos días entre semana'
    }
  },
  {
    email: 'paciente3@test.com',
    password: 'test123456',
    profile: {
      name: 'Ana Martínez',
      ageRange: '35-44',
      pronouns: 'ella/she',
      contactPreference: 'whatsapp',
      country: 'España',
      timezone: 'Europe/Madrid',
      mainReason: 'Necesito ayuda para manejar el estrés de ser madre soltera y trabajar tiempo completo.',
      needs: ['Estrés académico / laboral', 'Relaciones / familia'],
      urgency: 'medium',
      preferredProfessional: 'psychologist',
      languages: ['Español'],
      budgetRange: 'standard',
      availability: 'Lunes, miércoles y viernes por la mañana'
    }
  },
  {
    email: 'paciente4@test.com',
    password: 'test123456',
    profile: {
      name: 'Luis Fernández',
      ageRange: '25-34',
      pronouns: 'él/he',
      contactPreference: 'call',
      country: 'Colombia',
      timezone: 'America/Bogota',
      mainReason: 'He pasado por una experiencia traumática reciente y necesito apoyo profesional.',
      needs: ['Trauma / abuso'],
      urgency: 'high',
      preferredProfessional: 'psychiatrist',
      languages: ['Español'],
      budgetRange: 'low-cost',
      availability: 'Cualquier día de la semana, horario flexible'
    }
  },
  {
    email: 'paciente5@test.com',
    password: 'test123456',
    profile: {
      name: 'Laura Sánchez',
      ageRange: '18-24',
      pronouns: 'ella/she',
      contactPreference: 'whatsapp',
      country: 'Argentina',
      timezone: 'America/Buenos_Aires',
      mainReason: 'Estoy pasando por un proceso de duelo después de la pérdida de un ser querido.',
      needs: ['Duelo / pérdida'],
      urgency: 'medium',
      preferredProfessional: 'psychologist',
      languages: ['Español'],
      budgetRange: 'low-cost',
      availability: 'Martes y jueves por la tarde'
    }
  }
];

// Datos mock de terapeutas
const mockTherapists = [
  {
    email: 'terapeuta1@test.com',
    password: 'test123456',
    profile: {
      name: 'Dra. Sofía Ramírez',
      profession: 'psychologist',
      licenseNumber: 'PSI-12345',
      yearsExperience: 8,
      country: 'Argentina',
      timezone: 'America/Buenos_Aires',
      languages: ['Español', 'Inglés'],
      specialties: ['Ansiedad / pánico', 'Depresión / duelo', 'Estrés académico / burnout'],
      modalities: ['Individual', 'Terapia breve'],
      sessionFormat: 'online',
      priceRange: 'sliding-scale',
      openToLowCost: true,
      maxNewPatients: 5
    }
  },
  {
    email: 'terapeuta2@test.com',
    password: 'test123456',
    profile: {
      name: 'Dr. Javier Morales',
      profession: 'psychiatrist',
      licenseNumber: 'PSQ-67890',
      yearsExperience: 12,
      country: 'México',
      timezone: 'America/Mexico_City',
      languages: ['Español'],
      specialties: ['Depresión / duelo', 'Trauma / abuso', 'Evaluación psiquiátrica / medicación'],
      modalities: ['Individual', 'Terapia a largo plazo'],
      sessionFormat: 'hybrid',
      priceRange: 'fixed-rate',
      openToLowCost: false,
      maxNewPatients: 3
    }
  },
  {
    email: 'terapeuta3@test.com',
    password: 'test123456',
    profile: {
      name: 'Lic. Carmen López',
      profession: 'psychologist',
      licenseNumber: 'PSI-11111',
      yearsExperience: 5,
      country: 'España',
      timezone: 'Europe/Madrid',
      languages: ['Español', 'Catalán'],
      specialties: ['Pareja / vínculos', 'Adolescencia', 'Estrés académico / burnout'],
      modalities: ['Individual', 'Pareja', 'Familia'],
      sessionFormat: 'presencial',
      priceRange: 'sliding-scale',
      openToLowCost: true,
      maxNewPatients: 4
    }
  },
  {
    email: 'terapeuta4@test.com',
    password: 'test123456',
    profile: {
      name: 'Dra. Patricia Vega',
      profession: 'psychologist',
      licenseNumber: 'PSI-22222',
      yearsExperience: 10,
      country: 'Colombia',
      timezone: 'America/Bogota',
      languages: ['Español'],
      specialties: ['Trauma / abuso', 'Ansiedad / pánico', 'Identidad / género'],
      modalities: ['Individual', 'Terapia breve'],
      sessionFormat: 'online',
      priceRange: 'sliding-scale',
      openToLowCost: true,
      maxNewPatients: 6
    }
  }
];

async function createMockUsers() {
  console.log('🚀 Iniciando creación de usuarios mock...\n');

  // Crear pacientes
  console.log('📋 Creando pacientes...');
  const patientUserIds: string[] = [];
  const patientProfileIds: { userId: string; profileId: string }[] = [];
  
  for (const patient of mockPatients) {
    try {
      // Verificar si el usuario ya existe
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === patient.email);
      
      let userId: string;
      
      if (existingUser) {
        console.log(`⚠️  Usuario ${patient.email} ya existe, usando existente`);
        userId = existingUser.id;
      } else {
        // Crear usuario en Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: patient.email,
          password: patient.password,
          email_confirm: true, // Auto-confirmar email para testing
          user_metadata: {
            role: 'patient'
          }
        });

        if (authError) {
          console.error(`❌ Error creando usuario ${patient.email}:`, authError.message);
          continue;
        }

        if (!authData.user) {
          console.error(`❌ No se pudo crear usuario ${patient.email}`);
          continue;
        }

        userId = authData.user.id;
      }

      patientUserIds.push(userId);

      // Verificar si ya existe perfil
      const { data: existingProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        console.log(`⚠️  Perfil ya existe para ${patient.email}`);
        patientProfileIds.push({ userId, profileId: existingProfile.id });
        continue;
      }

      // Crear perfil de paciente
      const { data: profileData, error: profileError } = await supabase
        .from('patient_profiles')
        .insert({
          user_id: userId,
          name: patient.profile.name,
          age_range: patient.profile.ageRange,
          pronouns: patient.profile.pronouns,
          contact_preference: patient.profile.contactPreference,
          country: patient.profile.country,
          timezone: patient.profile.timezone,
          main_reason: patient.profile.mainReason,
          needs: patient.profile.needs,
          urgency: patient.profile.urgency,
          preferred_professional: patient.profile.preferredProfessional,
          languages: patient.profile.languages,
          budget_range: patient.profile.budgetRange,
          availability: patient.profile.availability,
        })
        .select('id')
        .single();

      if (profileError) {
        console.error(`❌ Error creando perfil para ${patient.email}:`, profileError.message);
      } else {
        console.log(`✅ Paciente creado: ${patient.profile.name} (${patient.email})`);
        if (profileData) {
          patientProfileIds.push({ userId, profileId: profileData.id });
        }
      }
    } catch (error: any) {
      console.error(`❌ Error procesando paciente ${patient.email}:`, error.message);
    }
  }

  console.log(`\n✅ ${patientUserIds.length} pacientes procesados\n`);

  // Crear terapeutas
  console.log('👩‍⚕️ Creando terapeutas...');
  const therapistUserIds: string[] = [];
  const therapistProfileIds: { userId: string; profileId: string }[] = [];
  
  for (const therapist of mockTherapists) {
    try {
      // Verificar si el usuario ya existe
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === therapist.email);
      
      let userId: string;
      
      if (existingUser) {
        console.log(`⚠️  Usuario ${therapist.email} ya existe, usando existente`);
        userId = existingUser.id;
      } else {
        // Crear usuario en Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: therapist.email,
          password: therapist.password,
          email_confirm: true,
          user_metadata: {
            role: 'therapist'
          }
        });

        if (authError) {
          console.error(`❌ Error creando usuario ${therapist.email}:`, authError.message);
          continue;
        }

        if (!authData.user) {
          console.error(`❌ No se pudo crear usuario ${therapist.email}`);
          continue;
        }

        userId = authData.user.id;
      }

      therapistUserIds.push(userId);

      // Verificar si ya existe perfil
      const { data: existingProfile } = await supabase
        .from('therapist_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        console.log(`⚠️  Perfil ya existe para ${therapist.email}`);
        therapistProfileIds.push({ userId, profileId: existingProfile.id });
        continue;
      }

      // Crear perfil de terapeuta
      const { data: profileData, error: profileError } = await supabase
        .from('therapist_profiles')
        .insert({
          user_id: userId,
          name: therapist.profile.name,
          profession: therapist.profile.profession,
          license_number: therapist.profile.licenseNumber,
          years_experience: therapist.profile.yearsExperience,
          country: therapist.profile.country,
          timezone: therapist.profile.timezone,
          languages: therapist.profile.languages,
          specialties: therapist.profile.specialties,
          modalities: therapist.profile.modalities,
          session_format: therapist.profile.sessionFormat,
          price_range: therapist.profile.priceRange,
          open_to_low_cost: therapist.profile.openToLowCost,
          max_new_patients: therapist.profile.maxNewPatients,
        })
        .select('id')
        .single();

      if (profileError) {
        console.error(`❌ Error creando perfil para ${therapist.email}:`, profileError.message);
      } else {
        console.log(`✅ Terapeuta creado: ${therapist.profile.name} (${therapist.email})`);
        if (profileData) {
          therapistProfileIds.push({ userId, profileId: profileData.id });
        }
      }
    } catch (error: any) {
      console.error(`❌ Error procesando terapeuta ${therapist.email}:`, error.message);
    }
  }

  console.log(`\n✅ ${therapistUserIds.length} terapeutas procesados\n`);

  // Obtener los IDs de los perfiles creados
  const { data: patientProfiles } = await supabase
    .from('patient_profiles')
    .select('id, user_id, name')
    .in('user_id', patientUserIds);

  const { data: therapistProfiles } = await supabase
    .from('therapist_profiles')
    .select('id, user_id, name')
    .in('user_id', therapistUserIds);

  console.log('📊 Resumen:');
  console.log(`   - Pacientes: ${patientProfiles?.length || 0}`);
  console.log(`   - Terapeutas: ${therapistProfiles?.length || 0}`);
  console.log('\n✨ Usuarios mock creados exitosamente!');
  console.log('\n📝 Credenciales de prueba:');
  console.log('\n👤 PACIENTES:');
  mockPatients.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.email} / test123456 - ${p.profile.name}`);
  });
  console.log('\n👩‍⚕️ TERAPEUTAS:');
  mockTherapists.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.email} / test123456 - ${t.profile.name}`);
  });
  
  console.log('\n💡 Puedes usar estas credenciales para iniciar sesión y probar el sistema de matching!');
}

// Ejecutar el script
createMockUsers()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error);
    process.exit(1);
  });


// scripts/create-test-matches.ts
// Script para crear matches de prueba entre pacientes y terapeutas

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

async function createTestMatches() {
  console.log('🚀 Creando matches de prueba...\n');

  try {
    // Obtener todos los pacientes
    const { data: patients, error: patientsError } = await supabase
      .from('patient_profiles')
      .select('id, name, user_id')
      .order('created_at', { ascending: false });

    if (patientsError) {
      console.error('❌ Error obteniendo pacientes:', patientsError);
      return;
    }

    if (!patients || patients.length === 0) {
      console.error('❌ No se encontraron pacientes. Ejecuta primero: npm run seed:mock');
      return;
    }

    // Obtener todos los terapeutas
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapist_profiles')
      .select('id, name, user_id')
      .order('created_at', { ascending: false });

    if (therapistsError) {
      console.error('❌ Error obteniendo terapeutas:', therapistsError);
      return;
    }

    if (!therapists || therapists.length === 0) {
      console.error('❌ No se encontraron terapeutas. Ejecuta primero: npm run seed:mock');
      return;
    }

    console.log(`📋 Encontrados ${patients.length} pacientes`);
    console.log(`👩‍⚕️ Encontrados ${therapists.length} terapeutas\n`);

    // Verificar matches existentes
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('patient_id, therapist_id, status');

    const existingMatchKeys = new Set(
      existingMatches?.map(m => `${m.patient_id}-${m.therapist_id}`) || []
    );

    // Crear matches de prueba
    const matchesToCreate = [
      { patientIndex: 0, therapistIndex: 0, status: 'pending' }, // María - Dra. Sofía
      { patientIndex: 1, therapistIndex: 1, status: 'pending' }, // Carlos - Dr. Javier
      { patientIndex: 2, therapistIndex: 0, status: 'pending' }, // Ana - Dra. Sofía
    ];

    let created = 0;
    let skipped = 0;

    for (const match of matchesToCreate) {
      if (match.patientIndex >= patients.length || match.therapistIndex >= therapists.length) {
        console.warn(`⚠️  Índice fuera de rango, saltando match`);
        continue;
      }

      const patient = patients[match.patientIndex];
      const therapist = therapists[match.therapistIndex];
      const matchKey = `${patient.id}-${therapist.id}`;

      if (existingMatchKeys.has(matchKey)) {
        console.log(`⏭️  Match ya existe: ${patient.name} - ${therapist.name}`);
        skipped++;
        continue;
      }

      try {
        const { data, error } = await supabase
          .from('matches')
          .insert({
            patient_id: patient.id,
            therapist_id: therapist.id,
            status: match.status,
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Error creando match ${patient.name} - ${therapist.name}:`, error.message);
        } else {
          console.log(`✅ Match creado: ${patient.name} - ${therapist.name} (${match.status})`);
          created++;
        }
      } catch (error: any) {
        console.error(`❌ Error procesando match:`, error.message);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   - Matches creados: ${created}`);
    console.log(`   - Matches omitidos: ${skipped}`);
    console.log(`\n✨ Proceso completado!`);
    console.log(`\n💡 Ahora puedes:`);
    console.log(`   1. Iniciar sesión como terapeuta (terapeuta1@test.com)`);
    console.log(`   2. Ir a /dashboard/therapist`);
    console.log(`   3. Ver las solicitudes pendientes en la pestaña "Solicitudes"`);

  } catch (error: any) {
    console.error('\n❌ Error ejecutando script:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
createTestMatches()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error);
    process.exit(1);
  });











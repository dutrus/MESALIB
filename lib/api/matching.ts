// ============================================================================
// FILE: lib/api/matching.ts
// ============================================================================

import { supabase } from '../supabase/client';
import type { PatientProfile, TherapistProfile } from '@/types';

/**
 * Calcula un score de compatibilidad entre paciente y terapeuta
 * Retorna un número entre 0 y 100
 */
export function calculateMatchScore(patient: any, therapist: any): number {
  let score = 0;
  const maxScore = 100;

  // 1. Especialidades vs Necesidades (40 puntos)
  const patientNeeds = patient.needs || [];
  const therapistSpecialties = therapist.specialties || [];
  
  if (patientNeeds.length > 0 && therapistSpecialties.length > 0) {
    const matchingSpecialties = patientNeeds.filter((need: string) =>
      therapistSpecialties.some((specialty: string) =>
        specialty.toLowerCase().includes(need.toLowerCase()) ||
        need.toLowerCase().includes(specialty.toLowerCase())
      )
    );
    const specialtyScore = (matchingSpecialties.length / patientNeeds.length) * 40;
    score += specialtyScore;
  }

  // 2. Idioma común (20 puntos)
  const patientLanguages = patient.languages || [];
  const therapistLanguages = therapist.languages || [];
  const commonLanguages = patientLanguages.filter((lang: string) =>
    therapistLanguages.includes(lang)
  );
  if (commonLanguages.length > 0) {
    score += 20;
  }

  // 3. Presupuesto compatible (20 puntos)
  const patientBudget = patient.budget_range;
  const therapistPriceRange = therapist.price_range;
  const therapistOpenToLowCost = therapist.open_to_low_cost || false;

  if (patientBudget === 'free' && therapistPriceRange === 'free') {
    score += 20;
  } else if (patientBudget === 'low-cost' && (therapistOpenToLowCost || therapistPriceRange === 'sliding-scale')) {
    score += 20;
  } else if (patientBudget === 'low-cost' && therapistPriceRange === 'free') {
    score += 15;
  } else if (patientBudget === 'standard' && therapistPriceRange !== 'free') {
    score += 20;
  } else if (patientBudget === 'standard' && therapistPriceRange === 'sliding-scale') {
    score += 18;
  }

  // 4. Profesión preferida (10 puntos)
  const patientPreferred = patient.preferred_professional;
  if (patientPreferred === 'no-preference' || patientPreferred === therapist.profession) {
    score += 10;
  }

  // 5. Cupos disponibles (10 puntos)
  const maxPatients = therapist.max_new_patients || 0;
  const currentPatients = therapist.current_patients || 0;
  if (maxPatients > currentPatients) {
    score += 10;
  } else {
    return 0;
  }

  return Math.min(score, maxScore);
}

/**
 * Encuentra los mejores terapeutas para un paciente
 */
export async function findBestMatchesForPatient(patientId: string, limit: number = 3) {
  try {
    const { data: patient, error: patientError } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error('Paciente no encontrado');
    }

    const { data: existingAcceptedMatch } = await supabase
      .from('matches')
      .select('id')
      .eq('patient_id', patientId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (existingAcceptedMatch) {
      console.log('Paciente ya tiene un match aceptado');
      return [];
    }

    const { data: allTherapists, error: therapistsError } = await supabase
      .from('therapist_profiles')
      .select('*');

    if (therapistsError) {
      throw therapistsError;
    }

    if (!allTherapists || allTherapists.length === 0) {
      console.log('No hay terapeutas disponibles');
      return [];
    }

    const availableTherapists = allTherapists.filter((therapist: any) => {
      const maxPatients = therapist.max_new_patients || 0;
      const currentPatients = therapist.current_patients || 0;
      if (maxPatients <= currentPatients) return false;

      const patientBudget = patient.budget_range;
      const therapistPriceRange = therapist.price_range;
      const therapistOpenToLowCost = therapist.open_to_low_cost || false;

      if (patientBudget === 'free' && therapistPriceRange !== 'free') {
        return false;
      }

      if (patientBudget === 'low-cost' && 
          therapistPriceRange === 'fixed-rate' && 
          !therapistOpenToLowCost) {
        return false;
      }

      return true;
    });

    if (availableTherapists.length === 0) {
      console.log('No hay terapeutas con cupos disponibles y compatibles');
      return [];
    }

    const therapistsWithScores = availableTherapists.map((therapist: any) => ({
      therapist,
      score: calculateMatchScore(patient, therapist),
    }));

    const validMatches = therapistsWithScores.filter((item: any) => item.score > 0);
    validMatches.sort((a: any, b: any) => b.score - a.score);

    if (patient.urgency === 'high') {
      validMatches.sort((a: any, b: any) => {
        if (a.score === b.score) {
          return (b.therapist.years_experience || 0) - (a.therapist.years_experience || 0);
        }
        return b.score - a.score;
      });
    }

    return validMatches.slice(0, limit).map((item: any) => ({
      therapistId: item.therapist.id,
      therapist: item.therapist,
      score: item.score,
    }));
  } catch (error) {
    console.error('Error finding matches for patient:', error);
    throw error;
  }
}

/**
 * Crea matches automáticos para un paciente
 */
export async function autoMatchPatient(patientId: string) {
  try {
    console.log('🔍 Iniciando matching automático para paciente:', patientId);

    const { data: existingAcceptedMatch } = await supabase
      .from('matches')
      .select('id')
      .eq('patient_id', patientId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (existingAcceptedMatch) {
      console.log('✅ Paciente ya tiene match aceptado, no se crean nuevos matches');
      return { created: 0, skipped: true };
    }

    const { data: existingPendingMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('patient_id', patientId)
      .eq('status', 'pending');

    if (existingPendingMatches && existingPendingMatches.length >= 3) {
      console.log('⏭️  Paciente ya tiene 3 matches pendientes, no se crean nuevos');
      return { created: 0, skipped: true };
    }

    const bestMatches = await findBestMatchesForPatient(patientId, 1);

    if (bestMatches.length === 0) {
      console.log('⚠️  No se encontraron terapeutas compatibles');
      return { created: 0, message: 'No hay terapeutas disponibles en este momento' };
    }

    const bestMatch = bestMatches[0];
    console.log(`✅ Creando match con terapeuta ${bestMatch.therapistId} (score: ${bestMatch.score})`);

    const { data: newMatch, error: matchError } = await supabase
      .from('matches')
      .insert({
        patient_id: patientId,
        therapist_id: bestMatch.therapistId,
        status: 'pending',
      })
      .select()
      .single();

    if (matchError) {
      console.error('❌ Error creando match:', matchError);
      throw matchError;
    }

    console.log('✅ Match creado exitosamente:', newMatch.id);
    
    return { created: 1, match: newMatch };
  } catch (error: any) {
    console.error('❌ Error en autoMatchPatient:', error);
    throw error;
  }
}

/**
 * Busca pacientes en espera y los matchea con un terapeuta nuevo
 */
export async function autoMatchNewTherapist(therapistId: string) {
  try {
    console.log('🔍 Buscando pacientes en espera para terapeuta:', therapistId);

    const { data: therapist, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select('*')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      throw new Error('Terapeuta no encontrado');
    }

    const maxPatients = therapist.max_new_patients || 0;
    const currentPatients = therapist.current_patients || 0;
    
    if (maxPatients <= currentPatients) {
      console.log('⚠️  Terapeuta sin cupos disponibles');
      return { created: 0, message: 'Sin cupos disponibles' };
    }

    const { data: allPatients, error: patientsError } = await supabase
      .from('patient_profiles')
      .select('*');

    if (patientsError) {
      throw patientsError;
    }

    if (!allPatients || allPatients.length === 0) {
      console.log('⚠️  No hay pacientes en el sistema');
      return { created: 0 };
    }

    const { data: acceptedMatches } = await supabase
      .from('matches')
      .select('patient_id')
      .eq('status', 'accepted');

    const acceptedPatientIds = new Set(acceptedMatches?.map((m: any) => m.patient_id) || []);
    const availablePatients = allPatients.filter((p: any) => !acceptedPatientIds.has(p.id));

    if (availablePatients.length === 0) {
      console.log('⚠️  No hay pacientes disponibles');
      return { created: 0 };
    }

    const patientsWithScores = availablePatients.map((patient: any) => ({
      patient,
      score: calculateMatchScore(patient, therapist),
    }));

    const validMatches = patientsWithScores.filter((item: any) => item.score > 0);

    if (validMatches.length === 0) {
      console.log('⚠️  No hay pacientes compatibles');
      return { created: 0 };
    }

    validMatches.sort((a: any, b: any) => {
      if (a.patient.urgency === 'high' && b.patient.urgency !== 'high') return -1;
      if (b.patient.urgency === 'high' && a.patient.urgency !== 'high') return 1;
      return b.score - a.score;
    });

    const slotsAvailable = maxPatients - currentPatients;
    const matchesToCreate = validMatches.slice(0, slotsAvailable);

    let created = 0;
    const createdMatches = [];

    for (const item of matchesToCreate) {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('patient_id', item.patient.id)
        .eq('therapist_id', therapistId)
        .maybeSingle();

      if (existingMatch) {
        console.log(`⏭️  Match ya existe para paciente ${item.patient.id}`);
        continue;
      }

      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({
          patient_id: item.patient.id,
          therapist_id: therapistId,
          status: 'pending',
        })
        .select()
        .single();

      if (matchError) {
        console.error(`❌ Error creando match para paciente ${item.patient.id}:`, matchError);
        continue;
      }

      created++;
      createdMatches.push(newMatch);
      console.log(`✅ Match creado: paciente ${item.patient.id} - terapeuta ${therapistId} (score: ${item.score})`);
    }

    console.log(`✅ Total matches creados: ${created}`);
    return { created, matches: createdMatches };
  } catch (error: any) {
    console.error('❌ Error en autoMatchNewTherapist:', error);
    throw error;
  }
}





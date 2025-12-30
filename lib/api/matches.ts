// ============================================================================
// FILE: lib/api/matches.ts
// ============================================================================

import { supabase } from '../supabase/client';
import { autoMatchPatient } from './matching';
import { sendNotificationSafely, handleError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { Match } from '@/types/match';

export async function fetchPatientsForMatching() {
  try {
    const { data: acceptedMatches, error: matchesError } = await supabase
      .from('matches')
      .select('patient_id')
      .eq('status', 'accepted');

    if (matchesError) {
      logger.warn('Error obteniendo matches aceptados (no crítico)', {
        error: matchesError.message,
      });
    }

    const acceptedPatientIds = acceptedMatches?.map(m => m.patient_id) || [];

    const { data: allPatients, error: allError } = await supabase
      .from('patient_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      const formattedError = handleError(allError, 'fetchPatientsForMatching');
      throw new Error(formattedError.message);
    }

    const availablePatients = acceptedPatientIds.length > 0
      ? allPatients?.filter(p => !acceptedPatientIds.includes(p.id)) || []
      : allPatients || [];

    logger.debug('Pacientes disponibles para matching', { count: availablePatients.length });
    return availablePatients;
  } catch (error) {
    const formattedError = handleError(error, 'fetchPatientsForMatching');
    throw formattedError;
  }
}

export async function fetchTherapistsForMatching() {
  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMatch(patientId: string, therapistId: string) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      patient_id: patientId,
      therapist_id: therapistId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  
  try {
    const { data: patient } = await supabase
      .from('patient_profiles')
      .select('name, user_id')
      .eq('id', patientId)
      .single();
    
    const { data: therapist } = await supabase
      .from('therapist_profiles')
      .select('name, user_id')
      .eq('id', therapistId)
      .single();
    
    if (patient && therapist) {
      await sendNotificationSafely('match_created', {
        therapistUserId: therapist.user_id,
        patientName: patient.name,
      });
    }
  } catch (emailError) {
    logger.warn('Error en proceso de notificación (no crítico)', {
      context: 'createMatch',
      error: emailError instanceof Error ? emailError.message : 'Error desconocido',
    });
  }
  
  return data;
}

export async function acceptMatch(matchId: string) {
  if (!matchId) {
    throw new Error('Match ID es requerido');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('Usuario no autenticado');
  }

  const { data: existingMatch, error: checkError } = await supabase
    .from('matches')
    .select('id, status, therapist_id, patient_id')
    .eq('id', matchId)
    .maybeSingle();

  if (checkError) {
    const error = handleError(checkError, 'acceptMatch - verificar match');
    throw new Error(error.message);
  }

  if (!existingMatch) {
    throw new Error('Match no encontrado');
  }

  if (existingMatch.status === 'accepted') {
    const { data: acceptedMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();
    return acceptedMatch;
  }

  if (existingMatch.status === 'declined') {
    throw new Error('Este match ya fue rechazado');
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!therapistProfile) {
    throw new Error('No se encontró el perfil del terapeuta');
  }

  if (existingMatch.therapist_id !== therapistProfile.id) {
    throw new Error('No tienes permiso para aceptar este match');
  }

  const { data, error } = await supabase
    .from('matches')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', matchId)
    .eq('status', 'pending')
    .eq('therapist_id', therapistProfile.id)
    .select();

  if (error) {
    console.error('Error updating match:', error);
    if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
      throw new Error('No tienes permisos para actualizar este match. Verifica las políticas RLS en Supabase.');
    }
    throw error;
  }

  if (!data || data.length === 0) {
    const { data: recheckMatch } = await supabase
      .from('matches')
      .select('id, status, therapist_id')
      .eq('id', matchId)
      .maybeSingle();
    
    if (recheckMatch) {
      if (recheckMatch.therapist_id !== therapistProfile.id) {
        throw new Error('No tienes permiso para actualizar este match. El match pertenece a otro terapeuta.');
      }
      throw new Error(`No se pudo actualizar el match. Estado actual: ${recheckMatch.status}. Esto puede ser un problema de permisos RLS en Supabase.`);
    } else {
      throw new Error('No se pudo actualizar el match. El match puede haber sido eliminado.');
    }
  }

  try {
    const { data: therapistData } = await supabase
      .from('therapist_profiles')
      .select('current_patients')
      .eq('id', therapistProfile.id)
      .single();
    
    const newCount = (therapistData?.current_patients || 0) + 1;
    
    await supabase
      .from('therapist_profiles')
      .update({ current_patients: newCount })
      .eq('id', therapistProfile.id);
    
    logger.info('Contador de pacientes actualizado', { count: newCount });
  } catch (countError) {
    logger.warn('Error actualizando contador (no crítico)', {
      context: 'acceptMatch',
      error: countError instanceof Error ? countError.message : 'Error desconocido',
    });
  }

  try {
    await supabase
      .from('matches')
      .update({ 
        status: 'declined'
      })
      .eq('patient_id', existingMatch.patient_id)
      .eq('status', 'pending')
      .neq('id', matchId);
    
    logger.info('Otros matches pendientes cancelados');
  } catch (cancelError) {
    logger.warn('Error cancelando otros matches (no crítico)', {
      context: 'acceptMatch',
      error: cancelError instanceof Error ? cancelError.message : 'Error desconocido',
    });
  }

  try {
    const { data: patient } = await supabase
      .from('patient_profiles')
      .select('name, user_id')
      .eq('id', existingMatch.patient_id)
      .single();
    
    const { data: therapist } = await supabase
      .from('therapist_profiles')
      .select('name')
      .eq('id', therapistProfile.id)
      .single();
    
    if (patient && therapist) {
      await sendNotificationSafely('match_accepted', {
        patientUserId: patient.user_id,
        therapistName: therapist.name,
      });
    }
  } catch (emailError) {
    logger.warn('Error en proceso de notificación (no crítico)', {
      context: 'acceptMatch',
      error: emailError instanceof Error ? emailError.message : 'Error desconocido',
    });
  }

  return data[0];
}

export async function declineMatch(matchId: string) {
  if (!matchId) {
    throw new Error('Match ID es requerido');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('Usuario no autenticado');
  }

  const { data: existingMatch, error: checkError } = await supabase
    .from('matches')
    .select('id, status, therapist_id')
    .eq('id', matchId)
    .maybeSingle();

  if (checkError) {
    const error = handleError(checkError, 'declineMatch - verificar match');
    throw new Error(error.message);
  }

  if (!existingMatch) {
    throw new Error('Match no encontrado');
  }

  if (existingMatch.status !== 'pending') {
    throw new Error(`Este match ya fue ${existingMatch.status === 'accepted' ? 'aceptado' : 'rechazado'}`);
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!therapistProfile) {
    throw new Error('No se encontró el perfil del terapeuta');
  }

  if (existingMatch.therapist_id !== therapistProfile.id) {
    throw new Error('No tienes permiso para rechazar este match');
  }

  const { data, error } = await supabase
    .from('matches')
    .update({ 
      status: 'declined'
    })
    .eq('id', matchId)
    .eq('status', 'pending')
    .eq('therapist_id', therapistProfile.id)
    .select();

  if (error) {
    console.error('Error updating match:', error);
    if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
      throw new Error('No tienes permisos para actualizar este match. Verifica las políticas RLS en Supabase.');
    }
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No se pudo actualizar el match. Puede que ya haya sido procesado por otro usuario o hay un problema de permisos RLS.');
  }

  try {
    const { data: match } = await supabase
      .from('matches')
      .select('patient_id')
      .eq('id', matchId)
      .single();
    
    if (match?.patient_id) {
      const { data: patient } = await supabase
        .from('patient_profiles')
        .select('name, user_id')
        .eq('id', match.patient_id)
        .single();
      
      if (patient) {
        await sendNotificationSafely('match_declined', {
          patientUserId: patient.user_id,
        });
      }
    }
  } catch (emailError) {
    logger.warn('Error en proceso de notificación (no crítico)', {
      context: 'declineMatch',
      error: emailError instanceof Error ? emailError.message : 'Error desconocido',
    });
  }

  try {
    const { data: match } = await supabase
      .from('matches')
      .select('patient_id')
      .eq('id', matchId)
      .single();
    
    if (match?.patient_id) {
      logger.info('Iniciando re-matching para paciente', { patientId: match.patient_id });
      await autoMatchPatient(match.patient_id);
    }
  } catch (rematchError) {
    logger.warn('Error en re-matching (no crítico)', {
      context: 'declineMatch',
      error: rematchError instanceof Error ? rematchError.message : 'Error desconocido',
    });
  }

  return data[0];
}

export async function getPendingMatchesForTherapist(therapistId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      patient:patient_profiles(*)
    `)
    .eq('therapist_id', therapistId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAcceptedMatchesForTherapist(therapistId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      patient:patient_profiles(*)
    `)
    .eq('therapist_id', therapistId)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMatchesForPatient(patientId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      therapist:therapist_profiles(*)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

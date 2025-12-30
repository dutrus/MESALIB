// ============================================================================
// FILE: lib/api/sessions.ts
// ============================================================================

import { supabase } from '../supabase/client';
import type { Session, SessionStatus } from '@/types/session';

export async function getMyUpcomingSessions() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');
  const user = session.user;

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (patientProfile) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        therapist:therapist_profiles(name, profession)
      `)
      .eq('patient_id', patientProfile.id)
      .gte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (therapistProfile) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        patient:patient_profiles(name, main_reason)
      `)
      .eq('therapist_id', therapistProfile.id)
      .gte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  return [];
}

export async function createSession(
  matchId: string,
  scheduledTime: string,
  duration: number = 60,
  notes?: string
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('patient_id, therapist_id, status')
    .eq('id', matchId)
    .single();

  if (matchError || !match) {
    throw new Error('Match no encontrado');
  }

  if (match.status !== 'accepted') {
    throw new Error('Solo se pueden crear sesiones para matches aceptados');
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!therapistProfile || therapistProfile.id !== match.therapist_id) {
    throw new Error('Solo el terapeuta puede crear sesiones');
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      match_id: matchId,
      patient_id: match.patient_id,
      therapist_id: match.therapist_id,
      scheduled_time: scheduledTime,
      duration,
      status: 'scheduled',
      ...(notes ? { therapist_notes: notes } : {}),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionHistory(limit: number = 30) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');
  const user = session.user;

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (patientProfile) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        therapist:therapist_profiles(name, profession)
      `)
      .eq('patient_id', patientProfile.id)
      .in('status', ['completed', 'cancelled'])
      .order('scheduled_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (therapistProfile) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        patient:patient_profiles(name, main_reason)
      `)
      .eq('therapist_id', therapistProfile.id)
      .in('status', ['completed', 'cancelled'])
      .order('scheduled_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  return [];
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');

  const { data: existingSession, error: checkError } = await supabase
    .from('sessions')
    .select('therapist_id, patient_id')
    .eq('id', sessionId)
    .single();

  if (checkError || !existingSession) {
    throw new Error('Sesión no encontrada');
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const isTherapist = therapistProfile?.id === existingSession.therapist_id;
  const isPatient = patientProfile?.id === existingSession.patient_id;

  if (!isTherapist && !isPatient) {
    throw new Error('No tienes permiso para actualizar esta sesión');
  }

  const { data, error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionById(sessionId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');

  const { data: existingSession, error: checkError } = await supabase
    .from('sessions')
    .select('therapist_id, patient_id')
    .eq('id', sessionId)
    .single();

  if (checkError || !existingSession) {
    throw new Error('Sesión no encontrada');
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const isTherapist = therapistProfile?.id === existingSession.therapist_id;
  const isPatient = patientProfile?.id === existingSession.patient_id;

  if (!isTherapist && !isPatient) {
    throw new Error('No tienes permiso para ver esta sesión');
  }

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      patient:patient_profiles(*),
      therapist:therapist_profiles(*)
    `)
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}





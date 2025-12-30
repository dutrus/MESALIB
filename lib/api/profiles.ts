// ============================================================================
// FILE: lib/api/profiles.ts
// ============================================================================

import { supabase } from '../supabase/client';
import { autoMatchPatient } from './matching';
import { autoMatchNewTherapist } from './matching';
import type { PatientProfile, TherapistProfile } from '@/types';

export async function createPatientProfile(data: any) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !authUser) {
    console.error('❌ Error obteniendo usuario autenticado:', userError);
    throw new Error('No hay usuario autenticado. Por favor, inicia sesión.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('❌ No hay sesión activa aunque getUser() retornó usuario');
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  const userId = authUser.id;
  
  const { data: existingProfile, error: existingError } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Error verificando perfil existente:', existingError);
    throw existingError;
  }

  if (existingProfile) {
    console.log('El usuario ya tiene un perfil, redirigiendo...');
    return existingProfile;
  }

  const insertData: any = {
    user_id: userId,
    name: data.name || '',
    age_range: data.ageRange || '',
    pronouns: data.pronouns || '',
    contact_preference: data.contactPreference || 'email',
    country: data.country || '',
    timezone: data.timezone || 'UTC',
    main_reason: data.mainReason || '',
    needs: Array.isArray(data.needs) && data.needs.length > 0 ? data.needs : [],
    urgency: data.urgency || 'medium',
    preferred_professional: data.preferredProfessional || 'no-preference',
    languages: Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : [],
    budget_range: data.budgetRange || 'standard',
    availability: data.availability || '',
  };

  if (!insertData.name || insertData.name.trim() === '') {
    throw new Error('El nombre es requerido');
  }
  if (!insertData.main_reason || insertData.main_reason.trim() === '') {
    throw new Error('La razón principal es requerida');
  }
  if (!insertData.country || insertData.country.trim() === '') {
    throw new Error('El país es requerido');
  }

  const { data: profile, error } = await supabase
    .from('patient_profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error al crear perfil de paciente:', error);
    const errorMessage = error.message || 'Error desconocido al crear el perfil';
    const supabaseError = new Error(errorMessage);
    (supabaseError as any).code = error.code;
    (supabaseError as any).details = error.details;
    (supabaseError as any).hint = error.hint;
    throw supabaseError;
  }
  
  console.log('Perfil de paciente creado exitosamente:', profile);
  
  try {
    console.log('🔄 Iniciando matching automático...');
    await autoMatchPatient(profile.id);
  } catch (matchError) {
    console.error('⚠️  Error en matching automático (no crítico):', matchError);
  }
  
  return profile;
}

export async function getMyPatientProfile(): Promise<PatientProfile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('❌ No hay sesión activa');
    throw new Error('No authenticated user');
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('❌ Error obteniendo perfil de paciente:', error);
    throw error;
  }

  if (!data) {
    console.log('ℹ️ No se encontró perfil para user_id:', userId);
    return null;
  }

  console.log('✅ Perfil encontrado:', data.name);
  return data;
}

export async function createTherapistProfile(data: any) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !authUser) {
    console.error('❌ Error obteniendo usuario autenticado:', userError);
    throw new Error('No hay usuario autenticado. Por favor, inicia sesión.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('❌ No hay sesión activa aunque getUser() retornó usuario');
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  const userId = authUser.id;
  
  const { data: existingProfile, error: existingError } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Error verificando perfil existente:', existingError);
    throw existingError;
  }

  if (existingProfile) {
    console.log('El usuario ya tiene un perfil, redirigiendo...');
    return existingProfile;
  }

  const insertData: any = {
    user_id: userId,
    name: data.name,
    profession: data.profession,
    license_number: data.licenseNumber,
    years_experience: data.yearsExperience || 0,
    country: data.country || '',
    timezone: data.timezone || 'UTC',
    languages: data.languages || [],
    specialties: data.specialties || [],
    modalities: data.modalities || [],
    session_format: data.sessionFormat,
    price_range: data.priceRange,
    open_to_low_cost: data.openToLowCost || false,
    max_new_patients: data.maxNewPatients || 0,
    current_patients: 0,
  };

  const { data: profile, error } = await supabase
    .from('therapist_profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error al crear perfil de terapeuta:', error);
    const errorMessage = error.message || 'Error desconocido al crear el perfil';
    const supabaseError = new Error(errorMessage);
    (supabaseError as any).code = error.code;
    (supabaseError as any).details = error.details;
    (supabaseError as any).hint = error.hint;
    throw supabaseError;
  }
  
  console.log('Perfil de terapeuta creado exitosamente:', profile);
  
  try {
    console.log('🔄 Buscando pacientes en espera para matching...');
    await autoMatchNewTherapist(profile.id);
  } catch (matchError) {
    console.error('⚠️  Error en matching automático (no crítico):', matchError);
  }
  
  return profile;
}

export async function getMyTherapistProfile(): Promise<TherapistProfile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');
  const user = session.user;

  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    console.log('ℹ️ No se encontró perfil de terapeuta para user_id:', user.id);
    return null;
  }
  return data;
}

export async function updateTherapistProfile(data: any) {
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !authUser) {
    console.error('Error obteniendo usuario autenticado:', userError);
    throw new Error('No authenticated user');
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error obteniendo perfil actual:', profileError);
    throw profileError;
  }

  if (!currentProfile) {
    throw new Error('No se encontró tu perfil de terapeuta');
  }

  const updateData: any = {
    name: data.name,
    profession: data.profession,
    license_number: data.licenseNumber,
    years_experience: data.yearsExperience || 0,
    country: data.country || '',
    timezone: data.timezone || 'UTC',
    languages: Array.isArray(data.languages) ? data.languages : (data.languages || []),
    specialties: data.specialties || [],
    modalities: data.modalities || [],
    session_format: data.sessionFormat,
    price_range: data.priceRange,
    open_to_low_cost: data.openToLowCost || false,
    max_new_patients: data.maxNewPatients || 0,
  };

  const { data: profile, error } = await supabase
    .from('therapist_profiles')
    .update(updateData)
    .eq('id', currentProfile.id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar perfil de terapeuta:', error);
    throw error;
  }
  
  console.log('Perfil de terapeuta actualizado exitosamente:', profile);
  return profile;
}





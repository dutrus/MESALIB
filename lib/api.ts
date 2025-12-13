// lib/api.ts

import { supabase } from './supabase/client';
import { AvailabilitySlot, PatientProfile, TherapistProfile } from '@/types';

// ==================== SIGNUP ====================
export async function signUpUser(
  email: string, 
  password: string, 
  role: 'patient' | 'therapist'
) {
  // Obtener la URL base de forma segura
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role, // Guardamos el rol en metadata
      },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error en signUp:', error);
    throw error;
  }

  // Verificar si hay sesión automática
  if (data.session) {
    console.log('✅ Usuario creado con sesión automática:', data.user?.id);
    return data.user;
  }

  // Si no hay sesión automática, hacer login inmediatamente
  if (data.user) {
    console.log('⚠️ Usuario creado pero sin sesión, iniciando sesión...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error('Error haciendo login después de signup:', loginError);
      throw new Error('Usuario creado pero no se pudo iniciar sesión. Por favor, intenta iniciar sesión manualmente.');
    }

    console.log('✅ Sesión establecida después de signup');
    return loginData.user;
  }

  throw new Error('No se pudo crear el usuario');
}

// ==================== LOGIN ====================
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mejorar mensajes de error
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
    }
    // Sin verificación de email - permitir login sin confirmar email
    throw error;
  }

  if (!data.user) {
    throw new Error('No se pudo obtener el usuario');
  }

  // Sin verificación de email - continuar sin verificar email_confirmed_at

  // Obtener el rol de los metadatos del usuario
  const roleFromMetadata = data.user.user_metadata?.role as 'patient' | 'therapist' | 'admin' | undefined;
  
  // Si hay rol en metadata, retornarlo
  if (roleFromMetadata) {
    return { ...data.user, role: roleFromMetadata };
  }
  
  // Si no hay rol en metadata, buscar en las tablas de perfiles
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (patientProfile) {
    return { ...data.user, role: 'patient' as const };
  }

  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (therapistProfile) {
    return { ...data.user, role: 'therapist' as const };
  }

  // Si no se encuentra en ninguna tabla, retornar null (el AuthContext manejará esto)
  return { ...data.user, role: null };
}

// ==================== PATIENT PROFILE ====================
export async function createPatientProfile(data: any) {
  // Esperar un momento para asegurar que la sesión esté sincronizada
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Obtener el usuario autenticado usando getUser() para asegurar que existe
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
  
  console.log('🔍 Verificando autenticación para crear perfil:', {
    hasUser: !!authUser,
    userId: authUser?.id,
    userError: userError?.message
  });
  
  // Si no hay usuario autenticado, no podemos crear el perfil
  if (userError || !authUser) {
    console.error('❌ Error obteniendo usuario autenticado:', userError);
    throw new Error('No hay usuario autenticado. Por favor, inicia sesión.');
  }

  // También verificar la sesión para asegurar que está activa
  const { data: { session } } = await supabase.auth.getSession();
  console.log('🔍 Verificando sesión:', {
    hasSession: !!session,
    sessionUserId: session?.user?.id,
    matchesAuthUser: session?.user?.id === authUser?.id
  });
  
  if (!session?.user) {
    console.error('❌ No hay sesión activa aunque getUser() retornó usuario');
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  // Usar SIEMPRE el user_id de la sesión autenticada (auth.uid())
  // Esto garantiza que el usuario existe en auth.users y evita errores de foreign key
  const userId = authUser.id;
  
  // VERIFICAR SI YA EXISTE UN PERFIL
  const { data: existingProfile, error: existingError } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (existingError && existingError.code !== 'PGRST116') {
    // PGRST116 es "no rows returned", que es esperado si no existe perfil
    console.error('Error verificando perfil existente:', existingError);
    throw existingError;
  }

  if (existingProfile) {
    console.log('El usuario ya tiene un perfil, redirigiendo...');
    return existingProfile; // Retornar el existente
  }

  // CREAR PERFIL NUEVO
  console.log('Creando perfil de paciente con user_id:', userId);
  console.log('Datos del perfil:', { ...data, user_id: userId });

  // Preparar datos con valores por defecto para campos opcionales
  // Asegurar que los arrays no sean null/undefined
  const insertData: any = {
    user_id: userId, // Usar siempre auth.uid() de la sesión autenticada
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

  // Validar campos requeridos antes de insertar
  if (!insertData.name || insertData.name.trim() === '') {
    throw new Error('El nombre es requerido');
  }
  if (!insertData.main_reason || insertData.main_reason.trim() === '') {
    throw new Error('La razón principal es requerida');
  }
  if (!insertData.country || insertData.country.trim() === '') {
    throw new Error('El país es requerido');
  }

  console.log('Datos a insertar en patient_profiles:', insertData);

  const { data: profile, error } = await supabase
    .from('patient_profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Log detallado del error para debugging
    console.error('Error al crear perfil de paciente:');
    console.error('  - user_id usado:', userId);
    console.error('  - error code:', error.code);
    console.error('  - error message:', error.message);
    console.error('  - error details:', error.details);
    console.error('  - error hint:', error.hint);
    
    // Crear un error más descriptivo con el mensaje de Supabase
    const errorMessage = error.message || 'Error desconocido al crear el perfil';
    const supabaseError = new Error(errorMessage);
    (supabaseError as any).code = error.code;
    (supabaseError as any).details = error.details;
    (supabaseError as any).hint = error.hint;
    throw supabaseError;
  }
  
  console.log('Perfil de paciente creado exitosamente:', profile);
  
  // 🆕 MATCHING AUTOMÁTICO
  try {
    console.log('🔄 Iniciando matching automático...');
    await autoMatchPatient(profile.id);
  } catch (matchError) {
    // No fallar si el matching falla, solo loguear
    console.error('⚠️  Error en matching automático (no crítico):', matchError);
  }
  
  return profile;
}

export async function getMyPatientProfile() {
  // Obtener la sesión actual
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('❌ No hay sesión activa');
    throw new Error('No authenticated user');
  }

  const userId = session.user.id;
  console.log('🔍 Buscando perfil para user_id:', userId);

  // Buscar el perfil del usuario actual
  const { data, error } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle(); // Cambiado de .single() a .maybeSingle()

  if (error) {
    console.error('❌ Error obteniendo perfil de paciente:', error);
    throw error;
  }

  if (!data) {
    // No lanzar error, solo retornar null para que el componente pueda manejar el caso
    console.log('ℹ️ No se encontró perfil para user_id:', userId);
    return null;
  }

  console.log('✅ Perfil encontrado:', data.name);
  return data;
}

// ==================== THERAPIST PROFILE ====================
export async function createTherapistProfile(data: any) {
  // Esperar un momento para asegurar que la sesión esté sincronizada
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Obtener el usuario autenticado usando getUser() para asegurar que existe
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
  
  console.log('🔍 Verificando autenticación para crear perfil de terapeuta:', {
    hasUser: !!authUser,
    userId: authUser?.id,
    userError: userError?.message
  });
  
  // Si no hay usuario autenticado, no podemos crear el perfil
  if (userError || !authUser) {
    console.error('❌ Error obteniendo usuario autenticado:', userError);
    throw new Error('No hay usuario autenticado. Por favor, inicia sesión.');
  }

  // También verificar la sesión para asegurar que está activa
  const { data: { session } } = await supabase.auth.getSession();
  console.log('🔍 Verificando sesión:', {
    hasSession: !!session,
    sessionUserId: session?.user?.id,
    matchesAuthUser: session?.user?.id === authUser?.id
  });
  
  if (!session?.user) {
    console.error('❌ No hay sesión activa aunque getUser() retornó usuario');
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  // Usar SIEMPRE el user_id de la sesión autenticada (auth.uid())
  // Esto garantiza que el usuario existe en auth.users y evita errores de foreign key
  const userId = authUser.id;
  
  // VERIFICAR SI YA EXISTE UN PERFIL
  const { data: existingProfile, error: existingError } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (existingError && existingError.code !== 'PGRST116') {
    // PGRST116 es "no rows returned", que es esperado si no existe perfil
    console.error('Error verificando perfil existente:', existingError);
    throw existingError;
  }

  if (existingProfile) {
    console.log('El usuario ya tiene un perfil, redirigiendo...');
    return existingProfile; // Retornar el existente
  }

  // CREAR PERFIL NUEVO
  console.log('Creando perfil de terapeuta con user_id:', userId);
  console.log('Datos del perfil:', { ...data, user_id: userId });

  // Preparar datos con valores por defecto para campos opcionales
  const insertData: any = {
    user_id: userId, // Usar siempre auth.uid() de la sesión autenticada
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
    current_patients: 0, // Inicializar en 0
  };

  console.log('Datos a insertar en therapist_profiles:', insertData);

  const { data: profile, error } = await supabase
    .from('therapist_profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Log detallado del error para debugging
    console.error('Error al crear perfil de terapeuta:');
    console.error('  - user_id usado:', userId);
    console.error('  - error code:', error.code);
    console.error('  - error message:', error.message);
    console.error('  - error details:', error.details);
    console.error('  - error hint:', error.hint);
    
    // Crear un error más descriptivo con el mensaje de Supabase
    const errorMessage = error.message || 'Error desconocido al crear el perfil';
    const supabaseError = new Error(errorMessage);
    (supabaseError as any).code = error.code;
    (supabaseError as any).details = error.details;
    (supabaseError as any).hint = error.hint;
    throw supabaseError;
  }
  
  console.log('Perfil de terapeuta creado exitosamente:', profile);
  
  // 🆕 MATCHING AUTOMÁTICO CON PACIENTES EN ESPERA
  try {
    console.log('🔄 Buscando pacientes en espera para matching...');
    await autoMatchNewTherapist(profile.id);
  } catch (matchError) {
    // No fallar si el matching falla, solo loguear
    console.error('⚠️  Error en matching automático (no crítico):', matchError);
  }
  
  return profile;
}

export async function getMyTherapistProfile() {
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
    // No lanzar error, solo retornar null para que el componente pueda manejar el caso
    console.log('ℹ️ No se encontró perfil de terapeuta para user_id:', user.id);
    return null;
  }
  return data;
}

export async function updateTherapistProfile(data: any) {
  // Obtener el usuario autenticado
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !authUser) {
    console.error('Error obteniendo usuario autenticado:', userError);
    throw new Error('No authenticated user');
  }

  // Obtener el perfil actual para verificar que existe
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

  // Preparar datos para actualizar
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

  console.log('Actualizando perfil de terapeuta:', updateData);

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

// ==================== AUTO MATCHING ====================

/**
 * Calcula un score de compatibilidad entre paciente y terapeuta
 * Retorna un número entre 0 y 100
 */
function calculateMatchScore(patient: any, therapist: any): number {
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
    score += 15; // Aceptable pero no ideal
  } else if (patientBudget === 'standard' && therapistPriceRange !== 'free') {
    score += 20;
  } else if (patientBudget === 'standard' && therapistPriceRange === 'sliding-scale') {
    score += 18; // Bueno
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
    // Sin cupos disponibles, penalizar completamente
    return 0;
  }

  return Math.min(score, maxScore);
}

/**
 * Encuentra los mejores terapeutas para un paciente
 */
export async function findBestMatchesForPatient(patientId: string, limit: number = 3) {
  try {
    // Obtener perfil del paciente
    const { data: patient, error: patientError } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error('Paciente no encontrado');
    }

    // Verificar si ya tiene un match aceptado
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

    // Obtener todos los terapeutas disponibles
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

    // Filtrar terapeutas con cupos disponibles y compatibilidad de presupuesto
    const availableTherapists = allTherapists.filter((therapist: any) => {
      const maxPatients = therapist.max_new_patients || 0;
      const currentPatients = therapist.current_patients || 0;
      if (maxPatients <= currentPatients) return false;

      // Filtro estricto de presupuesto
      const patientBudget = patient.budget_range;
      const therapistPriceRange = therapist.price_range;
      const therapistOpenToLowCost = therapist.open_to_low_cost || false;

      // Paciente gratis solo con terapeuta gratis
      if (patientBudget === 'free' && therapistPriceRange !== 'free') {
        return false;
      }

      // Paciente low-cost no puede con fixed-rate sin low-cost
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

    // Calcular score para cada terapeuta
    const therapistsWithScores = availableTherapists.map((therapist: any) => ({
      therapist,
      score: calculateMatchScore(patient, therapist),
    }));

    // Filtrar solo los que tienen score > 0
    const validMatches = therapistsWithScores.filter((item: any) => item.score > 0);

    // Ordenar por score descendente
    validMatches.sort((a: any, b: any) => b.score - a.score);

    // Aplicar bonus por urgencia (pacientes urgentes van primero)
    if (patient.urgency === 'high') {
      validMatches.sort((a: any, b: any) => {
        if (a.score === b.score) {
          return (b.therapist.years_experience || 0) - (a.therapist.years_experience || 0);
        }
        return b.score - a.score;
      });
    }

    // Retornar los mejores matches
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
 * Busca los mejores terapeutas y crea matches pendientes
 */
export async function autoMatchPatient(patientId: string) {
  try {
    console.log('🔍 Iniciando matching automático para paciente:', patientId);

    // Verificar si ya tiene match aceptado
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

    // Verificar si ya tiene matches pendientes (máximo 3)
    const { data: existingPendingMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('patient_id', patientId)
      .eq('status', 'pending');

    if (existingPendingMatches && existingPendingMatches.length >= 3) {
      console.log('⏭️  Paciente ya tiene 3 matches pendientes, no se crean nuevos');
      return { created: 0, skipped: true };
    }

    // Encontrar mejores matches
    const bestMatches = await findBestMatchesForPatient(patientId, 1); // Solo el mejor

    if (bestMatches.length === 0) {
      console.log('⚠️  No se encontraron terapeutas compatibles');
      return { created: 0, message: 'No hay terapeutas disponibles en este momento' };
    }

    // Crear match con el mejor terapeuta
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

    // Obtener perfil del terapeuta
    const { data: therapist, error: therapistError } = await supabase
      .from('therapist_profiles')
      .select('*')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      throw new Error('Terapeuta no encontrado');
    }

    // Verificar cupos disponibles
    const maxPatients = therapist.max_new_patients || 0;
    const currentPatients = therapist.current_patients || 0;
    
    if (maxPatients <= currentPatients) {
      console.log('⚠️  Terapeuta sin cupos disponibles');
      return { created: 0, message: 'Sin cupos disponibles' };
    }

    // Buscar pacientes sin match aceptado
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

    // Filtrar pacientes sin match aceptado
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

    // Calcular scores y encontrar el mejor match
    const patientsWithScores = availablePatients.map((patient: any) => ({
      patient,
      score: calculateMatchScore(patient, therapist),
    }));

    // Filtrar solo los que tienen score > 0
    const validMatches = patientsWithScores.filter((item: any) => item.score > 0);

    if (validMatches.length === 0) {
      console.log('⚠️  No hay pacientes compatibles');
      return { created: 0 };
    }

    // Ordenar por score y urgencia
    validMatches.sort((a: any, b: any) => {
      if (a.patient.urgency === 'high' && b.patient.urgency !== 'high') return -1;
      if (b.patient.urgency === 'high' && a.patient.urgency !== 'high') return 1;
      return b.score - a.score;
    });

    // Crear matches con los mejores pacientes (hasta llenar cupos disponibles)
    const slotsAvailable = maxPatients - currentPatients;
    const matchesToCreate = validMatches.slice(0, slotsAvailable);

    let created = 0;
    const createdMatches = [];

    for (const item of matchesToCreate) {
      // Verificar si ya existe un match pendiente
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

// ==================== MATCHES ====================
export async function fetchPatientsForMatching() {
  try {
    // Primero obtener los IDs de pacientes que ya tienen matches aceptados
    const { data: acceptedMatches, error: matchesError } = await supabase
      .from('matches')
      .select('patient_id')
      .eq('status', 'accepted');

    if (matchesError) {
      console.error('Error fetching accepted matches:', matchesError);
      // Continuar aunque haya error, solo no filtrará
    }

    const acceptedPatientIds = acceptedMatches?.map(m => m.patient_id) || [];

    // Obtener todos los pacientes
    const { data: allPatients, error: allError } = await supabase
      .from('patient_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Error fetching patients:', allError);
      throw allError;
    }

    // Filtrar en JavaScript los que NO tienen matches aceptados
    const availablePatients = acceptedPatientIds.length > 0
      ? allPatients?.filter(p => !acceptedPatientIds.includes(p.id)) || []
      : allPatients || [];

    console.log('Available patients for matching:', availablePatients.length);
    return availablePatients;
  } catch (error) {
    console.error('Error in fetchPatientsForMatching:', error);
    throw error;
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
  
  // 🆕 NOTIFICACIÓN: Nuevo match disponible (terapeuta)
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
      // Enviar notificación a través de API route (servidor)
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'match_created',
          data: {
            therapistUserId: therapist.user_id,
            patientName: patient.name,
          },
        }),
      }).catch((error) => {
        console.error('⚠️  Error enviando notificación (no crítico):', error);
      });
    }
  } catch (emailError) {
    console.error('⚠️  Error enviando email (no crítico):', emailError);
    // No lanzar error para no romper el flujo principal
  }
  
  return data;
}

export async function acceptMatch(matchId: string) {
  // Validar que matchId existe
  if (!matchId) {
    throw new Error('Match ID es requerido');
  }

  // Verificar que el usuario está autenticado
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('Usuario no autenticado');
  }

  // Primero verificar que el match existe y está en estado pending
  console.log('Verificando match con ID:', matchId);
  const { data: existingMatch, error: checkError } = await supabase
    .from('matches')
    .select('id, status, therapist_id, patient_id')
    .eq('id', matchId)
    .maybeSingle();

  if (checkError) {
    console.error('Error verificando match:', checkError);
    throw new Error(`Error al verificar el match: ${checkError.message}`);
  }

  if (!existingMatch) {
    console.error('Match no encontrado con ID:', matchId);
    throw new Error('Match no encontrado');
  }

  console.log('Match encontrado:', existingMatch);

  // Si el match ya está aceptado, retornarlo en lugar de lanzar error
  if (existingMatch.status === 'accepted') {
    console.log('Match ya está aceptado, retornando match existente');
    const { data: acceptedMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();
    return acceptedMatch;
  }

  // Si el match fue rechazado, lanzar error
  if (existingMatch.status === 'declined') {
    throw new Error('Este match ya fue rechazado');
  }

  // Obtener el perfil del terapeuta para verificar permisos
  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!therapistProfile) {
    throw new Error('No se encontró el perfil del terapeuta');
  }

  // Verificar que el match pertenece a este terapeuta
  if (existingMatch.therapist_id !== therapistProfile.id) {
    throw new Error('No tienes permiso para aceptar este match');
  }

  // Actualizar el match (solo si sigue en pending para evitar condiciones de carrera)
  console.log('Actualizando match a accepted...', {
    matchId,
    therapistId: therapistProfile.id,
    matchTherapistId: existingMatch.therapist_id
  });
  
  const { data, error } = await supabase
    .from('matches')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', matchId)
    .eq('status', 'pending') // Solo actualizar si sigue en pending
    .eq('therapist_id', therapistProfile.id) // Asegurar que el terapeuta es el correcto
    .select();

  if (error) {
    console.error('Error updating match:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Si es un error de permisos RLS, dar un mensaje más claro
    if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
      throw new Error('No tienes permisos para actualizar este match. Verifica las políticas RLS en Supabase.');
    }
    
    throw error;
  }

  console.log('Resultado de actualización:', { data, dataLength: data?.length });

  if (!data || data.length === 0) {
    // Verificar nuevamente el estado del match para dar un mensaje más específico
    const { data: recheckMatch } = await supabase
      .from('matches')
      .select('id, status, therapist_id')
      .eq('id', matchId)
      .maybeSingle();
    
    if (recheckMatch) {
      console.error('Match existe pero no se pudo actualizar. Estado actual:', recheckMatch.status);
      console.error('Match therapist_id:', recheckMatch.therapist_id, 'vs Current therapist_id:', therapistProfile.id);
      
      // Si el therapist_id no coincide, puede ser un problema de permisos
      if (recheckMatch.therapist_id !== therapistProfile.id) {
        throw new Error('No tienes permiso para actualizar este match. El match pertenece a otro terapeuta.');
      }
      
      throw new Error(`No se pudo actualizar el match. Estado actual: ${recheckMatch.status}. Esto puede ser un problema de permisos RLS en Supabase.`);
    } else {
      throw new Error('No se pudo actualizar el match. El match puede haber sido eliminado.');
    }
  }

  // 🆕 ACTUALIZAR CONTADOR DE PACIENTES DEL TERAPEUTA
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
    
    console.log(`✅ Contador actualizado: ${newCount} pacientes`);
  } catch (countError) {
    console.error('⚠️  Error actualizando contador (no crítico):', countError);
  }

  // 🆕 CANCELAR OTROS MATCHES PENDIENTES DEL MISMO PACIENTE
  try {
    await supabase
      .from('matches')
      .update({ 
        status: 'declined'
      })
      .eq('patient_id', existingMatch.patient_id)
      .eq('status', 'pending')
      .neq('id', matchId);
    
    console.log('✅ Otros matches pendientes cancelados');
  } catch (cancelError) {
    console.error('⚠️  Error cancelando otros matches (no crítico):', cancelError);
  }

  // 🆕 NOTIFICACIÓN: Match aceptado (paciente)
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
      // Enviar notificación a través de API route (servidor)
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'match_accepted',
          data: {
            patientUserId: patient.user_id,
            therapistName: therapist.name,
          },
        }),
      }).catch((error) => {
        console.error('⚠️  Error enviando notificación (no crítico):', error);
      });
    }
  } catch (emailError) {
    console.error('⚠️  Error enviando email (no crítico):', emailError);
  }

  return data[0];
}

export async function declineMatch(matchId: string) {
  // Validar que matchId existe
  if (!matchId) {
    throw new Error('Match ID es requerido');
  }

  // Verificar que el usuario está autenticado
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('Usuario no autenticado');
  }

  // Primero verificar que el match existe y está en estado pending
  const { data: existingMatch, error: checkError } = await supabase
    .from('matches')
    .select('id, status, therapist_id')
    .eq('id', matchId)
    .maybeSingle();

  if (checkError) {
    console.error('Error verificando match:', checkError);
    throw new Error('Error al verificar el match');
  }

  if (!existingMatch) {
    throw new Error('Match no encontrado');
  }

  if (existingMatch.status !== 'pending') {
    throw new Error(`Este match ya fue ${existingMatch.status === 'accepted' ? 'aceptado' : 'rechazado'}`);
  }

  // Obtener el perfil del terapeuta para verificar permisos
  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!therapistProfile) {
    throw new Error('No se encontró el perfil del terapeuta');
  }

  // Verificar que el match pertenece a este terapeuta
  if (existingMatch.therapist_id !== therapistProfile.id) {
    throw new Error('No tienes permiso para rechazar este match');
  }

  // Actualizar el match (solo si sigue en pending para evitar condiciones de carrera)
  const { data, error } = await supabase
    .from('matches')
    .update({ 
      status: 'declined'
    })
    .eq('id', matchId)
    .eq('status', 'pending') // Solo actualizar si sigue en pending
    .eq('therapist_id', therapistProfile.id) // Asegurar que el terapeuta es el correcto
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

  // 🆕 NOTIFICACIÓN: Match rechazado (paciente)
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
        // Enviar notificación a través de API route (servidor)
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'match_declined',
            data: {
              patientUserId: patient.user_id,
            },
          }),
        }).catch((error) => {
          console.error('⚠️  Error enviando notificación (no crítico):', error);
        });
      }
    }
  } catch (emailError) {
    console.error('⚠️  Error enviando email (no crítico):', emailError);
  }

  // 🆕 RE-MATCHING AUTOMÁTICO
  try {
    const { data: match } = await supabase
      .from('matches')
      .select('patient_id')
      .eq('id', matchId)
      .single();
    
    if (match?.patient_id) {
      console.log('🔄 Iniciando re-matching para paciente:', match.patient_id);
      await autoMatchPatient(match.patient_id);
    }
  } catch (rematchError) {
    console.error('⚠️  Error en re-matching (no crítico):', rematchError);
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

export async function getMatchesForPatient(patientId: string) {
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


// ==================== THERAPIST AVAILABILITY ====================
const DEFAULT_TIMEZONE =
  typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

function mapAvailabilityRow(row: any): AvailabilitySlot {
  return {
    id: row.id,
    therapistId: row.therapist_id,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    createdAt: row.created_at,
  };
}

async function getCurrentTherapistProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('No authenticated user');
  }

  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('id, timezone')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching therapist profile:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Therapist profile not found');
  }

  return data;
}

export async function setAvailability(slots: AvailabilitySlot[]) {
  if (!slots || slots.length === 0) {
    return [];
  }

  const therapistProfile = await getCurrentTherapistProfile();

  const payload = slots.map((slot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format for availability slot');
    }

    if (end <= start) {
      throw new Error('End time must be greater than start time');
    }

    return {
      id: slot.id,
      therapist_id: therapistProfile.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      timezone: slot.timezone || therapistProfile.timezone || DEFAULT_TIMEZONE,
    };
  });

  const { data, error } = await supabase
    .from('therapist_availability')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error setting availability:', error);
    throw error;
  }

  return (data || []).map(mapAvailabilityRow);
}

export async function getTherapistAvailability(therapistId: string) {
  if (!therapistId) {
    throw new Error('Therapist ID is required');
  }

  const { data, error } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching therapist availability:', error);
    throw error;
  }

  return (data || []).map(mapAvailabilityRow);
}

export async function getAvailableSlots(therapistId: string, date: Date) {
  if (!therapistId) {
    throw new Error('Therapist ID is required');
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const { data, error } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .gte('start_time', startOfDay.toISOString())
    .lt('start_time', endOfDay.toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }

  return (data || []).map(mapAvailabilityRow);
}

export async function deleteAvailabilitySlot(slotId: string) {
  if (!slotId) {
    throw new Error('Slot ID is required');
  }

  const therapistProfile = await getCurrentTherapistProfile();

  const { error } = await supabase
    .from('therapist_availability')
    .delete()
    .eq('id', slotId)
    .eq('therapist_id', therapistProfile.id);

  if (error) {
    console.error('Error deleting availability slot:', error);
    throw error;
  }

  return true;
}

// ==================== SESSIONS ====================
export async function getMyUpcomingSessions() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');
  const user = session.user;

  // Detectar si es paciente o terapeuta
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

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
    .single();

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

  // Verificar que el match existe y está aceptado
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

  // Verificar que el usuario es el terapeuta del match
  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

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
      // Nota: La tabla tiene therapist_notes y patient_notes, no notes
      // Si se necesita agregar notas, usar therapist_notes para el terapeuta
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

  // Detectar si es paciente o terapeuta
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

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
    .single();

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
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');

  // Verificar que la sesión existe
  const { data: existingSession, error: checkError } = await supabase
    .from('sessions')
    .select('therapist_id, patient_id')
    .eq('id', sessionId)
    .single();

  if (checkError || !existingSession) {
    throw new Error('Sesión no encontrada');
  }

  // Verificar permisos: terapeuta o paciente pueden actualizar
  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

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

  // Verificar permisos antes de obtener
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
    .single();

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

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

// ==================== MOOD TRACKING ====================
export async function saveMoodEntry(mood: 'good' | 'okay' | 'bad', note: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');
  const user = session.user;

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!patientProfile) throw new Error('Patient profile not found');

  const { data, error } = await supabase
    .from('mood_entries')
    .upsert({
      patient_id: patientProfile.id,
      mood,
      note,
      date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMoodHistory(days: number = 30) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');
  const user = session.user;

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!patientProfile) throw new Error('Patient profile not found');

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('patient_id', patientProfile.id)
    .order('date', { ascending: false })
    .limit(days);

  if (error) throw error;
  return data;
}

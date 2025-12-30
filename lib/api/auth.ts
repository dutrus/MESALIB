// ============================================================================
// FILE: lib/api/auth.ts
// ============================================================================

import { supabase } from '../supabase/client';

export async function signUpUser(
  email: string, 
  password: string, 
  role: 'patient' | 'therapist'
) {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error en signUp:', error);
    throw error;
  }

  if (data.session) {
    console.log('✅ Usuario creado con sesión automática:', data.user?.id);
    return data.user;
  }

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

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
    }
    throw error;
  }

  if (!data.user) {
    throw new Error('No se pudo obtener el usuario');
  }

  const roleFromMetadata = data.user.user_metadata?.role as 'patient' | 'therapist' | 'admin' | undefined;
  
  if (roleFromMetadata) {
    return { ...data.user, role: roleFromMetadata };
  }
  
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

  return { ...data.user, role: null };
}





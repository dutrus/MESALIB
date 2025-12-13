// context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userRole: 'patient' | 'therapist' | 'admin' | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUserRole: (role: 'patient' | 'therapist' | 'admin' | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
  setUserRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'therapist' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserRole = async (userId: string) => {
    try {
      // Verificar en patient_profiles
      const { data: patientData, error: patientError } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (patientError && patientError.code !== 'PGRST116') {
        // PGRST116 es "no rows returned", que es esperado si no existe perfil
        console.error('Error verificando perfil de paciente:', patientError);
      }

      if (patientData) {
        setUserRole('patient');
        setLoading(false);
        return;
      }

      // Verificar en therapist_profiles
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapist_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (therapistError && therapistError.code !== 'PGRST116') {
        // PGRST116 es "no rows returned", que es esperado si no existe perfil
        console.error('Error verificando perfil de terapeuta:', therapistError);
      }

      if (therapistData) {
        setUserRole('therapist');
        setLoading(false);
        return;
      }

      // Si no está en ninguna tabla, rol desconocido
      setUserRole(null);
      setLoading(false);
    } catch (error) {
      console.error('Error en fetchUserRole:', error);
      setUserRole(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const refreshAuth = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await fetchUserRole(session.user.id);
    } else {
      setUserRole(null);
      setLoading(false);
    }
  };

  const setUserRoleManually = (role: 'patient' | 'therapist' | 'admin' | null) => {
    setUserRole(role);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut, refreshAuth, setUserRole: setUserRoleManually }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);



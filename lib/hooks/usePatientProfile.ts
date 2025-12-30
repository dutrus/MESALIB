// ============================================================================
// FILE: lib/hooks/usePatientProfile.ts
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { handleError } from '../utils/errors';
import type { PatientProfile } from '@/types/patient';

export function usePatientProfile() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (fetchError) {
        const formattedError = handleError(fetchError, 'usePatientProfile');
        throw new Error(formattedError.message);
      }

      setProfile(data || null);
    } catch (err) {
      const formattedError = err instanceof Error 
        ? err 
        : handleError(err, 'usePatientProfile');
      setError(formattedError instanceof Error ? formattedError : new Error(formattedError.message));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refetch: loadProfile,
  };
}




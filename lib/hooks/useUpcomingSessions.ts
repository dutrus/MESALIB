// ============================================================================
// FILE: lib/hooks/useUpcomingSessions.ts
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { handleError } from '../utils/errors';
import type { Session } from '@/types/session';

export function useUpcomingSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // Detectar si es paciente o terapeuta
      const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (patientProfile) {
        const { data, error: fetchError } = await supabase
          .from('sessions')
          .select(`
            *,
            therapist:therapist_profiles(name, profession)
          `)
          .eq('patient_id', patientProfile.id)
          .gte('scheduled_time', new Date().toISOString())
          .order('scheduled_time', { ascending: true });

        if (fetchError) {
          const formattedError = handleError(fetchError, 'useUpcomingSessions - paciente');
          throw new Error(formattedError.message);
        }
        setSessions(data || []);
        setLoading(false);
        return;
      }

      const { data: therapistProfile } = await supabase
        .from('therapist_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (therapistProfile) {
        const { data, error: fetchError } = await supabase
          .from('sessions')
          .select(`
            *,
            patient:patient_profiles(name, main_reason)
          `)
          .eq('therapist_id', therapistProfile.id)
          .gte('scheduled_time', new Date().toISOString())
          .order('scheduled_time', { ascending: true });

        if (fetchError) {
          const formattedError = handleError(fetchError, 'useUpcomingSessions - terapeuta');
          throw new Error(formattedError.message);
        }
        setSessions(data || []);
        setLoading(false);
        return;
      }

      setSessions([]);
      setLoading(false);
    } catch (err) {
      const formattedError = err instanceof Error 
        ? err 
        : handleError(err, 'useUpcomingSessions');
      setError(formattedError instanceof Error ? formattedError : new Error(formattedError.message));
      setSessions([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: loadSessions,
  };
}




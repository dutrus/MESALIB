// ============================================================================
// FILE: lib/hooks/usePatientMatches.ts
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { handleError } from '../utils/errors';
import type { Match } from '@/types/match';
import type { TherapistSummary } from '@/types/therapist';

export function usePatientMatches(patientId: string | null) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMatches = useCallback(async () => {
    if (!patientId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(`
          *,
          therapist:therapist_profiles(
            id,
            name,
            profession,
            specialties,
            years_experience
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        const formattedError = handleError(fetchError, 'usePatientMatches');
        throw new Error(formattedError.message);
      }

      const transformedMatches: Match[] = (data || []).map((m) => ({
        id: m.id,
        patient_id: m.patient_id,
        therapist_id: m.therapist_id,
        status: m.status,
        created_at: m.created_at,
        accepted_at: m.accepted_at,
        declined_at: m.declined_at,
        therapist: m.therapist ? {
          id: m.therapist.id,
          name: m.therapist.name,
          profession: m.therapist.profession,
          specialties: m.therapist.specialties || [],
          years_experience: m.therapist.years_experience || 0,
        } : undefined,
      }));
      setMatches(transformedMatches);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const acceptedMatch = useMemo(
    () => matches.find(m => m.status === 'accepted') || null,
    [matches]
  );

  const therapist = useMemo(
    () => acceptedMatch?.therapist || null,
    [acceptedMatch]
  );

  return {
    matches,
    acceptedMatch,
    therapist,
    loading,
    error,
    refetch: loadMatches,
  };
}


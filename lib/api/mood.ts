// ============================================================================
// FILE: lib/api/mood.ts
// ============================================================================

import { supabase } from '../supabase/client';

export async function saveMoodEntry(mood: 'good' | 'okay' | 'bad', note: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No authenticated user');
  const user = session.user;

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

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
    .maybeSingle();

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





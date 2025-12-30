// ============================================================================
// FILE: types/therapist.ts
// ============================================================================

export type Profession = 'psychologist' | 'psychiatrist' | 'other';
export type SessionFormat = 'online' | 'presencial' | 'hybrid';
export type PriceRange = 'free' | 'sliding-scale' | 'fixed-rate';

export interface TherapistProfile {
  id: string;
  user_id: string;
  name: string;
  profession: Profession;
  license_number: string;
  years_experience: number;
  country: string;
  timezone: string;
  languages: string[];
  specialties: string[];
  modalities: string[];
  session_format: SessionFormat;
  price_range: PriceRange;
  open_to_low_cost: boolean;
  max_new_patients: number;
  current_patients: number;
  created_at: string;
}

// Tipos específicos para componentes
export type TherapistSummary = Pick<
  TherapistProfile,
  'id' | 'name' | 'profession' | 'specialties' | 'years_experience'
>;





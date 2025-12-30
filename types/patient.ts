// ============================================================================
// FILE: types/patient.ts
// ============================================================================

export type AgeRange = '<18' | '18-24' | '25-34' | '35-44' | '45+';
export type ContactPreference = 'whatsapp' | 'email' | 'call';
export type Urgency = 'low' | 'medium' | 'high';
export type PreferredProfessional = 'psychologist' | 'psychiatrist' | 'no-preference';
export type BudgetRange = 'free' | 'low-cost' | 'standard';

export interface PatientProfile {
  id: string;
  user_id: string;
  name: string;
  age_range: AgeRange;
  pronouns: string;
  contact_preference: ContactPreference;
  country: string;
  timezone: string;
  main_reason: string;
  needs: string[];
  urgency: Urgency;
  preferred_professional: PreferredProfessional;
  languages: string[];
  budget_range: BudgetRange;
  availability: string;
  created_at: string;
}

// Tipos específicos para componentes (solo lo que necesitan)
export type PatientSummary = Pick<
  PatientProfile,
  'id' | 'name' | 'main_reason' | 'needs' | 'urgency' | 'pronouns'
>;





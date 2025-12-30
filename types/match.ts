// ============================================================================
// FILE: types/match.ts
// ============================================================================

import type { PatientSummary } from './patient';
import type { TherapistSummary } from './therapist';

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export interface Match {
  id: string;
  patient_id: string;
  therapist_id: string;
  status: MatchStatus;
  created_at: string;
  accepted_at?: string;
  declined_at?: string;
  // Relaciones opcionales (cuando se hace join)
  patient?: PatientSummary;
  therapist?: TherapistSummary;
}





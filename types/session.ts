// ============================================================================
// FILE: types/session.ts
// ============================================================================

export type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  match_id: string;
  patient_id: string;
  therapist_id: string;
  scheduled_time: string; // ISO string
  duration: number;
  status: SessionStatus;
  therapist_notes?: string;
  patient_notes?: string;
  created_at: string;
  updated_at: string;
}





// ============================================================================
// FILE: types/auth.ts
// ============================================================================

export type UserRole = 'patient' | 'therapist' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}





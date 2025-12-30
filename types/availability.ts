// ============================================================================
// FILE: types/availability.ts
// ============================================================================

export interface AvailabilitySlot {
  id?: string;
  therapistId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  timezone: string;
  createdAt?: string;
}





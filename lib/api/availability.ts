// ============================================================================
// FILE: lib/api/availability.ts
// ============================================================================

import { supabase } from '../supabase/client';
import type { AvailabilitySlot } from '@/types/availability';

const DEFAULT_TIMEZONE =
  typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

function mapAvailabilityRow(row: any): AvailabilitySlot {
  return {
    id: row.id,
    therapistId: row.therapist_id,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    createdAt: row.created_at,
  };
}

async function getCurrentTherapistProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('No authenticated user');
  }

  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('id, timezone')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching therapist profile:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Therapist profile not found');
  }

  return data;
}

export async function setAvailability(slots: AvailabilitySlot[]) {
  if (!slots || slots.length === 0) {
    return [];
  }

  const therapistProfile = await getCurrentTherapistProfile();

  const payload = slots.map((slot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format for availability slot');
    }

    if (end <= start) {
      throw new Error('End time must be greater than start time');
    }

    return {
      id: slot.id,
      therapist_id: therapistProfile.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      timezone: slot.timezone || therapistProfile.timezone || DEFAULT_TIMEZONE,
    };
  });

  const { data, error } = await supabase
    .from('therapist_availability')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error setting availability:', error);
    throw error;
  }

  return (data || []).map(mapAvailabilityRow);
}

export async function getTherapistAvailability(therapistId: string) {
  if (!therapistId) {
    throw new Error('Therapist ID is required');
  }

  const { data, error } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching therapist availability:', error);
    throw error;
  }

  return (data || []).map(mapAvailabilityRow);
}

export async function getAvailableSlots(therapistId: string, date: Date) {
  if (!therapistId) {
    throw new Error('Therapist ID is required');
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const { data, error } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .gte('start_time', startOfDay.toISOString())
    .lt('start_time', endOfDay.toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }

  return (data || []).map(mapAvailabilityRow);
}

export async function deleteAvailabilitySlot(slotId: string) {
  if (!slotId) {
    throw new Error('Slot ID is required');
  }

  const therapistProfile = await getCurrentTherapistProfile();

  const { error } = await supabase
    .from('therapist_availability')
    .delete()
    .eq('id', slotId)
    .eq('therapist_id', therapistProfile.id);

  if (error) {
    console.error('Error deleting availability slot:', error);
    throw error;
  }

  return true;
}





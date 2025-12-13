// ============================================================================
// FILE: types/index.ts
// ============================================================================

export type UserRole = 'patient' | 'therapist' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  ageRange: '<18' | '18-24' | '25-34' | '35-44' | '45+';
  pronouns: string;
  contactPreference: 'whatsapp' | 'email' | 'call';
  country: string;
  timezone: string;
  mainReason: string;
  needs: string[];
  urgency: 'low' | 'medium' | 'high';
  preferredProfessional: 'psychologist' | 'psychiatrist' | 'no-preference';
  languages: string[];
  budgetRange: 'free' | 'low-cost' | 'standard';
  availability: string;
  createdAt: Date;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  name: string;
  profession: 'psychologist' | 'psychiatrist' | 'other';
  licenseNumber: string;
  yearsExperience: number;
  country: string;
  timezone: string;
  languages: string[];
  specialties: string[];
  modalities: string[];
  sessionFormat: 'online' | 'presencial' | 'hybrid';
  priceRange: 'free' | 'sliding-scale' | 'fixed-rate';
  openToLowCost: boolean;
  maxNewPatients: number;
  currentPatients: number;
  createdAt: Date;
}

export interface AvailabilitySlot {
  id?: string;
  therapistId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  timezone: string;
  createdAt?: string;
}

export interface Match {
  id: string;
  patientId: string;
  therapistId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Date;
}

export interface Session {
  id: string;
  matchId: string;
  patientId: string;
  therapistId: string;
  scheduledTime: string; // ISO string
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales
  patient?: PatientProfile;
  therapist?: TherapistProfile;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ClinicalNote {
  id: string;
  sessionId?: string;
  patientId: string;
  therapistId: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  content?: string;
  type: 'article' | 'video' | 'exercise';
  category: string;
  url?: string;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  patientId: string;
  mood: 'good' | 'okay' | 'bad';
  note?: string;
  date: string;
  createdAt: string;
}

// Community types
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  needs: string[]; // Problems this post relates to
  likes: number;
  comments: number;
  isAnonymous: boolean;
  createdAt: Date;
  timeAgo: string;
}

export interface PeerConnection {
  id: string;
  patientId1: string;
  patientId2: string;
  status: 'pending' | 'accepted' | 'blocked';
  commonNeeds: string[]; // Shared mental health needs
  createdAt: Date;
}

export interface Mentor {
  id: string;
  patientId: string; // The mentor is a patient who has recovered/improved
  name: string;
  initials: string;
  pronouns: string;
  specialties: string[]; // What they mentor on (based on their recovery journey)
  bio: string;
  yearsInRecovery: number; // How long they've been in recovery/wellness
  languages: string[];
  country: string;
  isAvailable: boolean;
  menteesCount: number;
  rating: number; // Average rating from mentees
  createdAt: Date;
}

export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'active' | 'completed' | 'ended';
  focusArea: string; // What they're working on together
  createdAt: Date;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  focusNeed: string; // e.g., "Ansiedad / ataques de pánico"
  membersCount: number;
  isPrivate: boolean;
  createdAt: Date;
}

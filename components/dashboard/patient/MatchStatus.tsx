// ============================================================================
// FILE: components/dashboard/patient/MatchStatus.tsx
// ============================================================================

import React from 'react';
import { Card } from '@/components/ui/card';
import { TagChip } from '@/components/ui/TagChip';
import { Heart } from 'lucide-react';
import type { PatientProfile } from '@/types/patient';
import type { TherapistSummary } from '@/types/therapist';

interface MatchStatusProps {
  profile: PatientProfile;
  hasMatch: boolean;
  therapist: TherapistSummary | null;
}

export const MatchStatus = React.memo<MatchStatusProps>(({ profile, hasMatch, therapist }) => {
  if (!hasMatch) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-[#FF6B9D] animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Estamos buscando el profesional ideal para ti
          </h3>
          <p className="text-gray-700 mb-4">
            Nuestro equipo está revisando tu perfil para conectarte con alguien que se ajuste a tus necesidades:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <TagChip>{profile.main_reason}</TagChip>
            {profile.needs?.map((need) => (
              <TagChip key={need}>{need}</TagChip>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-6">
            📧 Te notificaremos por email cuando encontremos tu match
          </p>
        </div>
      </Card>
    );
  }

  if (!therapist) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Mi Terapeuta</h3>
      </div>
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
          {therapist.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-900">{therapist.name}</h4>
          <p className="text-gray-600 mb-2">{therapist.profession}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <TagChip>{therapist.specialties?.[0] || 'Terapia general'}</TagChip>
            <TagChip>{therapist.years_experience ? `${therapist.years_experience} años` : 'Experiencia'}</TagChip>
          </div>
        </div>
      </div>
    </Card>
  );
});

MatchStatus.displayName = 'MatchStatus';




// ============================================================================
// FILE: components/dashboard/patient/OverviewTab.tsx
// ============================================================================

import React from 'react';
import { Card } from '@/components/ui/card';
import { MatchStatus } from './MatchStatus';
import { User, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { PatientProfile } from '@/types/patient';
import type { TherapistSummary } from '@/types/therapist';
import type { Match } from '@/types/match';

interface OverviewTabProps {
  profile: PatientProfile;
  match: Match | null;
  therapist: TherapistSummary | null;
}

export const OverviewTab = React.memo<OverviewTabProps>(({ profile, match, therapist }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <MatchStatus 
          profile={profile}
          hasMatch={!!match}
          therapist={therapist}
        />
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <Link href="/dashboard/patient/profile">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Editar mi perfil</span>
                </div>
              </button>
            </Link>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Recursos</span>
              </div>
            </button>
          </div>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <h3 className="text-base font-bold text-red-900 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            ¿Necesitas ayuda inmediata?
          </h3>
          <p className="text-sm text-red-800 mb-3">
            Si estás en crisis, estos recursos están disponibles 24/7:
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-red-900">🇦🇷 Argentina: 135</p>
            <p className="font-semibold text-red-900">🇲🇽 México: 800-911-2000</p>
            <p className="font-semibold text-red-900">🇪🇸 España: 024</p>
          </div>
        </Card>
      </div>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';




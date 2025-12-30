// ============================================================================
// FILE: components/dashboard/patient/QuickStats.tsx
// ============================================================================

import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart, Calendar, MessageCircle } from 'lucide-react';
import type { Session } from '@/types/session';

interface QuickStatsProps {
  hasMatch: boolean;
  nextSession: Session | null;
  messagesCount?: number;
}

export const QuickStats = React.memo<QuickStatsProps>(({ hasMatch, nextSession, messagesCount = 0 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-pink-50 to-orange-50 border-pink-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Heart className="w-6 h-6 text-[#FF6B9D]" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Estado</p>
            <p className="text-lg font-bold text-gray-900">
              {hasMatch ? 'Conectada' : 'Buscando profesional'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Próxima sesión</p>
            <p className="text-lg font-bold text-gray-900">
              {nextSession ? 
                new Date(nextSession.scheduled_time).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) 
                : 'Pendiente'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <MessageCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Mensajes</p>
            <p className="text-lg font-bold text-gray-900">{messagesCount} nuevos</p>
          </div>
        </div>
      </Card>
    </div>
  );
});

QuickStats.displayName = 'QuickStats';




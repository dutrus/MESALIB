// ============================================================================
// FILE: components/dashboard/DashboardHeader.tsx
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { MesalibLogo } from '@/components/MesalibLogo';
import { Button } from '@/components/ui/button';
import { Settings, Bell } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User | null;
  userName: string;
  onSignOut: () => Promise<void>;
  settingsHref?: string;
}

export const DashboardHeader = React.memo<DashboardHeaderProps>(({ 
  user, 
  userName, 
  onSignOut,
  settingsHref = '/dashboard/patient/profile'
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <MesalibLogo size="sm" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent">
              MESALIB
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-6 h-6 text-gray-600" />
            </button>
            <Link href={settingsHref}>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSignOut}
            >
              Cerrar Sesión
            </Button>
            <button className="w-10 h-10 bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] rounded-xl flex items-center justify-center text-white font-bold">
              {userName.charAt(0)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';




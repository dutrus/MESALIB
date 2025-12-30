'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePatientProfile } from '@/lib/hooks/usePatientProfile';
import { usePatientMatches } from '@/lib/hooks/usePatientMatches';
import { useUpcomingSessions } from '@/lib/hooks/useUpcomingSessions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { QuickStats } from '@/components/dashboard/patient/QuickStats';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { OverviewTab } from '@/components/dashboard/patient/OverviewTab';
import { Card } from '@/components/ui/card';

export default function PatientDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'progress' | 'resources'>('overview');
  
  // Usar hooks compuestos
  const { profile, loading: profileLoading } = usePatientProfile();
  const { matches, acceptedMatch, therapist, loading: matchesLoading } = usePatientMatches(profile?.id || null);
  const { sessions, loading: sessionsLoading } = useUpcomingSessions();

  const loading = authLoading || profileLoading || matchesLoading || sessionsLoading;

  useEffect(() => {
    if (!loading && !profile && user) {
      router.push('/onboarding/patient');
    }
  }, [loading, profile, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B9D]" />
      </div>
    );
  }

  if (!profile) {
    return null; // Redirigiendo...
  }

  const firstName = profile.name?.split(' ')[0] || 'Usuario';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <DashboardHeader 
        user={user}
        userName={firstName}
        onSignOut={handleSignOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Hola, {firstName} 👋
          </h1>
          <p className="text-xl text-gray-600">
            {profile.pronouns && `(${profile.pronouns}) `}
            Bienvenida a tu espacio de bienestar
          </p>
        </div>

        <QuickStats 
          hasMatch={!!acceptedMatch}
          nextSession={sessions[0] || null}
        />

        <DashboardTabs 
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
          tabs={['overview', 'sessions', 'progress', 'resources']}
        />

        {activeTab === 'overview' && (
          <OverviewTab 
            profile={profile}
            match={acceptedMatch || null}
            therapist={therapist}
          />
        )}

        {activeTab === 'sessions' && (
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mis Sesiones</h3>
            <p className="text-gray-600">Próximamente: historial y gestión de sesiones</p>
          </Card>
        )}

        {activeTab === 'progress' && (
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mi Progreso</h3>
            <p className="text-gray-600">Próximamente: seguimiento de tu progreso</p>
          </Card>
        )}

        {activeTab === 'resources' && (
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recursos</h3>
            <p className="text-gray-600">Próximamente: recursos y materiales de apoyo</p>
          </Card>
        )}
      </div>
    </div>
  );
}

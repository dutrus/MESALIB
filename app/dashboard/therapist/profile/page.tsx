// ============================================================================
// FILE: app/dashboard/therapist/profile/page.tsx
// Página para editar perfil de terapeuta
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { MesalibLogo } from '@/components/MesalibLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TherapistIntakeForm } from '@/components/forms/TherapistIntakeForm';
import { getMyTherapistProfile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function EditTherapistProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadProfile();
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await getMyTherapistProfile();
      setProfileData(profile);
    } catch (error) {
      console.error('Error loading therapist profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B9D]" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/therapist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al dashboard
              </Button>
            </Link>
            <Link href="/" className="flex items-center space-x-3">
              <MesalibLogo size="sm" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent">
                MESALIB Pro
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent mb-3">
            Editar Perfil Profesional
          </h1>
          <p className="text-lg text-gray-600">Mantén actualizada tu información y disponibilidad</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6">
          <p className="text-gray-600 mb-6">
            💡 <strong>Tip:</strong> Actualiza tu disponibilidad regularmente para recibir las mejores solicitudes de match.
          </p>
          {profileData ? (
            <TherapistIntakeForm initialData={profileData} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No se pudo cargar tu perfil. Por favor, recarga la página.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


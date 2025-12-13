'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MesalibLogo } from '@/components/MesalibLogo';
import Link from 'next/link';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { userRole } = useAuth();

  React.useEffect(() => {
    if (userRole === 'patient') {
      router.push('/onboarding/patient');
    } else if (userRole === 'therapist') {
      router.push('/onboarding/therapist');
    }
  }, [userRole, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <MesalibLogo size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}

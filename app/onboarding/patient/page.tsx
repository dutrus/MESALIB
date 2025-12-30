'use client';

import React from 'react';
import { MesalibLogo } from '@/components/MesalibLogo';
import Link from 'next/link';
import { PatientIntakeForm } from '@/components/forms/PatientIntakeForm';

export default function PatientOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <MesalibLogo size="sm" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent">
                MESALIB
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent mb-4">
            Completa tu perfil
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cuéntanos sobre ti para encontrar el profesional adecuado
          </p>
        </div>

        <PatientIntakeForm />
      </div>
    </div>
  );
}

// ============================================================================
// FILE: app/dashboard/patient/profile/page.tsx
// Página para editar perfil de paciente
// ============================================================================

'use client';

import React from 'react';
import { MesalibLogo } from '@/components/MesalibLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PatientIntakeForm } from '@/components/forms/PatientIntakeForm';

export default function EditPatientProfilePage() {
  // TODO: En producción, cargar datos reales del usuario desde Supabase
  // const existingData = {
  //   name: 'Ana Martínez',
  //   ageRange: '25-34',
  //   pronouns: 'ella/she',
  //   contactPreference: 'whatsapp',
  //   country: 'Argentina',
  //   timezone: 'GMT-3',
  //   mainReason: 'Últimamente he estado sintiendo mucha ansiedad, especialmente en situaciones sociales.',
  //   needs: ['Ansiedad / ataques de pánico', 'Estrés académico / laboral'],
  //   urgency: 'medium',
  //   preferredProfessional: 'psychologist',
  //   languages: 'Español, Inglés',
  //   budgetRange: 'low-cost',
  //   availability: 'Lunes a viernes por la tarde, después de las 17:00'
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/patient" className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al dashboard
              </Button>
            </Link>
            <Link href="/" className="flex items-center space-x-3">
              <MesalibLogo size="sm" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent">
                MESALIB
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent mb-3">
            Editar Mi Perfil
          </h1>
          <p className="text-lg text-gray-600">Actualiza tu información cuando lo necesites</p>
        </div>

        {/* Nota: PatientIntakeForm necesitará props adicionales para modo edición */}
        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-6">
          <p className="text-gray-600 mb-6">
            💡 <strong>Tip:</strong> Mantén tu perfil actualizado para que podamos ofrecerte el mejor apoyo posible.
          </p>
          {/* En producción, pasarías initialData={existingData} y isEditing={true} */}
          <PatientIntakeForm />
        </div>
      </div>
    </div>
  );
}


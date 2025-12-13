// ============================================================================
// FILE: app/admin/match/page.tsx
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { MesalibLogo } from '@/components/MesalibLogo';
import { Card } from '@/components/ui/card';
import { TagChip } from '@/components/ui/TagChip';
import { Button } from '@/components/ui/button';
import { createMatch, fetchPatientsForMatching, fetchTherapistsForMatching } from '@/lib/api';
import { Users, Stethoscope, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  main_reason: string;
  needs: string[];
  urgency: string;
  languages: string[];
  budget_range: string;
  age_range: string;
  preferred_professional: string;
}

interface Therapist {
  id: string;
  name: string;
  profession: string;
  specialties: string[];
  languages: string[];
  session_format: string;
  max_new_patients: number;
  open_to_low_cost: boolean;
  years_experience: number;
}

export default function MatchDashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [patientsData, therapistsData] = await Promise.all([
        fetchPatientsForMatching(),
        fetchTherapistsForMatching()
      ]);
      
      console.log('Loaded patients:', patientsData?.length || 0);
      console.log('Loaded therapists:', therapistsData?.length || 0);
      
      setPatients(patientsData as Patient[]);
      setTherapists(therapistsData as Therapist[]);
      
      if (!patientsData || patientsData.length === 0) {
        console.warn('No patients found. Check RLS policies in Supabase.');
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedPatient || !selectedTherapist) {
      alert('Por favor selecciona un paciente y un terapeuta');
      return;
    }

    try {
      await createMatch(selectedPatient, selectedTherapist);
      
      setMatchCount(prev => prev + 1);
      alert('¡Match creado exitosamente! Se notificará a ambas partes.');
      
      // Remover el paciente de la lista (ya tiene match)
      setPatients(prev => prev.filter(p => p.id !== selectedPatient));
      
      setSelectedPatient(null);
      setSelectedTherapist(null);
    } catch (error: any) {
      console.error('Error creating match:', error);
      alert(`Error al crear el match: ${error.message || 'Error desconocido'}`);
    }
  };

  const getUrgencyVariant = (urgency: string) => {
    if (urgency === 'high') return 'danger';
    if (urgency === 'medium') return 'warning';
    return 'default';
  };

  const getBudgetLabel = (budget: string) => {
    if (budget === 'free') return 'Gratuito';
    if (budget === 'low-cost') return 'Bajo costo';
    return 'Estándar';
  };

  const getProfessionLabel = (profession: string) => {
    if (profession === 'psychologist') return 'Psicólogo/a';
    if (profession === 'psychiatrist') return 'Psiquiatra';
    return profession;
  };

  const getSessionFormatLabel = (format: string) => {
    if (format === 'online') return 'Online';
    if (format === 'presencial') return 'Presencial';
    if (format === 'hybrid') return 'Híbrido';
    return format;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B9D] mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Error al cargar los datos</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MesalibLogo size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Matches</h1>
                <p className="text-sm text-gray-600">Conecta pacientes con profesionales</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Users className="w-6 h-6 text-[#FF6B9D]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pacientes en espera</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Profesionales disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{therapists.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Matches realizados</p>
                <p className="text-2xl font-bold text-gray-900">{matchCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Match Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients Column */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
              <TagChip>{patients.length} en espera</TagChip>
            </div>
            <div className="space-y-4">
              {patients.map(patient => (
                <Card 
                  key={patient.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPatient === patient.id ? 'ring-2 ring-[#FF6B9D] bg-pink-50' : ''
                  }`}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.age_range}</p>
                      </div>
                      <TagChip variant={getUrgencyVariant(patient.urgency)}>
                        {patient.urgency === 'high' ? 'Alta urgencia' : patient.urgency === 'medium' ? 'Media' : 'Baja'}
                      </TagChip>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Necesidad principal:</p>
                      <p className="text-sm text-gray-900">{patient.main_reason || patient.needs?.[0] || 'No especificada'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {patient.languages?.map((lang: string) => (
                        <TagChip key={lang}>{lang}</TagChip>
                      ))}
                      <TagChip variant="success">{getBudgetLabel(patient.budget_range)}</TagChip>
                    </div>

                    <p className="text-xs text-gray-500">
                      Prefiere: {patient.preferred_professional === 'no-preference' ? 'Sin preferencia' : getProfessionLabel(patient.preferred_professional)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Therapists Column */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profesionales</h2>
              <TagChip>{therapists.length} disponibles</TagChip>
            </div>
            <div className="space-y-4">
              {therapists.map(therapist => (
                <Card 
                  key={therapist.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTherapist === therapist.id ? 'ring-2 ring-[#FF6B9D] bg-pink-50' : ''
                  }`}
                  onClick={() => setSelectedTherapist(therapist.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{therapist.name}</h3>
                        <p className="text-sm text-gray-600">{getProfessionLabel(therapist.profession)} • {therapist.years_experience} años exp.</p>
                      </div>
                      <TagChip variant={therapist.max_new_patients > 2 ? 'success' : 'warning'}>
                        {therapist.max_new_patients} cupos
                      </TagChip>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {therapist.specialties?.slice(0, 2).map((spec: string) => (
                          <TagChip key={spec}>{spec}</TagChip>
                        ))}
                        {therapist.specialties && therapist.specialties.length > 2 && (
                          <TagChip>+{therapist.specialties.length - 2}</TagChip>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {therapist.languages?.map((lang: string) => (
                        <TagChip key={lang}>{lang}</TagChip>
                      ))}
                      <TagChip>{getSessionFormatLabel(therapist.session_format)}</TagChip>
                      {therapist.open_to_low_cost && (
                        <TagChip variant="success">Bajo costo ✓</TagChip>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Match Action */}
        {(selectedPatient || selectedTherapist) && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="bg-white shadow-2xl border-2 border-[#FF6B9D]">
              <div className="flex items-center space-x-6">
                <div className="text-sm">
                  {selectedPatient && <p className="font-semibold">Paciente: {patients.find((p: Patient) => p.id === selectedPatient)?.name}</p>}
                  {selectedTherapist && <p className="font-semibold">Profesional: {therapists.find((t: Therapist) => t.id === selectedTherapist)?.name}</p>}
                </div>
                <Button 
                  onClick={handleMatch}
                  disabled={!selectedPatient || !selectedTherapist}
                  size="lg"
                >
                  Crear Match
                </Button>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setSelectedTherapist(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

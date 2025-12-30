'use client';

import React, { useState, useEffect } from 'react';
import { MesalibLogo } from '@/components/MesalibLogo';
import { Card } from '@/components/ui/card';
import { TagChip } from '@/components/ui/TagChip';
import { Button } from '@/components/ui/button';
import { 
  User, Heart, Calendar, MessageCircle, Settings, Bell, 
  Loader2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getMyTherapistProfile,
  getPendingMatchesForTherapist,
  getAcceptedMatchesForTherapist,
  acceptMatch,
  declineMatch
} from '@/lib/api';

export default function TherapistDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'sessions' | 'availability'>('overview');
  
  // Estados para datos reales
  const [therapistProfile, setTherapistProfile] = useState<any>(null);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadTherapistData();
    }
  }, [user, authLoading]);

  // Redirect a onboarding si no hay perfil
  useEffect(() => {
    if (!loading && !authLoading && !therapistProfile && user) {
      router.push('/onboarding/therapist');
    }
  }, [loading, authLoading, therapistProfile, user, router]);

  const loadTherapistData = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar perfil PRIMERO
      const profile = await getMyTherapistProfile().catch(() => null);
      setTherapistProfile(profile);
      setLoading(false); // ← Ya mostramos el dashboard
      
      if (!profile) return;
      
      // 2. Cargar matches en paralelo (sin bloquear UI)
      const [pending, accepted] = await Promise.all([
        getPendingMatchesForTherapist(profile.id).catch(() => []),
        getAcceptedMatchesForTherapist(profile.id).catch(() => [])
      ]);
      
      setPendingMatches(pending || []);
      setAcceptedMatches(accepted || []);
      
    } catch (error) {
      console.error('Error loading therapist data:', error);
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      setActionLoading(matchId);
      await acceptMatch(matchId);
      await loadTherapistData(); // Recargar datos
      alert('✅ Match aceptado! El paciente ha sido notificado.');
    } catch (error: any) {
      console.error('Error accepting match:', error);
      alert(`Error al aceptar el match: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    if (!confirm('¿Estás seguro de que quieres rechazar este match?')) {
      return;
    }
    
    try {
      setActionLoading(matchId);
      await declineMatch(matchId);
      await loadTherapistData(); // Recargar datos
      alert('Match rechazado. Buscaremos otro profesional para este paciente.');
    } catch (error: any) {
      console.error('Error declining match:', error);
      alert(`Error al rechazar el match: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Si está cargando, mostrar loader
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B9D]" />
      </div>
    );
  }

  // Si no hay perfil, mostrar loader mientras redirige
  if (!therapistProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B9D]" />
      </div>
    );
  }

  const therapistData = {
    id: therapistProfile.id,
    name: therapistProfile.name?.split(' ')[0] || 'Doctor',
    fullName: therapistProfile.name || 'Doctor',
    profession: therapistProfile.profession || 'Profesional',
    specialties: therapistProfile.specialties || [],
    currentPatients: therapistProfile.current_patients || 0,
    maxPatients: therapistProfile.max_new_patients || 0,
    pendingMatchesCount: pendingMatches.length,
    activePatients: acceptedMatches.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
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
                {therapistData.pendingMatchesCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {therapistData.pendingMatchesCount}
                  </span>
                )}
              </button>
              <Link href="/dashboard/therapist/profile">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
              >
                Cerrar Sesión
              </Button>
              <button className="w-10 h-10 bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] rounded-xl flex items-center justify-center text-white font-bold">
                {therapistData.name.charAt(0)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Hola, {therapistData.name} 👋
          </h1>
          <p className="text-xl text-gray-600">
            Panel de gestión profesional
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-pink-50 to-orange-50 border-pink-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Heart className="w-6 h-6 text-[#FF6B9D]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Matches Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {therapistData.pendingMatchesCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Pacientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {therapistData.activePatients}
                </p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Cupos Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {therapistData.maxPatients - therapistData.currentPatients}
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
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Matches {therapistData.pendingMatchesCount > 0 && `(${therapistData.pendingMatchesCount})`}
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sesiones
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'availability'
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Disponibilidad
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Matches */}
              {pendingMatches.length > 0 && (
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <AlertCircle className="w-6 h-6 mr-2 text-yellow-600" />
                      Matches Pendientes de Revisión
                    </h3>
                    <TagChip variant="warning">{pendingMatches.length}</TagChip>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Tienes {pendingMatches.length} {pendingMatches.length === 1 ? 'paciente' : 'pacientes'} esperando tu respuesta.
                  </p>
                  <Button onClick={() => setActiveTab('matches')}>
                    Ver Matches
                  </Button>
                </Card>
              )}

              {/* Active Patients */}
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Mis Pacientes Activos</h3>
                {acceptedMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Aún no tienes pacientes activos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedMatches.map((match: any) => (
                      <div key={match.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">{match.patient?.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{match.patient?.main_reason}</p>
                            <div className="flex gap-2 mt-2">
                              {match.patient?.needs?.slice(0, 2).map((need: string) => (
                                <TagChip key={need}>{need}</TagChip>
                              ))}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mi Perfil</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Especialidades</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {therapistData.specialties.slice(0, 3).map((spec: string) => (
                        <TagChip key={spec}>{spec}</TagChip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Capacidad</p>
                    <p className="font-bold text-gray-900">
                      {therapistData.currentPatients} / {therapistData.maxPatients} pacientes
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Link href="/dashboard/therapist/profile">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Editar perfil</span>
                      </div>
                    </button>
                  </Link>
                  <button 
                    onClick={() => setActiveTab('availability')}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Gestionar disponibilidad</span>
                    </div>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Pending Matches */}
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Matches Pendientes</h3>
              {pendingMatches.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No tienes matches pendientes en este momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMatches.map((match: any) => (
                    <div 
                      key={match.id}
                      className="p-6 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl border-2 border-pink-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-2xl font-bold text-gray-900">{match.patient?.name}</h4>
                            {match.patient?.urgency === 'high' && (
                              <TagChip variant="danger">🔴 Urgente</TagChip>
                            )}
                            {match.patient?.urgency === 'medium' && (
                              <TagChip variant="warning">🟡 Media</TagChip>
                            )}
                          </div>
                          <p className="text-gray-700 mb-3">
                            <strong>Razón principal:</strong> {match.patient?.main_reason}
                          </p>
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2"><strong>Necesidades:</strong></p>
                            <div className="flex flex-wrap gap-2">
                              {match.patient?.needs?.map((need: string) => (
                                <TagChip key={need}>{need}</TagChip>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Idiomas:</p>
                              <p className="font-medium">{match.patient?.languages?.join(', ')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Presupuesto:</p>
                              <p className="font-medium">{match.patient?.budget_range}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4 border-t border-pink-200">
                        <Button 
                          onClick={() => handleAcceptMatch(match.id)}
                          disabled={actionLoading === match.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === match.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Aceptando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Aceptar Match
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleDeclineMatch(match.id)}
                          disabled={actionLoading === match.id}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {actionLoading === match.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Rechazando...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 mr-2" />
                              Rechazar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Accepted Matches */}
            {acceptedMatches.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Matches Aceptados</h3>
                <div className="space-y-4">
                  {acceptedMatches.map((match: any) => (
                    <div key={match.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{match.patient?.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{match.patient?.main_reason}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Aceptado el {new Date(match.accepted_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Button size="sm">Ver Perfil Completo</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Gestión de Sesiones</h3>
            <p className="text-gray-600">Próximamente: calendario y gestión de sesiones</p>
          </Card>
        )}

        {activeTab === 'availability' && (
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mi Disponibilidad</h3>
            <p className="text-gray-600">Próximamente: gestión de horarios disponibles</p>
          </Card>
        )}
      </div>
    </div>
  );
}

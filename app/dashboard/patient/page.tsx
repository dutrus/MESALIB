'use client';

import React, { useState, useEffect } from 'react';
import { MesalibLogo } from '@/components/MesalibLogo';
import { Card } from '@/components/ui/card';
import { TagChip } from '@/components/ui/TagChip';
import { Button } from '@/components/ui/button';
import { 
  User, Heart, Calendar, MessageCircle, BookOpen, Settings,
  Bell, Loader2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getMyPatientProfile, 
  getMatchesForPatient, 
  getMyUpcomingSessions 
} from '@/lib/api';

export default function PatientDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'progress' | 'resources'>('overview');
  
  // Estados para datos reales
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadPatientData();
    }
  }, [user, authLoading]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Primero obtener el perfil una sola vez
      const profile = await getMyPatientProfile().catch(() => null);
      
      if (!profile) {
        setPatientProfile(null);
        setMatches([]);
        setUpcomingSessions([]);
        return;
      }
      
      setPatientProfile(profile);
      
      // Luego cargar matches y sesiones en paralelo usando el profile.id
      const [patientMatches, sessions] = await Promise.all([
        getMatchesForPatient(profile.id).catch(() => []),
        getMyUpcomingSessions().catch(() => [])
      ]);
      
      setMatches(patientMatches || []);
      setUpcomingSessions(sessions || []);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
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

  // Si no hay perfil, redirigir a onboarding
  if (!patientProfile) {
    router.push('/onboarding/patient');
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B9D]" />
      </div>
    );
  }

  // Encontrar el match aceptado para obtener el terapeuta
  const acceptedMatch = matches.find((m: any) => m.status === 'accepted');
  const therapist = acceptedMatch?.therapist || null;

  // Transformar datos
  const patientData = {
    id: patientProfile.id,
    name: patientProfile.name?.split(' ')[0] || 'Usuario',
    fullName: patientProfile.name || 'Usuario',
    pronouns: patientProfile.pronouns || '',
    email: user?.email || '',
    mainNeed: patientProfile.main_reason || '',
    secondaryNeeds: patientProfile.needs || [],
    urgency: patientProfile.urgency || 'medium',
    startDate: patientProfile.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    hasMatch: !!acceptedMatch,
    therapist: therapist ? {
      id: therapist.id,
      name: therapist.name || 'Terapeuta',
      profession: therapist.profession || '',
      specialty: therapist.specialties?.[0] || 'Terapia general',
      experience: therapist.years_experience ? `${therapist.years_experience} años` : 'Experiencia',
    } : null,
    nextSession: upcomingSessions[0] ? {
      id: upcomingSessions[0].id,
      dateTime: upcomingSessions[0].scheduled_time,
      duration: upcomingSessions[0].duration || 60,
    } : null,
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
              </button>
              <Link href="/dashboard/patient/profile">
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
                {patientData.name.charAt(0)}
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
            Hola, {patientData.name} 👋
          </h1>
          <p className="text-xl text-gray-600">
            {patientData.pronouns && `(${patientData.pronouns}) `}
            Bienvenida a tu espacio de bienestar
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-pink-50 to-orange-50 border-pink-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Heart className="w-6 h-6 text-[#FF6B9D]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Estado</p>
                <p className="text-lg font-bold text-gray-900">
                  {patientData.hasMatch ? 'Conectada' : 'Buscando profesional'}
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
                  {patientData.nextSession ? 
                    new Date(patientData.nextSession.dateTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) 
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
                <p className="text-lg font-bold text-gray-900">0 nuevos</p>
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
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mis Sesiones
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'progress'
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mi Progreso
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recursos
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Match Status */}
              {!patientData.hasMatch ? (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Heart className="w-8 h-8 text-[#FF6B9D] animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Estamos buscando el profesional ideal para ti
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Nuestro equipo está revisando tu perfil para conectarte con alguien que se ajuste a tus necesidades:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <TagChip>{patientData.mainNeed}</TagChip>
                      {patientData.secondaryNeeds.map((need: string) => (
                        <TagChip key={need}>{need}</TagChip>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-6">
                      📧 Te notificaremos por email cuando encontremos tu match
                    </p>
                  </div>
                </Card>
              ) : patientData.therapist ? (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Mi Terapeuta</h3>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                      {patientData.therapist.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900">{patientData.therapist.name}</h4>
                      <p className="text-gray-600 mb-2">{patientData.therapist.profession}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <TagChip>{patientData.therapist.specialty}</TagChip>
                        <TagChip>{patientData.therapist.experience}</TagChip>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>

            {/* Sidebar */}
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

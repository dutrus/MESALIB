'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MesalibLogo } from '@/components/MesalibLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginUser, getMyPatientProfile, getMyTherapistProfile } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await loginUser(formData.email, formData.password);
      
      if (!user || !user.role) {
        setError('No se pudo obtener el rol del usuario');
        setLoading(false);
        return;
      }

      // Verificar si el usuario tiene perfil
      let hasProfile = false;

      if (user.role === 'patient') {
        const profile = await getMyPatientProfile();
        hasProfile = !!profile;
        
        if (hasProfile) {
          router.push('/dashboard/patient');
        } else {
          router.push('/onboarding/patient');
        }
      } else if (user.role === 'therapist') {
        const profile = await getMyTherapistProfile();
        hasProfile = !!profile;
        
        if (hasProfile) {
          router.push('/dashboard/therapist');
        } else {
          router.push('/onboarding/therapist');
        }
      } else if (user.role === 'admin') {
        router.push('/admin/match');
      } else {
        setError('Rol de usuario no reconocido');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

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
            <div className="flex items-center space-x-4">
              <Link href="/signup/patient" className="text-sm text-gray-600 hover:text-[#FF6B9D] transition-colors">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent mb-4">
              Inicia sesión
            </h1>
            <p className="text-xl text-gray-600">
              Bienvenido de vuelta a MESALIB
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="tu@email.com"
              />

              <Input
                label="Contraseña"
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                placeholder="Tu contraseña"
              />

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] hover:opacity-90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">
                ¿No tienes cuenta?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/signup/patient" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-[#FF6B9D] text-[#FF6B9D] hover:bg-pink-50"
                  >
                    Registrarse como paciente
                  </Button>
                </Link>
                <Link href="/signup/therapist" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-[#FFA07A] text-[#FFA07A] hover:bg-orange-50"
                  >
                    Registrarse como terapeuta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

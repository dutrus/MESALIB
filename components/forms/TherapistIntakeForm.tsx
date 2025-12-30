'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpUser } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TherapistIntakeFormProps {
  initialData?: any;
}

export const TherapistIntakeForm: React.FC<TherapistIntakeFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar longitud mínima
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await signUpUser(formData.email, formData.password, 'therapist');
      alert('✅ Cuenta creada! Revisa tu email para verificar');
      router.push('/login');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
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
            placeholder="Mínimo 6 caracteres"
            minLength={6}
          />

          <Input
            label="Confirmar contraseña"
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            placeholder="Repite tu contraseña"
            minLength={6}
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
                Registrando...
              </>
            ) : (
              'Registrarse como terapeuta'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

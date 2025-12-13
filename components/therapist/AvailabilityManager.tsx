// ============================================================================
// FILE: components/therapist/AvailabilityManager.tsx
// Componente para gestionar disponibilidad del terapeuta
// ============================================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  deleteAvailabilitySlot,
  getMyTherapistProfile,
  getTherapistAvailability,
  setAvailability,
} from '@/lib/api';
import { AvailabilitySlot } from '@/types';
import { Loader2, Trash2 } from 'lucide-react';

const DEFAULT_TIMEZONE =
  typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

interface FormState {
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

const INITIAL_FORM: FormState = {
  date: '',
  startTime: '',
  endTime: '',
  timezone: DEFAULT_TIMEZONE,
};

export function AvailabilityManager() {
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAvailability = async () => {
      try {
        setLoading(true);
        const profile = await getMyTherapistProfile();
        if (!mounted) return;

        setTherapistId(profile.id);
        setTimezone(profile.timezone || DEFAULT_TIMEZONE);
        setForm((prev) => ({
          ...prev,
          timezone: profile.timezone || DEFAULT_TIMEZONE,
        }));

        const availability = await getTherapistAvailability(profile.id);
        if (!mounted) return;
        setSlots(availability);
      } catch (err: any) {
        console.error('Error loading availability:', err);
        if (!mounted) return;
        setError(
          err?.message || 'Ocurrió un error al cargar tu disponibilidad'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAvailability();

    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setForm({
      date: '',
      startTime: '',
      endTime: '',
      timezone,
    });
  };

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = useMemo(() => {
    if (!form.date || !form.startTime || !form.endTime) return false;
    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
  }, [form]);

  const handleAddSlot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      const start = new Date(`${form.date}T${form.startTime}`);
      const end = new Date(`${form.date}T${form.endTime}`);

      await setAvailability([
        {
          therapistId: therapistId || '',
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          timezone: form.timezone || timezone,
        },
      ]);

      if (!therapistId) return;
      const refreshed = await getTherapistAvailability(therapistId);
      setSlots(refreshed);
      resetForm();
    } catch (err: any) {
      console.error('Error adding availability slot:', err);
      setError(err?.message || 'No se pudo guardar la disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId?: string) => {
    if (!slotId) return;
    setSaving(true);
    setError(null);

    try {
      await deleteAvailabilitySlot(slotId);
      setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    } catch (err: any) {
      console.error('Error deleting slot:', err);
      setError(err?.message || 'No se pudo eliminar la disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Mi Disponibilidad
          </h2>
          <p className="text-sm text-gray-600">
            Define los bloques de horarios en los que puedes tomar nuevas
            sesiones. Los pacientes verán estas franjas disponibles al
            agendar.
          </p>
        </div>

        <form
          onSubmit={handleAddSlot}
          className="grid gap-4 md:grid-cols-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha
            </label>
            <Input
              type="date"
              value={form.date}
              onChange={(event) =>
                handleChange('date', event.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Hora inicio
            </label>
            <Input
              type="time"
              value={form.startTime}
              onChange={(event) =>
                handleChange('startTime', event.target.value)
              }
              required
            />
          </div>

  <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Hora fin
            </label>
            <Input
              type="time"
              value={form.endTime}
              onChange={(event) =>
                handleChange('endTime', event.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Zona horaria
            </label>
            <Input
              type="text"
              value={form.timezone}
              onChange={(event) =>
                handleChange('timezone', event.target.value)
              }
              placeholder="Ej: America/Buenos_Aires"
              required
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-3">
            <Button
              type="submit"
              disabled={!isFormValid || saving}
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Agregar disponibilidad
            </Button>
            <span className="text-xs text-gray-500">
              Asegúrate de que la hora final sea mayor a la hora inicial.
            </span>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Horarios publicados
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando disponibilidad...</span>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aún no definiste horarios disponibles.
          </p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              const locale = navigator?.language || 'es-ES';

              return (
                <div
                  key={slot.id}
                  className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {start.toLocaleDateString(locale, {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {start.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {end.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({slot.timezone})
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 md:mt-0"
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}









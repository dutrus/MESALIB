// ============================================================================
// FILE: components/patient/TherapistAvailability.tsx
// Componente para visualizar la disponibilidad de un terapeuta
// ============================================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAvailableSlots } from '@/lib/api';
import { AvailabilitySlot } from '@/types';
import { Loader2 } from 'lucide-react';

interface TherapistAvailabilityProps {
  therapistId: string;
  onSelectSlot?: (slot: AvailabilitySlot) => void;
  highlightDate?: Date;
  title?: string;
}

const DEFAULT_LOCALE = typeof navigator !== 'undefined' ? navigator.language : 'es-ES';

const dateToInputValue = (date: Date) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().split('T')[0];
};

export function TherapistAvailability({
  therapistId,
  onSelectSlot,
  highlightDate,
  title = 'Disponibilidad del terapeuta',
}: TherapistAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState(
    dateToInputValue(highlightDate || new Date())
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);

  const loadSlots = async (id: string, date: Date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAvailableSlots(id, date);
      setSlots(response);
    } catch (err: any) {
      console.error('Error loading availability:', err);
      setError(err?.message || 'No se pudo cargar la disponibilidad');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!therapistId) return;
    loadSlots(therapistId, selectedDateObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapistId, selectedDate]);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            Selecciona una franja horaria disponible para agendar una sesión.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Fecha
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando disponibilidad...</span>
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay horarios disponibles para la fecha seleccionada. Prueba con
          otra fecha.
        </p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => {
            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);

            return (
              <div
                key={slot.id}
                className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {start.toLocaleDateString(DEFAULT_LOCALE, {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {start.toLocaleTimeString(DEFAULT_LOCALE, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {end.toLocaleTimeString(DEFAULT_LOCALE, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ({slot.timezone})
                  </p>
                </div>

                {onSelectSlot && (
                  <Button
                    size="sm"
                    className="mt-3 md:mt-0"
                    onClick={() => onSelectSlot(slot)}
                  >
                    Reservar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}


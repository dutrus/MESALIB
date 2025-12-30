// ============================================================================
// FILE: lib/utils/errors.ts
// Utilidades para manejo de errores de Supabase y API
// ============================================================================

import type { PostgrestError } from '@supabase/supabase-js';
import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Convierte un error de Supabase a un formato más manejable
 */
export function formatSupabaseError(error: PostgrestError | Error | unknown): AppError {
  if (error instanceof Error) {
    // Si es un error de Supabase con estructura PostgrestError
    const supabaseError = error as unknown as PostgrestError;
    if (supabaseError.code && supabaseError.message) {
      return {
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        hint: supabaseError.hint,
      };
    }
    
    // Error estándar de JavaScript
    return {
      message: error.message,
    };
  }

  // Error desconocido
  return {
    message: 'Error desconocido',
  };
}

/**
 * Maneja errores de forma consistente y los registra
 */
export function handleError(error: unknown, context?: string): AppError {
  const formattedError = formatSupabaseError(error);
  
  logger.error(
    context ? `Error en ${context}` : 'Error',
    error instanceof Error ? error : new Error(formattedError.message),
    context ? { context } : undefined
  );

  return formattedError;
}

/**
 * Wrapper para llamadas fetch con mejor manejo de errores
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
    throw error;
  }
}

/**
 * Envía una notificación de forma segura (no bloquea si falla)
 */
export async function sendNotificationSafely(
  type: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const response = await safeFetch('/api/notify', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.warn('Notificación no enviada', {
        type,
        status: response.status,
        error: errorData,
      });
    }
  } catch (error) {
    // Las notificaciones son no-críticas, solo las registramos
    logger.warn('Error enviando notificación (no crítico)', {
      type,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}



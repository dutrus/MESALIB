// ============================================================================
// FILE: lib/api/index.ts
// ============================================================================
// Re-exportar todas las funciones de API para mantener compatibilidad hacia atrás

// Auth
export { signUpUser, loginUser } from './auth';

// Mantener exportaciones del archivo original por ahora
// TODO: Migrar gradualmente a módulos separados
export * from '../api';





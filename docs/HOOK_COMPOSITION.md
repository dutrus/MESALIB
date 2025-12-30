# Composición de Hooks - Guía de Buenas Prácticas

## 🎯 Principio Fundamental

**Separar hooks por fuente de verdad, no por pantalla.**

## ✅ Enfoque Correcto: Composición

```typescript
// ✅ CORRECTO: Hooks pequeños y específicos
const { profile } = usePatientProfile();
const { matches, acceptedMatch } = usePatientMatches(profile?.id);
const { sessions } = useUpcomingSessions();
```

### Ventajas

1. **Testeable**: Cada hook se testea de forma independiente
   ```typescript
   // Test fácil y aislado
   test('usePatientMatches carga matches correctamente', () => {
     const { result } = renderHook(() => usePatientMatches('patient-123'));
     // ...
   });
   ```

2. **Reutilizable**: Puedes usar el hook en cualquier componente
   ```typescript
   // En otro componente
   function MatchList() {
     const { matches } = usePatientMatches(patientId);
     // ...
   }
   ```

3. **Migrable**: Fácil cambiar la fuente de datos
   ```typescript
   // Migrar a React Query es trivial
   const { data: matches } = useQuery({
     queryKey: ['matches', patientId],
     queryFn: () => getMatchesForPatient(patientId),
   });
   ```

4. **Mantenible**: Cambios en un hook no afectan otros
   - Si cambias `usePatientProfile`, no afecta `usePatientMatches`
   - Cada hook tiene una responsabilidad única

5. **Composición flexible**: Usas solo lo que necesitas
   ```typescript
   // Solo necesitas el perfil? Perfecto
   function ProfilePage() {
     const { profile } = usePatientProfile();
     // ...
   }
   ```

## ❌ Enfoque Incorrecto: Centralización

```typescript
// ❌ INCORRECTO: Hook "mini-store" que centraliza todo
const { 
  profile, 
  matches, 
  sessions, 
  therapist,
  loading, 
  error 
} = usePatientDashboard();
```

### Problemas

1. **Difícil de testear**: Tienes que mockear múltiples fuentes de datos
2. **No reutilizable**: Solo funciona para el dashboard específico
3. **Difícil de migrar**: Si cambias a React Query, tienes que reescribir todo
4. **Acoplamiento fuerte**: Cambios en un área afectan otras
5. **Rígido**: No puedes usar solo parte de la funcionalidad

## 📐 Estructura de Hooks Actual

### Hooks por Dominio

```
lib/hooks/
├── usePatientProfile.ts      # ✅ Fuente única: perfil del paciente
├── usePatientMatches.ts      # ✅ Fuente única: matches del paciente
├── useUpcomingSessions.ts   # ✅ Fuente única: sesiones próximas
└── useAuth.ts               # ✅ Fuente única: autenticación
```

### Ejemplo de Uso en Componente

```typescript
// app/dashboard/patient/page.tsx
export default function PatientDashboardPage() {
  // ✅ Composición de hooks específicos
  const { profile, loading: profileLoading } = usePatientProfile();
  const { matches, acceptedMatch, therapist, loading: matchesLoading } = 
    usePatientMatches(profile?.id || null);
  const { sessions, loading: sessionsLoading } = useUpcomingSessions();
  
  // ✅ Combinar estados de loading
  const loading = profileLoading || matchesLoading || sessionsLoading;
  
  // ✅ Usar datos compuestos
  return (
    <div>
      <QuickStats 
        hasMatch={!!acceptedMatch}
        nextSession={sessions[0]}
      />
      <OverviewTab 
        profile={profile}
        match={acceptedMatch}
        therapist={therapist}
      />
    </div>
  );
}
```

## 🔄 Cuándo Crear un Hook Compuesto

Solo crea un hook compuesto cuando:

1. **La composición es específica de un dominio** (no de una pantalla)
2. **Hay lógica compartida** entre múltiples hooks
3. **La composición agrega valor** más allá de solo combinar hooks

### Ejemplo Válido de Hook Compuesto

```typescript
// ✅ VÁLIDO: Lógica de dominio compartida
function usePatientMatchStatus(patientId: string | null) {
  const { matches } = usePatientMatches(patientId);
  const acceptedMatch = useMemo(
    () => matches.find(m => m.status === 'accepted') || null,
    [matches]
  );
  const therapist = acceptedMatch?.therapist || null;
  
  return { acceptedMatch, therapist, hasMatch: !!acceptedMatch };
}

// Uso
const { hasMatch, therapist } = usePatientMatchStatus(profile?.id);
```

**Por qué es válido**: 
- Encapsula lógica de dominio (estado del match)
- Reutilizable en múltiples componentes
- No acopla a una pantalla específica

## 📚 Reglas de Oro

1. **Un hook = Una fuente de verdad**
2. **Componer en el componente, no en el hook**
3. **Hooks pequeños > Hooks grandes**
4. **Separar por dominio, no por pantalla**
5. **Si es difícil de testear, probablemente está mal diseñado**

## 🚀 Migración Futura a React Query

Con este enfoque, migrar a React Query es trivial:

```typescript
// Antes (hooks custom)
const { profile } = usePatientProfile();
const { matches } = usePatientMatches(profile?.id);

// Después (React Query)
const { data: profile } = useQuery({
  queryKey: ['patient', 'profile'],
  queryFn: getMyPatientProfile,
});

const { data: matches } = useQuery({
  queryKey: ['patient', 'matches', profile?.id],
  queryFn: () => getMatchesForPatient(profile!.id),
  enabled: !!profile?.id,
});
```

La composición se mantiene igual, solo cambias la implementación interna.



// app/auth/callback/route.ts
// Maneja el callback de verificación de email de Supabase

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Por defecto, redirigir a completar perfil (que verificará si hay datos pendientes)
  const next = requestUrl.searchParams.get('next') || '/complete-profile';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      // Redirigir al login si hay error
      return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
    }
  }

  // Redirigir a la página de completar perfil
  return NextResponse.redirect(new URL(next, request.url));
}


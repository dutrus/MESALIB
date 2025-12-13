// ============================================================================
// FILE: components/sections/Landing.tsx
// Landing/Hero section - New Professional Design
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import { MesalibLogo } from '@/components/MesalibLogo';
import { CommunityPreview } from './CommunityPreview';

interface LandingProps {
  setCurrentView?: (view: string) => void;
}

export const Landing: React.FC<LandingProps> = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo/Brand */}
            <div className="mb-8 flex flex-col items-center gap-4">
              <MesalibLogo size="xl" showBackground={true} className="shadow-lg" />
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-2 text-sm font-medium text-primary">
                <span>MESALIB</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Hablemos de salud mental, <span className="text-primary">sin miedo</span>
            </h1>

            {/* Manifesto */}
            <p className="mx-auto mb-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Un espacio de libertad emocional y comprensión colectiva. Aquí puedes respirar, compartir y crecer. Porque
              cuidar tu mente no es un lujo, es un derecho.
            </p>

            {/* Tagline */}
            <p className="mx-auto mb-12 text-2xl font-semibold text-primary md:text-3xl">
              Un cuidado a la vez
            </p>

            {/* CTA */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup/patient">
              <Button 
                size="lg" 
                className="group gap-2 text-lg"
              >
                  Comenzar como paciente
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              </Link>
              <Link href="/signup/therapist">
              <Button 
                variant="outline" 
                size="lg" 
                  className="text-lg"
                >
                  Soy profesional
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="text-lg"
              >
                  Iniciar sesión
              </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-16 text-balance text-center text-4xl font-bold md:text-5xl">
              Un espacio donde puedes <span className="text-primary">respirar</span>
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Value 1 */}
              <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Empatía primero</h3>
                <p className="leading-relaxed text-muted-foreground">
                  No hay métricas, no hay juicios. Solo comprensión y apoyo genuino entre personas que entienden.
                </p>
              </div>

              {/* Value 2 */}
              <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Comunidad segura</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Comparte tus reflexiones en un espacio diseñado para la autenticidad y el respeto mutuo.
                </p>
              </div>

              {/* Value 3 */}
              <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Acompañamiento IA</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Lib, tu compañero de IA, está aquí para escucharte cuando lo necesites, sin presión ni expectativas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Preview Section */}
      <CommunityPreview />

      {/* Manifesto Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/10 to-muted/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-8 text-balance text-3xl font-bold md:text-4xl">MESALIB significa libertad</h2>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                <strong className="font-semibold text-foreground">MEnte, SALud y LIBeración</strong>, un movimiento que nace
                de la convicción de que hablar de salud mental no debería dar miedo.
              </p>
              <p>
                Creemos en la tecnología con propósito, en la comunidad como refugio, y en la empatía como motor de
                cambio.
              </p>
              <p className="text-xl font-medium text-primary mb-8">Hoy elegí cuidar mi mente. ¿Y tú?</p>
              
              {/* Signup CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup/patient">
                  <Button size="lg" className="group gap-2">
                    Registrarse como paciente
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/signup/therapist">
                  <Button variant="outline" size="lg">
                    Unirse como profesional
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary" />
              <span>MESALIB — Una iniciativa de Victoria Dutra Amarilla</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 MESALIB. Hecho con amor y propósito.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

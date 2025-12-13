// ============================================================================
// FILE: components/sections/CommunityPreview.tsx
// Preview de la comunidad para la landing page con blur y CTA
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Lock, ArrowRight, Users, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

const mockPosts = [
  {
    id: 1,
    author: "María S.",
    initials: "MS",
    time: "Hace 2 horas",
    content: "Hoy decidí tomarme un descanso cuando lo necesitaba, sin culpa. A veces el mejor acto de amor propio es simplemente parar. Si alguien más está pasando por esto, no están solos.",
    likes: 12,
    comments: 3,
    needs: ['Ansiedad / ataques de pánico']
  },
  {
    id: 2,
    author: "Carlos R.",
    initials: "CR",
    time: "Hace 5 horas",
    content: "Llevo una semana practicando respiración consciente cada mañana. No resuelve todo, pero me ayuda a empezar el día con más calma.",
    likes: 8,
    comments: 5,
    needs: ['Ansiedad / ataques de pánico']
  },
  {
    id: 3,
    author: "Ana L.",
    initials: "AL",
    time: "Hace 1 día",
    content: "Recordatorio: está bien no estar bien. Está bien pedir ayuda. Está bien tomarte tu tiempo. Tu proceso es válido.",
    likes: 24,
    comments: 7,
    needs: ['Tristeza prolongada / depresión']
  },
];

export const CommunityPreview: React.FC = () => {
  const [isBlurred, setIsBlurred] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const blurThreshold = 200; // Píxeles desde el inicio de la sección antes de aplicar blur

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Cuando la sección está visible y el usuario ha scrolleado más allá del threshold
      // desde que la sección entró en la vista
      if (rect.top < windowHeight && rect.top > -rect.height) {
        // Calcular cuánto ha scrolleado dentro de la sección
        const scrollProgress = windowHeight - rect.top;
        if (scrollProgress > blurThreshold) {
          setIsBlurred(true);
        } else {
          setIsBlurred(false);
        }
      } else if (rect.top <= -rect.height / 2) {
        // Si la sección ya pasó completamente, mantener blur
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl relative">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
              Conecta con personas que <span className="text-primary">entienden</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Un espacio seguro donde puedes compartir, encontrar apoyo de pares, mentores y crecer junto a otros.
            </p>
          </div>

          {/* Community Preview Content */}
          <div className={`relative transition-all duration-500 ${isBlurred ? 'blur-md pointer-events-none' : ''}`}>
            {/* Features Preview */}
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              <div className="rounded-2xl bg-card p-6 shadow-sm border border-gray-200">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Pares / Peers</h3>
                <p className="text-sm text-muted-foreground">
                  Conecta con personas que comparten experiencias similares
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-sm border border-gray-200">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Mentores</h3>
                <p className="text-sm text-muted-foreground">
                  Encuentra guía de quienes han pasado por lo mismo
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-sm border border-gray-200">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Grupos</h3>
                <p className="text-sm text-muted-foreground">
                  Únete a comunidades de apoyo por temas específicos
                </p>
              </div>
            </div>

            {/* Posts Preview */}
            <div className="space-y-4">
              {mockPosts.slice(0, 2).map((post) => (
                <Card key={post.id} className="p-6 transition-all hover:shadow-md">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">{post.initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{post.author}</p>
                          <p className="text-sm text-muted-foreground">{post.time}</p>
                        </div>
                      </div>

                      <p className="mb-4 leading-relaxed text-gray-800 line-clamp-3">{post.content}</p>

                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Blur Overlay with CTA */}
          {isBlurred && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-10 rounded-2xl">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Únete a la comunidad
                </h3>
                <p className="mb-6 text-gray-600">
                  Regístrate gratis para acceder a la comunidad completa, conectar con pares, encontrar mentores y ser parte de grupos de apoyo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/signup/patient">
                    <Button size="lg" className="group gap-2">
                      Crear cuenta gratis
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">
                      Ya tengo cuenta
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* CTA at bottom when not blurred */}
          {!isBlurred && (
            <div className="mt-12 text-center">
              <p className="mb-6 text-lg text-muted-foreground">
                Regístrate para acceder a la comunidad completa
              </p>
              <Link href="/signup/patient">
                <Button size="lg" variant="outline" className="group gap-2">
                  Ver más
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


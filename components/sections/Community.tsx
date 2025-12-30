// ============================================================================
// FILE: components/sections/Community.tsx
// Community feed section - New Professional Design
// ============================================================================

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Plus, Lock } from 'lucide-react';
import Link from 'next/link';

const mockPosts = [
  {
    id: 1,
    author: "María S.",
    initials: "MS",
    time: "Hace 2 horas",
    content:
      "Hoy decidí tomarme un descanso cuando lo necesitaba, sin culpa. A veces el mejor acto de amor propio es simplemente parar.",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "Carlos R.",
    initials: "CR",
    time: "Hace 5 horas",
    content:
      "Llevo una semana practicando respiración consciente cada mañana. No resuelve todo, pero me ayuda a empezar el día con más calma.",
    likes: 8,
    comments: 5,
  },
  {
    id: 3,
    author: "Ana L.",
    initials: "AL",
    time: "Hace 1 día",
    content:
      "Recordatorio: está bien no estar bien. Está bien pedir ayuda. Está bien tomarte tu tiempo. Tu proceso es válido.",
    likes: 24,
    comments: 7,
  },
  {
    id: 4,
    author: "Diego M.",
    initials: "DM",
    time: "Hace 2 días",
    content:
      "Hoy hablé con alguien sobre cómo me siento. Fue difícil, pero necesario. Gracias a esta comunidad por darme el valor.",
    likes: 18,
    comments: 4,
  },
];

export const Community: React.FC = () => {
  const router = useRouter();
  
  // TODO: En producción, verificar autenticación real desde contexto/Supabase
  const isAuthenticated = false; // Mock - cambiar a verificación real

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirigir a login después de un breve delay para mostrar el mensaje
      const timer = setTimeout(() => {
        router.push('/login?redirect=/community');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  // Si no está autenticado, mostrar mensaje de redirección
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Acceso a la Comunidad</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            La comunidad está disponible solo para usuarios registrados. Serás redirigido al inicio de sesión...
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Ir a inicio de sesión
              </Button>
            </Link>
            <Link href="/signup/patient">
              <Button variant="outline" size="lg">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Comunidad</h1>
          <p className="text-muted-foreground">Un espacio seguro para compartir, sin métricas ni comparaciones.</p>
        </div>

        {/* Post Input */}
        <Card className="mb-8 p-6">
          <textarea 
            placeholder="¿Qué hay en tu mente hoy? Comparte con empatía..."
            className="w-full p-5 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] focus:border-transparent text-gray-700 placeholder-gray-400 mb-4 min-h-[100px]"
            rows={4}
            aria-label="Compartir pensamiento"
          />
          <div className="flex justify-end">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Compartir
            </Button>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <Card key={post.id} className="p-6 transition-all hover:shadow-md">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">{post.initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-muted-foreground">{post.time}</p>
                    </div>
                  </div>

                  <p className="mb-4 leading-relaxed text-foreground">{post.content}</p>

                  <div className="flex items-center gap-4">
                    <Button variant="secondary" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
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
    </div>
  );
};

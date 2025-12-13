// ============================================================================
// FILE: components/sections/Profile.tsx
// User profile section - New Professional Design
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Pencil, Heart } from 'lucide-react';

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "María Sánchez",
    bio: "En mi camino hacia el bienestar emocional. Aprendiendo a ser más amable conmigo misma cada día.",
    goal: "Practicar mindfulness y reducir la ansiedad",
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="p-8">
            <div className="flex flex-col items-center text-center">
              <Avatar className="mb-4 h-24 w-24 border-4 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {isEditing ? (
                <div className="w-full max-w-md space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal">Meta emocional</Label>
                    <Input
                      id="goal"
                      value={profile.goal}
                      onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} className="flex-1">
                      Guardar cambios
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="mb-2 text-2xl font-bold">{profile.name}</h1>
                  <p className="mb-4 max-w-md leading-relaxed text-muted-foreground">{profile.bio}</p>

                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Heart className="h-4 w-4" />
                    <span>{profile.goal}</span>
                  </div>

                  <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar perfil
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Emotional Journey */}
          <Card className="p-8">
            <h2 className="mb-6 text-xl font-semibold">Tu camino emocional</h2>

            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                <p className="text-center text-lg font-medium text-primary">&quot;Hoy elegí cuidar mi mente&quot;</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-secondary/20 p-4 text-center">
                  <p className="mb-1 text-2xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground">Días activo</p>
                </div>
                <div className="rounded-lg bg-secondary/20 p-4 text-center">
                  <p className="mb-1 text-2xl font-bold text-primary">8</p>
                  <p className="text-sm text-muted-foreground">Reflexiones</p>
                </div>
                <div className="rounded-lg bg-secondary/20 p-4 text-center">
                  <p className="mb-1 text-2xl font-bold text-primary">5</p>
                  <p className="text-sm text-muted-foreground">Recursos leídos</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

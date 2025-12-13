// ============================================================================
// FILE: components/sections/Resources.tsx
// Resources grid section - New Professional Design
// ============================================================================

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, Activity } from 'lucide-react';

const resources = [
  {
    id: 1,
    type: "article",
    title: "Entendiendo la ansiedad",
    description: "Una guía completa sobre qué es la ansiedad y cómo manejarla en el día a día.",
    category: "Ansiedad",
    duration: "8 min lectura",
    icon: BookOpen,
  },
  {
    id: 2,
    type: "video",
    title: "Meditación guiada para principiantes",
    description: "Aprende técnicas básicas de meditación para encontrar calma interior.",
    category: "Meditación",
    duration: "15 min",
    icon: Video,
  },
  {
    id: 3,
    type: "exercise",
    title: "Ejercicio de respiración consciente",
    description: "Técnica simple de respiración para momentos de estrés o ansiedad.",
    category: "Respiración",
    duration: "5 min",
    icon: Activity,
  },
  {
    id: 4,
    type: "article",
    title: "Practicando la autocompasión",
    description: "Cómo ser más amable contigo mismo en momentos difíciles.",
    category: "Autocompasión",
    duration: "10 min lectura",
    icon: BookOpen,
  },
  {
    id: 5,
    type: "video",
    title: "Manejo del estrés laboral",
    description: "Estrategias prácticas para mantener tu bienestar en el trabajo.",
    category: "Estrés",
    duration: "12 min",
    icon: Video,
  },
  {
    id: 6,
    type: "exercise",
    title: "Diario de gratitud",
    description: "Ejercicio diario para cultivar una mentalidad más positiva.",
    category: "Bienestar",
    duration: "10 min",
    icon: Activity,
  },
];

export const Resources: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Recursos</h1>
          <p className="text-muted-foreground">Herramientas curadas para tu bienestar emocional</p>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id} className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary">{resource.category}</Badge>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold">{resource.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>

                  <p className="text-xs text-muted-foreground">{resource.duration}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

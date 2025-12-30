// ============================================================================
// FILE: components/community/CommunitySection.tsx
// Community section - Peer support, Mentors, Groups (like Talk to a Peer / PatientsLikeMe)
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TagChip } from '@/components/ui/TagChip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Plus, 
  Users, 
  Star, 
  Send,
  UserPlus,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { CommunityPost, Mentor, CommunityGroup, PatientProfile } from '@/types';

// Mock data - En producción vendría de Supabase
const mockPosts: CommunityPost[] = [
  {
    id: '1',
    authorId: 'p1',
    authorName: 'María S.',
    authorInitials: 'MS',
    content: 'Hoy decidí tomarme un descanso cuando lo necesitaba, sin culpa. A veces el mejor acto de amor propio es simplemente parar. Si alguien más está pasando por esto, no están solos.',
    needs: ['Ansiedad / ataques de pánico', 'Estrés académico / laboral'],
    likes: 12,
    comments: 3,
    isAnonymous: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    timeAgo: 'Hace 2 horas'
  },
  {
    id: '2',
    authorId: 'p2',
    authorName: 'Carlos R.',
    authorInitials: 'CR',
    content: 'Llevo una semana practicando respiración consciente cada mañana. No resuelve todo, pero me ayuda a empezar el día con más calma. Si alguien quiere probarlo, puedo compartir la técnica que me enseñó mi mentora.',
    needs: ['Ansiedad / ataques de pánico'],
    likes: 8,
    comments: 5,
    isAnonymous: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    timeAgo: 'Hace 5 horas'
  },
  {
    id: '3',
    authorId: 'p3',
    authorName: 'Ana L.',
    authorInitials: 'AL',
    content: 'Recordatorio: está bien no estar bien. Está bien pedir ayuda. Está bien tomarte tu tiempo. Tu proceso es válido. A quienes están empezando, les mando un abrazo virtual 💚',
    needs: ['Tristeza prolongada / depresión', 'Duelo / pérdida'],
    likes: 24,
    comments: 7,
    isAnonymous: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    timeAgo: 'Hace 1 día'
  },
];

interface PeerProfile extends PatientProfile {
  commonNeeds: string[];
  connectionStatus?: 'none' | 'pending' | 'connected';
}

const mockPeers: PeerProfile[] = [
  {
    id: 'p4',
    userId: 'u4',
    name: 'Diego M.',
    ageRange: '25-34',
    pronouns: 'él/he',
    contactPreference: 'email',
    country: 'México',
    timezone: 'GMT-6',
    mainReason: 'Ansiedad social y estrés laboral',
    needs: ['Ansiedad / ataques de pánico', 'Estrés académico / laboral'],
    urgency: 'medium',
    preferredProfessional: 'psychologist',
    languages: ['Español'],
    budgetRange: 'low-cost',
    availability: 'Tardes',
    createdAt: new Date(),
    commonNeeds: ['Ansiedad / ataques de pánico', 'Estrés académico / laboral'],
    connectionStatus: 'none'
  },
  {
    id: 'p5',
    userId: 'u5',
    name: 'Sofía R.',
    ageRange: '18-24',
    pronouns: 'ella/she',
    contactPreference: 'whatsapp',
    country: 'Argentina',
    timezone: 'GMT-3',
    mainReason: 'Luchando con ansiedad y ataques de pánico',
    needs: ['Ansiedad / ataques de pánico'],
    urgency: 'high',
    preferredProfessional: 'psychologist',
    languages: ['Español'],
    budgetRange: 'free',
    availability: 'Fines de semana',
    createdAt: new Date(),
    commonNeeds: ['Ansiedad / ataques de pánico'],
    connectionStatus: 'connected'
  },
];

const mockMentors: Mentor[] = [
  {
    id: 'm1',
    patientId: 'pm1',
    name: 'Laura G.',
    initials: 'LG',
    pronouns: 'ella/she',
    specialties: ['Ansiedad / ataques de pánico', 'Estrés académico / laboral'],
    bio: 'Superé mi ansiedad severa hace 5 años. Ahora ayudo a otros a encontrar sus herramientas de bienestar. No estás solo/a en esto.',
    yearsInRecovery: 5,
    languages: ['Español', 'Inglés'],
    country: 'España',
    isAvailable: true,
    menteesCount: 12,
    rating: 4.9,
    createdAt: new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'm2',
    patientId: 'pm2',
    name: 'Roberto T.',
    initials: 'RT',
    pronouns: 'él/he',
    specialties: ['Tristeza prolongada / depresión', 'Duelo / pérdida'],
    bio: 'Pasé por una depresión profunda y ahora, después de 3 años de recuperación, me dedico a apoyar a otros en su camino.',
    yearsInRecovery: 3,
    languages: ['Español'],
    country: 'Colombia',
    isAvailable: true,
    menteesCount: 8,
    rating: 4.8,
    createdAt: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000)
  },
];

const mockGroups: CommunityGroup[] = [
  {
    id: 'g1',
    name: 'Ansiedad y Pánico',
    description: 'Espacio seguro para compartir experiencias sobre ansiedad y ataques de pánico',
    focusNeed: 'Ansiedad / ataques de pánico',
    membersCount: 45,
    isPrivate: false,
    createdAt: new Date()
  },
  {
    id: 'g2',
    name: 'Depresión y Duelo',
    description: 'Apoyo mutuo para quienes están pasando por tristeza prolongada o duelo',
    focusNeed: 'Tristeza prolongada / depresión',
    membersCount: 32,
    isPrivate: false,
    createdAt: new Date()
  },
];

// Current user's needs (mock - en producción vendría del perfil del usuario)
// const currentUserNeeds = ['Ansiedad / ataques de pánico', 'Estrés académico / laboral'];

type TabType = 'feed' | 'peers' | 'mentors' | 'groups';

export const CommunitySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    // TODO: Implementar publicación
    console.log('Posting:', newPostContent);
    setNewPostContent('');
  };

  const handleConnectPeer = (peerId: string) => {
    // TODO: Implementar conexión
    console.log('Connecting to peer:', peerId);
  };

  const handleRequestMentor = (mentorId: string) => {
    // TODO: Implementar solicitud de mentoría
    console.log('Requesting mentor:', mentorId);
  };

  const filteredPeers = mockPeers.filter(peer => {
    if (searchQuery && !peer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedNeeds.length > 0 && !selectedNeeds.some(need => peer.commonNeeds.includes(need))) return false;
    return true;
  });

  const filteredMentors = mockMentors.filter(mentor => {
    if (searchQuery && !mentor.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedNeeds.length > 0 && !selectedNeeds.some(need => mentor.specialties.includes(need))) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Comunidad MESALIB</h2>
        <p className="text-gray-600 mb-6">
          Conecta con personas que entienden tu camino. Encuentra apoyo, mentores y un espacio seguro para crecer.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'feed'
                ? 'border-[#FF6B9D] text-[#FF6B9D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Feed
            </div>
          </button>
          <button
            onClick={() => setActiveTab('peers')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'peers'
                ? 'border-[#FF6B9D] text-[#FF6B9D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pares / Peers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'mentors'
                ? 'border-[#FF6B9D] text-[#FF6B9D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Mentores
            </div>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'groups'
                ? 'border-[#FF6B9D] text-[#FF6B9D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Grupos
            </div>
          </button>
        </div>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Post Input */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">TU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="¿Qué hay en tu mente hoy? Comparte con empatía... (puedes mantenerte anónimo si prefieres)"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] focus:border-transparent text-gray-700 placeholder-gray-400 min-h-[120px]"
                  rows={4}
                  aria-label="Compartir pensamiento"
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    💡 Comparte tu experiencia. Puede ayudar a alguien más.
                  </p>
                  <Button onClick={handlePostSubmit} className="gap-2" disabled={!newPostContent.trim()}>
                    <Plus className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <Card key={post.id} className="p-6 transition-all hover:shadow-lg">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">{post.authorInitials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{post.authorName}</p>
                        <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                      </div>
                      <div className="flex gap-2">
                        {post.needs.map(need => (
                          <TagChip key={need} variant="default">{need}</TagChip>
                        ))}
                      </div>
                    </div>

                    <p className="mb-4 leading-relaxed text-gray-800">{post.content}</p>

                    <div className="flex items-center gap-4">
                      <Button variant="secondary" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <Send className="h-4 w-4" />
                        Conectar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Peers Tab */}
      {activeTab === 'peers' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <p className="text-sm font-medium text-gray-700">Filtrar por necesidades:</p>
              {['Ansiedad / ataques de pánico', 'Tristeza prolongada / depresión', 'Estrés académico / laboral'].map(need => (
                <button
                  key={need}
                  onClick={() => {
                    setSelectedNeeds(prev => 
                      prev.includes(need) 
                        ? prev.filter(n => n !== need)
                        : [...prev, need]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedNeeds.includes(need)
                      ? 'bg-[#FF6B9D] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {need}
                </button>
              ))}
            </div>
          </Card>

          {/* Peers List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              Personas con necesidades similares ({filteredPeers.length})
            </h3>
            {filteredPeers.map((peer) => (
              <Card key={peer.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {peer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{peer.name}</h4>
                        <p className="text-sm text-gray-600">{peer.pronouns} • {peer.country}</p>
                      </div>
                      {peer.connectionStatus === 'connected' && (
                        <TagChip variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Conectado
                        </TagChip>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{peer.mainReason}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-600">Necesidades en común:</span>
                      {peer.commonNeeds.map(need => (
                        <TagChip key={need}>{need}</TagChip>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {peer.connectionStatus === 'none' && (
                        <Button size="sm" onClick={() => handleConnectPeer(peer.id)} className="gap-2">
                          <UserPlus className="w-4 h-4" />
                          Conectar
                        </Button>
                      )}
                      {peer.connectionStatus === 'pending' && (
                        <Button size="sm" variant="outline" disabled className="gap-2">
                          <Clock className="w-4 h-4" />
                          Pendiente
                        </Button>
                      )}
                      {peer.connectionStatus === 'connected' && (
                        <Button size="sm" variant="outline" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Enviar mensaje
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" className="gap-2">
                        Ver perfil
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Tab */}
      {activeTab === 'mentors' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">¿Qué es un Mentor?</h3>
                <p className="text-gray-700">
                  Los mentores son personas que han pasado por experiencias similares y ahora están en un lugar de bienestar.
                  Ofrecen apoyo basado en experiencia, no son profesionales, pero pueden ser una guía valiosa en tu camino.
                </p>
              </div>
            </div>
          </Card>

          {/* Search */}
          <Card className="p-6">
            <Input
              placeholder="Buscar mentores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </Card>

          {/* Mentors List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              Mentores Disponibles ({filteredMentors.length})
            </h3>
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] text-white text-lg">
                      {mentor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg text-gray-900">{mentor.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold text-gray-700">{mentor.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{mentor.pronouns} • {mentor.country}</p>
                      </div>
                      {mentor.isAvailable ? (
                        <TagChip variant="success">Disponible</TagChip>
                      ) : (
                        <TagChip variant="warning">Ocupado/a</TagChip>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-600">Especialidades:</span>
                      {mentor.specialties.map(specialty => (
                        <TagChip key={specialty} variant="default">{specialty}</TagChip>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{mentor.yearsInRecovery} años de bienestar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{mentor.menteesCount} mentoreados</span>
                      </div>
                    </div>
                    <Button onClick={() => handleRequestMentor(mentor.id)} className="gap-2">
                      <Star className="w-4 h-4" />
                      Solicitar mentoría
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Grupos de Apoyo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockGroups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg text-gray-900">{group.name}</h4>
                  {group.isPrivate && (
                    <Shield className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-700 mb-4">{group.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{group.membersCount} miembros</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Unirse
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export type CollabGoal =
  | 'Banda Fixa'
  | 'Colaboração Pontual'
  | 'Jam Session'
  | 'Trabalho Remunerado'
  | 'Substituição Temporária';

export type Instrument =
  | 'Guitarra'
  | 'Baixo'
  | 'Bateria'
  | 'Teclado'
  | 'Voz'
  | 'Violão'
  | 'Saxofone'
  | 'Trompete'
  | 'Violino'
  | 'Produção';

export type SkillLevel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Profissional';

/** Avaliação pós-colaboração (nota + comentário de um músico sobre outro). */
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  /** Nome/foto do autor, resolvidos na leitura. */
  reviewerName?: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  context: string;
  createdAt?: string;
}

/** Vaga aberta postada por um usuário ("procuramos baterista para indie rock"). */
export interface Opening {
  id: string;
  authorId: string;
  /** Nome do autor, para exibição (resolvido na leitura). */
  authorName?: string;
  authorAvatar?: string;
  title: string;
  description: string;
  /** Instrumentos procurados. */
  instruments: Instrument[];
  genres: string[];
  /** Nível desejado; undefined = qualquer. */
  level?: SkillLevel;
  goal: CollabGoal;
  location: string;
  coordinates?: { lat: number; lng: number };
  isOpen: boolean;
  createdAt?: string;
  /** Relevância calculada para o usuário atual (0–100). */
  matchScore?: number;
  matchReasons?: string[];
}

/** Dias da semana usados na grade de disponibilidade. */
export type Weekday = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';

/** Faixas de horário usadas na grade de disponibilidade. */
export type TimeSlot = 'Manhã' | 'Tarde' | 'Noite';

/**
 * Disponibilidade estruturada em grade dia x turno.
 * Ex.: { 'Sáb': ['Tarde', 'Noite'], 'Dom': ['Manhã'] }
 */
export type AvailabilitySchedule = Partial<Record<Weekday, TimeSlot[]>>;

/** O que o músico tem disponível para ensaios e gravações. */
export type EquipmentLevel =
  | 'Estúdio próprio'
  | 'Equipamento portátil'
  | 'Apenas instrumento'
  | 'Sem equipamento';

/** Amostra artística: trecho de áudio ou vídeo do músico tocando. */
export interface MediaSample {
  id: string;
  type: 'audio' | 'video';
  /** URI local (file://) ou URL remota do arquivo. */
  uri: string;
  title: string;
  /** Duração em segundos, quando conhecida. */
  durationSec?: number;
  /** Miniatura para amostras de vídeo. */
  thumbnailUri?: string;
}

/** Histórico de experiência de banda/palco do músico. */
export interface BandExperience {
  /** Já tocou ao vivo em shows. */
  playedLive: boolean;
  /** Já gravou em estúdio ou de forma independente. */
  recorded: boolean;
  /** Anos de experiência em bandas anteriores. */
  yearsInBands: number;
  /** Descrição livre das bandas/projetos anteriores. */
  notes?: string;
}

/**
 * Soft skills autodeclaradas, cada uma em escala 1-5.
 * Usadas tanto na vitrine do perfil quanto como sinal para o algoritmo.
 */
export interface SoftSkills {
  /** Pontualidade e confiabilidade de agenda. */
  punctuality: number;
  /** Nível de comprometimento com os projetos. */
  commitment: number;
  /** Abertura a experimentar novos estilos e ideias. */
  openness: number;
}

export interface Artist {
  id: string;
  name: string;
  age: number;
  role: string;
  instruments: Instrument[];
  level: SkillLevel;
  genres: string[];
  influences: string[];
  location: string;
  coordinates: { lat: number; lng: number };

  /**
   * Disponibilidade em texto livre (legado, usado na UI atual).
   * Será substituída gradualmente por `schedule`.
   */
  availability: string[];
  /** Disponibilidade estruturada em grade dia x turno. */
  schedule?: AvailabilitySchedule;

  /** Objetivos de colaboração. Múltiplos são permitidos. */
  goals: CollabGoal[];

  /** Equipamento disponível para ensaios/gravações. */
  equipment?: EquipmentLevel;
  /** Histórico de experiência de banda e palco. */
  bandExperience?: BandExperience;
  /** Soft skills autodeclaradas. */
  softSkills?: SoftSkills;
  /** Amostras artísticas de áudio e vídeo. */
  mediaSamples?: MediaSample[];

  connections: number;
  bio: string;
  vibeColor: string;
  vibeColorName: string;
  favAlbum: string;
  favAlbumCover: string;
  socials: { instagram?: string; youtube?: string; spotify?: string };
  matchScore?: number;
  matchReasons?: string[];
  /** Imagem exibida (URL do storage ou fallback mock). */
  avatar: string;
  coverImage: string;
  /** URLs de mídia enviadas pelo usuário ao storage (undefined = ainda não enviou). */
  avatarUrl?: string;
  coverUrl?: string;
  /** Data de criação do perfil (ISO). Usada no boost de perfis novos. */
  createdAt?: string;
  /** Média de avaliações recebidas (0 se nunca foi avaliado). */
  ratingAvg?: number;
  /** Quantidade de avaliações recebidas. */
  ratingCount?: number;
}

export const MOCK_ARTISTS: Artist[] = [
  {
    id: '1',
    name: 'Mariana Luz',
    age: 27,
    role: 'Cantora & Compositora',
    instruments: ['Voz', 'Violão'],
    level: 'Profissional',
    genres: ['Soul', 'R&B', 'MPB'],
    influences: ['Erykah Badu', 'Seu Jorge', 'Gilberto Gil'],
    location: 'São Paulo, SP',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    availability: ['Fins de semana', 'Noites'],
    schedule: { Sex: ['Noite'], Sáb: ['Tarde', 'Noite'], Dom: ['Tarde'] },
    goals: ['Banda Fixa'],
    equipment: 'Equipamento portátil',
    bandExperience: { playedLive: true, recorded: true, yearsInBands: 8, notes: 'Vocalista de duas bandas de soul em SP.' },
    softSkills: { punctuality: 5, commitment: 5, openness: 4 },
    mediaSamples: [
      { id: 's1a', type: 'audio', uri: 'https://example.com/samples/mariana-voz.mp3', title: 'Trecho - voz e violão', durationSec: 42 },
    ],
    connections: 312,
    bio: 'Cantora independente apaixonada por soul e MPB. Buscando banda fixa para shows e gravações.',
    vibeColor: '#8B5CF6',
    vibeColorName: 'Deep Violet',
    favAlbum: 'Baduizm',
    favAlbumCover: 'https://upload.wikimedia.org/wikipedia/en/6/69/Baduizm.jpg',
    socials: { instagram: 'mariana.luz', spotify: 'mariana_luz' },
    matchScore: 94,
    matchReasons: ['Gêneros compatíveis: Soul, R&B', 'Nível profissional', 'SP - 3 km'],
    avatar: 'https://i.pravatar.cc/300?img=47',
    coverImage: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=500',
  },
  {
    id: '2',
    name: 'Bruno Carrasco',
    age: 31,
    role: 'Guitarrista',
    instruments: ['Guitarra', 'Violão'],
    level: 'Avançado',
    genres: ['Rock', 'Blues', 'Jazz'],
    influences: ['Jimi Hendrix', 'B.B. King', 'John Mayer'],
    location: 'São Paulo, SP',
    coordinates: { lat: -23.5489, lng: -46.6388 },
    availability: ['Noites', 'Fins de semana'],
    schedule: { Qua: ['Noite'], Qui: ['Noite'], Sáb: ['Tarde', 'Noite'] },
    goals: ['Colaboração Pontual', 'Jam Session'],
    equipment: 'Estúdio próprio',
    bandExperience: { playedLive: true, recorded: true, yearsInBands: 12, notes: '12 anos de estrada em bandas de rock e blues.' },
    softSkills: { punctuality: 4, commitment: 4, openness: 5 },
    mediaSamples: [
      { id: 's2a', type: 'video', uri: 'https://example.com/samples/bruno-solo.mp4', title: 'Solo de guitarra - blues', durationSec: 58, thumbnailUri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200' },
    ],
    connections: 178,
    bio: 'Guitarrista com 12 anos de estrada. Aberto a gravações, shows e jams.',
    vibeColor: '#DC2626',
    vibeColorName: 'Crimson',
    favAlbum: 'Are You Experienced',
    favAlbumCover: 'https://upload.wikimedia.org/wikipedia/en/6/6c/AreYouExperienced.jpg',
    socials: { instagram: 'brunocarrasco', youtube: 'brunocarrascoguitarra' },
    matchScore: 87,
    matchReasons: ['Complemento: Guitarra + Voz', 'Rock como gênero em comum', 'SP - 1 km'],
    avatar: 'https://i.pravatar.cc/300?img=12',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
  },
  {
    id: '3',
    name: 'Lara Kim',
    age: 24,
    role: 'Baterista',
    instruments: ['Bateria'],
    level: 'Intermediário',
    genres: ['Pop', 'Indie', 'Eletrônico'],
    influences: ['Questlove', 'Dave Grohl', 'Travis Barker'],
    location: 'Santo André, SP',
    coordinates: { lat: -23.6639, lng: -46.5383 },
    availability: ['Fins de semana'],
    schedule: { Sáb: ['Manhã', 'Tarde'], Dom: ['Tarde'] },
    goals: ['Banda Fixa'],
    equipment: 'Apenas instrumento',
    bandExperience: { playedLive: true, recorded: false, yearsInBands: 6, notes: 'Toquei em uma banda de indie no ABC por 3 anos.' },
    softSkills: { punctuality: 5, commitment: 4, openness: 3 },
    mediaSamples: [],
    connections: 89,
    bio: 'Baterista de 6 anos. Adoro pop e indie. Quero entrar numa banda séria.',
    vibeColor: '#059669',
    vibeColorName: 'Emerald',
    favAlbum: 'Random Access Memories',
    favAlbumCover: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Random_Access_Memories.jpg',
    socials: { instagram: 'lara.drums' },
    matchScore: 82,
    matchReasons: ['Complemento: Bateria na banda', 'Disponibilidade: fins de semana', 'Grande SP'],
    avatar: 'https://i.pravatar.cc/300?img=32',
    coverImage: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=500',
  },
  {
    id: '4',
    name: 'Rafael Torres',
    age: 34,
    role: 'Baixista Profissional',
    instruments: ['Baixo'],
    level: 'Profissional',
    genres: ['Funk', 'Jazz', 'MPB'],
    influences: ['Jaco Pastorius', 'Marcus Miller', 'Nico Assumpção'],
    location: 'São Paulo, SP',
    coordinates: { lat: -23.5630, lng: -46.6543 },
    availability: ['Dias úteis', 'Noites'],
    schedule: { Seg: ['Noite'], Ter: ['Noite'], Qua: ['Noite'], Qui: ['Noite'] },
    goals: ['Trabalho Remunerado', 'Substituição Temporária'],
    equipment: 'Equipamento portátil',
    bandExperience: { playedLive: true, recorded: true, yearsInBands: 10, notes: 'Baixista de sessão, mais de 200 shows e 15 gravações.' },
    softSkills: { punctuality: 5, commitment: 5, openness: 4 },
    mediaSamples: [
      { id: 's4a', type: 'audio', uri: 'https://example.com/samples/rafael-groove.mp3', title: 'Groove de funk', durationSec: 35 },
      { id: 's4b', type: 'video', uri: 'https://example.com/samples/rafael-live.mp4', title: 'Ao vivo - Sesc', durationSec: 71, thumbnailUri: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200' },
    ],
    connections: 521,
    bio: 'Baixista de sessão com 10 anos. Gravações, shows, tournês. Entre em contato!',
    vibeColor: '#D97706',
    vibeColorName: 'Amber',
    favAlbum: 'Head Hunters',
    favAlbumCover: 'https://upload.wikimedia.org/wikipedia/en/3/3b/HeadHunters.jpg',
    socials: { instagram: 'rafaeltorres_bass', youtube: 'rafaeltorresbass', spotify: 'rafael_torres' },
    matchScore: 91,
    matchReasons: ['Nível profissional', 'Baixo complementa a formação', 'Disponível dias úteis'],
    avatar: 'https://i.pravatar.cc/300?img=65',
    coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500',
  },
  {
    id: '5',
    name: 'Camila Fonseca',
    age: 29,
    role: 'Tecladista & Produtora',
    instruments: ['Teclado', 'Produção'],
    level: 'Avançado',
    genres: ['Eletrônico', 'Synth-pop', 'Indie'],
    influences: ['Imogen Heap', 'Tame Impala', 'Jon Hopkins'],
    location: 'Campinas, SP',
    coordinates: { lat: -22.9099, lng: -47.0626 },
    availability: ['Fins de semana', 'Remoto'],
    schedule: { Sex: ['Tarde', 'Noite'], Sáb: ['Manhã', 'Tarde', 'Noite'] },
    goals: ['Colaboração Pontual'],
    equipment: 'Estúdio próprio',
    bandExperience: { playedLive: false, recorded: true, yearsInBands: 5, notes: 'Produção e trilhas. Prefiro trabalho em estúdio e remoto.' },
    softSkills: { punctuality: 4, commitment: 4, openness: 5 },
    mediaSamples: [
      { id: 's5a', type: 'audio', uri: 'https://example.com/samples/camila-synth.mp3', title: 'Textura de synth', durationSec: 48 },
    ],
    connections: 203,
    bio: 'Produtora e tecladista. Faço trilhas, arranjos e colaborações remotas.',
    vibeColor: '#7C3AED',
    vibeColorName: 'Electric Purple',
    favAlbum: 'Currents',
    favAlbumCover: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png',
    socials: { instagram: 'camilafonseca.music', spotify: 'camila_fonseca' },
    matchScore: 79,
    matchReasons: ['Produção + instrumentação viva', 'Indie em comum', 'Disponível remotamente'],
    avatar: 'https://i.pravatar.cc/300?img=54',
    coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500',
  },
];

export interface JamRoom {
  id: string;
  name: string;
  cover: string;
  participants: { name: string; avatar: string }[];
  lastMessage: string;
  lastSender: string;
  time: string;
  unread?: number;
}

export interface DMConversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
}

/** Anexo de áudio de uma mensagem (referência musical). */
export interface MessageAudio {
  uri: string;
  title: string;
}

/** Mensagem de uma conversa (DM ou Jam). */
export interface ChatMessage {
  id: string;
  /** id do remetente ('me' para o usuário atual). */
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  /** Anexo de áudio opcional, tocável direto no balão. */
  audio?: MessageAudio;
  /** Timestamp ISO. */
  createdAt: string;
}

export const MOCK_JAMS: JamRoom[] = [
  {
    id: 'j1',
    name: 'Blond Proj.',
    cover: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Frank_Ocean_-_Blonde.jpeg',
    participants: [
      { name: 'Frank Ocean', avatar: 'https://i.pravatar.cc/100?img=11' },
      { name: 'Mariana Luz', avatar: 'https://i.pravatar.cc/100?img=47' },
    ],
    lastMessage: 'kd o frank oceano?',
    lastSender: 'CJ',
    time: '14:32',
    unread: 6,
  },
  {
    id: 'j2',
    name: 'Sessions SP',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200',
    participants: [
      { name: 'Bruno Carrasco', avatar: 'https://i.pravatar.cc/100?img=12' },
      { name: 'Lara Kim', avatar: 'https://i.pravatar.cc/100?img=32' },
    ],
    lastMessage: 'Ensaio sábado às 15h?',
    lastSender: 'Bruno',
    time: '11:00',
    unread: 2,
  },
  {
    id: 'j3',
    name: 'Jazz Collective',
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200',
    participants: [
      { name: 'Rafael Torres', avatar: 'https://i.pravatar.cc/100?img=65' },
    ],
    lastMessage: 'Adorei o arranjo do Rafael',
    lastSender: 'Camila',
    time: 'ontem',
    unread: 0,
  },
];

export const MOCK_DMS: DMConversation[] = [
  {
    id: 'd1',
    name: 'Bruno Carrasco',
    avatar: 'https://i.pravatar.cc/100?img=12',
    lastMessage: 'Posso levar minha pedaleira?',
    time: '12:48',
    unread: 1,
  },
  {
    id: 'd2',
    name: 'Camila Fonseca',
    avatar: 'https://i.pravatar.cc/100?img=54',
    lastMessage: 'Mandei o arquivo do Ableton',
    time: '10:15',
    unread: 0,
  },
  {
    id: 'd3',
    name: 'Rafael Torres',
    avatar: 'https://i.pravatar.cc/100?img=65',
    lastMessage: 'Fechado! 500 por show.',
    time: 'ontem',
    unread: 3,
  },
];

export const MY_PROFILE: Artist = {
  id: 'me',
  name: 'Frank Ocean',
  age: 34,
  role: 'Cantor Profissional',
  instruments: ['Voz', 'Violão'],
  level: 'Profissional',
  genres: ['R&B', 'Soul', 'Indie'],
  influences: ['Stevie Wonder', 'James Blake', 'Kanye West'],
  location: 'São Paulo, SP',
  coordinates: { lat: -23.561, lng: -46.656 },
  availability: ['Fins de semana', 'Noites'],
  schedule: { Sex: ['Noite'], Sáb: ['Tarde', 'Noite'], Dom: ['Manhã', 'Tarde'] },
  goals: ['Colaboração Pontual'],
  equipment: 'Equipamento portátil',
  bandExperience: { playedLive: true, recorded: true, yearsInBands: 9, notes: 'Shows intimistas e projetos autorais.' },
  softSkills: { punctuality: 4, commitment: 5, openness: 5 },
  mediaSamples: [
    { id: 'me1', type: 'audio', uri: 'https://example.com/samples/frank-demo.mp3', title: 'Demo autoral', durationSec: 55 },
  ],
  connections: 345,
  bio: 'Cantor e compositor. Estilo ao vivo intimista. Gosto de colaborações inusitadas.',
  vibeColor: '#1A2C8E',
  vibeColorName: 'Luxury Blue',
  favAlbum: 'Blonde',
  favAlbumCover: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Frank_Ocean_-_Blonde.jpeg',
  socials: { instagram: 'frankocean', youtube: 'frankocean', spotify: 'frank_ocean' },
  avatar: 'https://i.pravatar.cc/300?img=11',
  coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500',
};

export const MAP_MARKERS = [
  { id: 'm1', type: 'artist', name: 'Mariana Luz', lat: -23.5505, lng: -46.6333, intensity: 0.9 },
  { id: 'm2', type: 'artist', name: 'Bruno Carrasco', lat: -23.5489, lng: -46.6388, intensity: 0.7 },
  { id: 'm3', type: 'event', name: 'Jam no Beco 203', lat: -23.558, lng: -46.622, intensity: 1.0 },
  { id: 'm4', type: 'artist', name: 'Rafael Torres', lat: -23.563, lng: -46.654, intensity: 0.85 },
  { id: 'm5', type: 'vaga', name: 'Banda precisa de baterista', lat: -23.548, lng: -46.641, intensity: 0.6 },
  { id: 'm6', type: 'event', name: 'Open Mic - Sesc Vila Mariana', lat: -23.598, lng: -46.638, intensity: 0.95 },
  { id: 'm7', type: 'artist', name: 'Lara Kim', lat: -23.664, lng: -46.538, intensity: 0.5 },
  { id: 'm8', type: 'vaga', name: 'Guitarrista p/ gravação', lat: -23.541, lng: -46.647, intensity: 0.75 },
];

export const MOCK_OPENINGS: Opening[] = [
  {
    id: 'op1',
    authorId: '3',
    authorName: 'Lara Kim',
    authorAvatar: 'https://i.pravatar.cc/100?img=32',
    title: 'Banda indie procura vocalista',
    description:
      'Temos base instrumental (bateria, baixo, guitarra) e buscamos voz para shows autorais. Ensaios aos sábados no ABC.',
    instruments: ['Voz'],
    genres: ['Indie', 'Pop'],
    level: 'Intermediário',
    goal: 'Banda Fixa',
    location: 'Santo André, SP',
    coordinates: { lat: -23.6639, lng: -46.5383 },
    isOpen: true,
  },
  {
    id: 'op2',
    authorId: '4',
    authorName: 'Rafael Torres',
    authorAvatar: 'https://i.pravatar.cc/100?img=65',
    title: 'Guitarrista para gravação remunerada',
    description:
      'Sessão de gravação de um EP de funk/jazz. Cachê combinado. Precisa ler cifra e ter equipamento próprio.',
    instruments: ['Guitarra'],
    genres: ['Funk', 'Jazz'],
    level: 'Avançado',
    goal: 'Trabalho Remunerado',
    location: 'São Paulo, SP',
    coordinates: { lat: -23.563, lng: -46.654 },
    isOpen: true,
  },
  {
    id: 'op3',
    authorId: '2',
    authorName: 'Bruno Carrasco',
    authorAvatar: 'https://i.pravatar.cc/100?img=12',
    title: 'Tecladista para jam de blues',
    description: 'Jam casual de blues/rock nas noites de quarta. Sem compromisso, só diversão.',
    instruments: ['Teclado'],
    genres: ['Blues', 'Rock'],
    goal: 'Jam Session',
    location: 'São Paulo, SP',
    coordinates: { lat: -23.5489, lng: -46.6388 },
    isOpen: true,
  },
];

/**
 * Reputação demonstrativa por artista (preenchida nos mocks abaixo).
 * Em produção, vem das colunas rating_avg/rating_count da tabela profiles.
 */
const MOCK_RATINGS: Record<string, { ratingAvg: number; ratingCount: number }> = {
  '1': { ratingAvg: 4.8, ratingCount: 12 },
  '2': { ratingAvg: 4.3, ratingCount: 7 },
  '3': { ratingAvg: 4.0, ratingCount: 3 },
  '4': { ratingAvg: 4.9, ratingCount: 21 },
  '5': { ratingAvg: 4.5, ratingCount: 9 },
};

// Aplica a reputação demonstrativa aos mocks (não polui cada objeto acima).
MOCK_ARTISTS.forEach((a) => {
  const r = MOCK_RATINGS[a.id];
  if (r) {
    a.ratingAvg = r.ratingAvg;
    a.ratingCount = r.ratingCount;
  }
});

/** Avaliações demonstrativas exibidas no perfil de alguns artistas. */
export const MOCK_REVIEWS: Record<string, Review[]> = {
  '1': [
    {
      id: 'r1',
      reviewerId: '2',
      revieweeId: '1',
      reviewerName: 'Bruno Carrasco',
      reviewerAvatar: 'https://i.pravatar.cc/100?img=12',
      rating: 5,
      comment: 'Voz incrível e super pontual. Fechamos vários ensaios sem atraso.',
      context: 'Banda de soul',
      createdAt: '2026-09-10T20:00:00Z',
    },
    {
      id: 'r2',
      reviewerId: '4',
      revieweeId: '1',
      reviewerName: 'Rafael Torres',
      reviewerAvatar: 'https://i.pravatar.cc/100?img=65',
      rating: 5,
      comment: 'Profissionalismo de sobra. Recomendo para qualquer projeto autoral.',
      context: 'Gravação de single',
      createdAt: '2026-08-02T15:30:00Z',
    },
  ],
  '4': [
    {
      id: 'r3',
      reviewerId: '1',
      revieweeId: '4',
      reviewerName: 'Mariana Luz',
      reviewerAvatar: 'https://i.pravatar.cc/100?img=47',
      rating: 5,
      comment: 'Baixista impecável, leu tudo de primeira na sessão.',
      context: 'Sessão de gravação',
      createdAt: '2026-07-21T18:00:00Z',
    },
  ],
};

/** Mensagens iniciais por conversa (chave = id da DM ou Jam). */
export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  d1: [
    {
      id: 'm_d1_1',
      senderId: '2',
      senderName: 'Bruno Carrasco',
      senderAvatar: 'https://i.pravatar.cc/100?img=12',
      text: 'E aí! Vi seu perfil, curti demais o som.',
      createdAt: '2026-11-08T12:40:00Z',
    },
    {
      id: 'm_d1_2',
      senderId: 'me',
      senderName: 'Você',
      text: 'Valeu! Também curti suas gravações. Bora marcar uma jam?',
      createdAt: '2026-11-08T12:44:00Z',
    },
    {
      id: 'm_d1_3',
      senderId: '2',
      senderName: 'Bruno Carrasco',
      senderAvatar: 'https://i.pravatar.cc/100?img=12',
      text: 'Posso levar minha pedaleira?',
      createdAt: '2026-11-08T12:48:00Z',
    },
    {
      id: 'm_d1_4',
      senderId: '2',
      senderName: 'Bruno Carrasco',
      senderAvatar: 'https://i.pravatar.cc/100?img=12',
      text: 'Ouve essa referência de tom:',
      audio: { uri: 'https://example.com/samples/bruno-ref.mp3', title: 'Referência - tom da música' },
      createdAt: '2026-11-08T12:50:00Z',
    },
    {
      id: 'm_d1_5',
      senderId: 'me',
      senderName: 'Você',
      text: 'Curti! Lembrou essa: https://open.spotify.com/track/exemplo',
      createdAt: '2026-11-08T12:52:00Z',
    },
  ],
  d3: [
    {
      id: 'm_d3_1',
      senderId: '4',
      senderName: 'Rafael Torres',
      senderAvatar: 'https://i.pravatar.cc/100?img=65',
      text: 'Fechado! 500 por show.',
      createdAt: '2026-11-07T19:00:00Z',
    },
  ],
  j1: [
    {
      id: 'm_j1_1',
      senderId: '1',
      senderName: 'Mariana Luz',
      senderAvatar: 'https://i.pravatar.cc/100?img=47',
      text: 'Galera, subi a base nova no drive.',
      createdAt: '2026-11-08T14:20:00Z',
    },
    {
      id: 'm_j1_2',
      senderId: 'cj',
      senderName: 'CJ',
      text: 'kd o frank oceano?',
      createdAt: '2026-11-08T14:32:00Z',
    },
  ],
};

import type {
  CollabGoal,
  EquipmentLevel,
  Instrument,
  SkillLevel,
  TimeSlot,
  Weekday,
} from '../data/mockData';

/** Instrumentos selecionáveis no onboarding. */
export const INSTRUMENTS: Instrument[] = [
  'Guitarra',
  'Baixo',
  'Bateria',
  'Teclado',
  'Voz',
  'Violão',
  'Saxofone',
  'Trompete',
  'Violino',
  'Produção',
];

/** Níveis técnicos autodeclarados, do iniciante ao profissional. */
export const SKILL_LEVELS: SkillLevel[] = [
  'Iniciante',
  'Intermediário',
  'Avançado',
  'Profissional',
];

/** Sugestões de gênero para o onboarding (lista aberta, o usuário pode ter outros). */
export const GENRE_SUGGESTIONS: string[] = [
  'Rock',
  'Pop',
  'MPB',
  'Samba',
  'Pagode',
  'Sertanejo',
  'Funk',
  'Jazz',
  'Blues',
  'Soul',
  'R&B',
  'Indie',
  'Eletrônico',
  'Synth-pop',
  'Hip-Hop',
  'Reggae',
  'Metal',
  'Gospel',
  'Bossa Nova',
  'Forró',
];

/** Objetivos de colaboração, com descrição para exibir no wizard. */
export const COLLAB_GOALS: { value: CollabGoal; description: string; icon: string }[] = [
  {
    value: 'Banda Fixa',
    description: 'Projeto de longo prazo, ensaios regulares e shows.',
    icon: '🎸',
  },
  {
    value: 'Colaboração Pontual',
    description: 'Uma música, um cover ou um projeto específico.',
    icon: '🎵',
  },
  {
    value: 'Jam Session',
    description: 'Tocar junto de forma casual, sem compromisso.',
    icon: '🎷',
  },
  {
    value: 'Trabalho Remunerado',
    description: 'Sessões de gravação e shows pagos.',
    icon: '💰',
  },
  {
    value: 'Substituição Temporária',
    description: 'Cobrir um músico em um show ou período.',
    icon: '🔁',
  },
];

/** Níveis de equipamento disponíveis. */
export const EQUIPMENT_LEVELS: { value: EquipmentLevel; icon: string }[] = [
  { value: 'Estúdio próprio', icon: '🎚️' },
  { value: 'Equipamento portátil', icon: '🎒' },
  { value: 'Apenas instrumento', icon: '🎻' },
  { value: 'Sem equipamento', icon: '🚫' },
];

/** Dias da semana, na ordem de exibição da grade de disponibilidade. */
export const WEEKDAYS: Weekday[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/** Turnos exibidos na grade de disponibilidade. */
export const TIME_SLOTS: TimeSlot[] = ['Manhã', 'Tarde', 'Noite'];

/** Cores de "vibe" sugeridas, com nome amigável. */
export const VIBE_COLORS: { color: string; name: string }[] = [
  { color: '#1A2C8E', name: 'Luxury Blue' },
  { color: '#8B5CF6', name: 'Deep Violet' },
  { color: '#DC2626', name: 'Crimson' },
  { color: '#059669', name: 'Emerald' },
  { color: '#D97706', name: 'Amber' },
  { color: '#7C3AED', name: 'Electric Purple' },
  { color: '#0891B2', name: 'Cyan Deep' },
  { color: '#DB2777', name: 'Hot Pink' },
];

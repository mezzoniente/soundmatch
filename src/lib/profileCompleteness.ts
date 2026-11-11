import type { Artist } from '../data/mockData';

/** Um item da checklist de completude do perfil. */
export interface CompletenessItem {
  key: string;
  label: string;
  /** Peso do item no score (os pesos somam 100). */
  weight: number;
  done: boolean;
  /** Para onde a UI deve levar o usuário para completar este item. */
  editSection?: string;
}

export interface CompletenessResult {
  /** Score de completude 0–100. */
  score: number;
  items: CompletenessItem[];
  /** Itens ainda pendentes (ordenados por peso, do mais importante ao menos). */
  missing: CompletenessItem[];
  /** Se o perfil atingiu o mínimo para aparecer no feed dos outros. */
  meetsMinimum: boolean;
}

/**
 * Score mínimo de completude para um perfil entrar no feed de recomendações
 * dos outros usuários (resolução do cold start: evita perfis vazios no feed).
 */
export const MINIMUM_COMPLETENESS = 60;

/** Avalia a completude de um perfil e o que falta preencher. */
export function evaluateCompleteness(p: Artist): CompletenessResult {
  const checks: Omit<CompletenessItem, 'done'>[] = [
    { key: 'name', label: 'Nome artístico', weight: 10, editSection: 'identity' },
    { key: 'role', label: 'Como você se descreve', weight: 10, editSection: 'identity' },
    { key: 'instruments', label: 'Instrumentos', weight: 20, editSection: 'instruments' },
    { key: 'genres', label: 'Gêneros', weight: 15, editSection: 'style' },
    { key: 'goals', label: 'Objetivo de colaboração', weight: 15, editSection: 'goals' },
    { key: 'schedule', label: 'Disponibilidade', weight: 10, editSection: 'availability' },
    { key: 'bio', label: 'Bio', weight: 5, editSection: 'vibe' },
    { key: 'photos', label: 'Foto de perfil', weight: 10, editSection: 'photos' },
    { key: 'samples', label: 'Amostra de áudio ou vídeo', weight: 5, editSection: undefined },
  ];

  const isDone: Record<string, boolean> = {
    name: p.name.trim().length > 0,
    role: p.role.trim().length > 0,
    instruments: p.instruments.length > 0,
    genres: p.genres.length > 0,
    goals: p.goals.length > 0,
    schedule: Object.keys(p.schedule ?? {}).length > 0,
    bio: p.bio.trim().length > 0,
    photos: Boolean(p.avatarUrl),
    samples: (p.mediaSamples ?? []).length > 0,
  };

  const items: CompletenessItem[] = checks.map((c) => ({ ...c, done: isDone[c.key] ?? false }));
  const score = items.reduce((sum, i) => (i.done ? sum + i.weight : sum), 0);
  const missing = items
    .filter((i) => !i.done)
    .sort((a, b) => b.weight - a.weight);

  return {
    score,
    items,
    missing,
    meetsMinimum: score >= MINIMUM_COMPLETENESS,
  };
}

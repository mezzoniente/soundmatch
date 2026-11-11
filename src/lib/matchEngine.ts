import type {
  Artist,
  AvailabilitySchedule,
  CollabGoal,
  Instrument,
  Opening,
  SkillLevel,
  TimeSlot,
  Weekday,
} from '../data/mockData';

/** Chave de cada critério avaliado pelo motor de recomendação. */
export type CriterionKey =
  | 'instrument'
  | 'proximity'
  | 'genres'
  | 'level'
  | 'availability'
  | 'goals';

/** Resultado de um único critério. */
export interface CriterionScore {
  key: CriterionKey;
  label: string;
  /** Pontuação normalizada 0–1. */
  score: number;
  /** Peso do critério no score final. */
  weight: number;
  /** Explicação curta e legível do resultado. */
  reason: string;
}

/** Resultado completo do match entre dois perfis. */
export interface MatchResult {
  /** Score final 0–100. */
  score: number;
  /** Detalhamento por critério, ordenado por contribuição. */
  breakdown: CriterionScore[];
  /** Principais razões (os critérios mais fortes), prontas para o cartão. */
  topReasons: string[];
}

/** Pesos padrão de cada critério (somam 1). */
export const DEFAULT_WEIGHTS: Record<CriterionKey, number> = {
  instrument: 0.25,
  proximity: 0.2,
  genres: 0.2,
  level: 0.15,
  availability: 0.1,
  goals: 0.1,
};

const LEVEL_RANK: Record<SkillLevel, number> = {
  Iniciante: 0,
  Intermediário: 1,
  Avançado: 2,
  Profissional: 3,
};

/** Raio padrão (km) além do qual a proximidade zera. Ajustável pela UI depois. */
export const DEFAULT_RADIUS_KM = 50;

// ---------- Helpers ----------

/** Distância Haversine em km entre duas coordenadas. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Tamanho da interseção entre duas listas (case-insensitive para strings). */
function overlapCount<T extends string>(a: T[], b: T[]): number {
  const set = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => set.has(x.toLowerCase())).length;
}

/** Conta os turnos em comum entre duas grades de disponibilidade. */
function scheduleOverlap(a?: AvailabilitySchedule, b?: AvailabilitySchedule): number {
  if (!a || !b) return 0;
  let count = 0;
  (Object.keys(a) as Weekday[]).forEach((day) => {
    const slotsA = a[day] ?? [];
    const slotsB = b[day] ?? [];
    const setB = new Set<TimeSlot>(slotsB);
    slotsA.forEach((slot) => {
      if (setB.has(slot)) count += 1;
    });
  });
  return count;
}

// ---------- Critérios ----------

/**
 * Complementaridade de instrumento: valoriza quem toca instrumentos que o
 * usuário NÃO toca (uma banda precisa de variedade, não de clones).
 * Instrumentos idênticos reduzem a pontuação.
 */
function scoreInstrument(me: Artist, other: Artist): CriterionScore {
  const mine = new Set<Instrument>(me.instruments);
  const complementary = other.instruments.filter((i) => !mine.has(i));
  const overlapping = other.instruments.filter((i) => mine.has(i));

  let score: number;
  let reason: string;

  if (complementary.length > 0) {
    // Pelo menos um instrumento novo para a formação.
    score = Math.min(1, 0.6 + 0.4 * (complementary.length / other.instruments.length));
    reason = `Complementa com ${complementary.join(', ')}`;
  } else if (overlapping.length > 0) {
    // Só toca o que você já toca — pouca complementaridade.
    score = 0.2;
    reason = `Mesmo instrumento (${overlapping.join(', ')})`;
  } else {
    score = 0.5;
    reason = 'Instrumentos a definir';
  }

  return { key: 'instrument', label: 'Instrumento', score, weight: DEFAULT_WEIGHTS.instrument, reason };
}

/** Proximidade geográfica: 1 quando colado, decai linearmente até o raio. */
function scoreProximity(me: Artist, other: Artist, radiusKm: number): CriterionScore {
  const dist = distanceKm(me.coordinates, other.coordinates);
  const score = Math.max(0, 1 - dist / radiusKm);
  const reason =
    dist < 1
      ? 'Praticamente na mesma região'
      : dist <= radiusKm
        ? `A ~${Math.round(dist)} km de você`
        : `Longe (${Math.round(dist)} km)`;
  return { key: 'proximity', label: 'Proximidade', score, weight: DEFAULT_WEIGHTS.proximity, reason };
}

/** Afinidade de estilo: gêneros + influências em comum. */
function scoreGenres(me: Artist, other: Artist): CriterionScore {
  const genreHits = overlapCount(me.genres, other.genres);
  const influenceHits = overlapCount(me.influences, other.influences);
  const denom = Math.max(1, Math.min(me.genres.length, other.genres.length));
  const genreScore = Math.min(1, genreHits / denom);
  // Influências dão um bônus menor.
  const score = Math.min(1, genreScore + influenceHits * 0.1);

  const shared = me.genres.filter((g) =>
    other.genres.map((x) => x.toLowerCase()).includes(g.toLowerCase())
  );
  const reason =
    shared.length > 0
      ? `Gêneros em comum: ${shared.join(', ')}`
      : influenceHits > 0
        ? 'Influências parecidas'
        : 'Estilos diferentes';
  return { key: 'genres', label: 'Estilo', score, weight: DEFAULT_WEIGHTS.genres, reason };
}

/**
 * Compatibilidade de nível: perto é melhor, mas sem ser restritivo.
 * Diferença de 0 = 1.0, cada degrau tira 0.25.
 */
function scoreLevel(me: Artist, other: Artist): CriterionScore {
  const diff = Math.abs(LEVEL_RANK[me.level] - LEVEL_RANK[other.level]);
  const score = Math.max(0, 1 - diff * 0.25);
  const reason =
    diff === 0
      ? `Mesmo nível (${other.level})`
      : diff === 1
        ? `Nível próximo (${other.level})`
        : `Níveis distantes (${other.level})`;
  return { key: 'level', label: 'Nível', score, weight: DEFAULT_WEIGHTS.level, reason };
}

/** Overlap de disponibilidade semanal. */
function scoreAvailability(me: Artist, other: Artist): CriterionScore {
  const overlap = scheduleOverlap(me.schedule, other.schedule);
  // 3+ turnos em comum já é considerado ótimo.
  const score = Math.min(1, overlap / 3);
  const reason =
    overlap === 0
      ? 'Sem horários em comum'
      : `${overlap} turno(s) de agenda em comum`;
  return {
    key: 'availability',
    label: 'Disponibilidade',
    score,
    weight: DEFAULT_WEIGHTS.availability,
    reason,
  };
}

/** Objetivos de colaboração em comum. */
function scoreGoals(me: Artist, other: Artist): CriterionScore {
  const shared = me.goals.filter((g: CollabGoal) => other.goals.includes(g));
  const score = shared.length > 0 ? 1 : 0.3;
  const reason =
    shared.length > 0 ? `Mesmo objetivo: ${shared.join(', ')}` : 'Objetivos diferentes';
  return { key: 'goals', label: 'Objetivo', score, weight: DEFAULT_WEIGHTS.goals, reason };
}

// ---------- Motor ----------

export interface MatchOptions {
  /** Raio de proximidade em km. Default: DEFAULT_RADIUS_KM. */
  radiusKm?: number;
  /** Pesos customizados por critério. */
  weights?: Partial<Record<CriterionKey, number>>;
  /** Aplica boost a perfis novos (cold start). Default: true. */
  boostNewProfiles?: boolean;
}

/** Janela (dias) em que um perfil novo recebe boost, e o bônus máximo de score. */
export const NEW_PROFILE_BOOST_DAYS = 14;
const NEW_PROFILE_MAX_BONUS = 12;

/**
 * Bônus de score para perfis recém-criados, decaindo linearmente ao longo de
 * NEW_PROFILE_BOOST_DAYS. Resolve parte do cold start: perfis novos aparecem
 * mais no topo nas primeiras duas semanas.
 */
export function newProfileBonus(createdAt?: string): number {
  if (!createdAt) return 0;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  if (ageDays < 0 || ageDays > NEW_PROFILE_BOOST_DAYS) return 0;
  return Math.round(NEW_PROFILE_MAX_BONUS * (1 - ageDays / NEW_PROFILE_BOOST_DAYS));
}

/**
 * Calcula a compatibilidade entre o usuário (`me`) e um candidato (`other`).
 * Função pura e determinística: mesma entrada, mesma saída.
 */
export function computeMatch(me: Artist, other: Artist, options: MatchOptions = {}): MatchResult {
  const radiusKm = options.radiusKm ?? DEFAULT_RADIUS_KM;
  const weights = { ...DEFAULT_WEIGHTS, ...options.weights };

  const criteria: CriterionScore[] = [
    scoreInstrument(me, other),
    scoreProximity(me, other, radiusKm),
    scoreGenres(me, other),
    scoreLevel(me, other),
    scoreAvailability(me, other),
    scoreGoals(me, other),
  ].map((c) => ({ ...c, weight: weights[c.key] }));

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0) || 1;
  const weighted = criteria.reduce((sum, c) => sum + c.score * c.weight, 0);
  const score = Math.round((weighted / totalWeight) * 100);

  // Ordena por contribuição (score × peso) para destacar o que mais pesou.
  const breakdown = [...criteria].sort(
    (a, b) => b.score * b.weight - a.score * a.weight
  );

  // Razões principais: critérios com bom desempenho, até 3.
  const topReasons = breakdown
    .filter((c) => c.score >= 0.5)
    .slice(0, 3)
    .map((c) => c.reason);

  return { score, breakdown, topReasons };
}

/**
 * Ordena uma lista de candidatos pela compatibilidade com o usuário,
 * anexando `matchScore` e `matchReasons` a cada um (do mais ao menos compatível).
 */
export function rankCandidates(
  me: Artist,
  candidates: Artist[],
  options: MatchOptions = {}
): Artist[] {
  const boostEnabled = options.boostNewProfiles ?? true;
  return candidates
    .map((candidate) => {
      const result = computeMatch(me, candidate, options);
      const bonus = boostEnabled ? newProfileBonus(candidate.createdAt) : 0;
      // O boost afeta a ordenação, mas o score exibido fica limitado a 100.
      const displayScore = Math.min(100, result.score + bonus);
      return {
        artist: { ...candidate, matchScore: displayScore, matchReasons: result.topReasons },
        rankScore: result.score + bonus,
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore)
    .map((entry) => entry.artist);
}

// ---------- Filtros de busca ----------

/**
 * Filtros aplicados ao feed antes do ranking.
 * Campos vazios/indefinidos são ignorados (não filtram nada).
 */
export interface MatchFilters {
  instruments: Instrument[];
  levels: SkillLevel[];
  genres: string[];
  goals: CollabGoal[];
  /** Raio máximo de distância em km (a partir do usuário). */
  radiusKm: number;
}

/** Filtros neutros (nenhum filtro ativo). */
export const EMPTY_FILTERS: MatchFilters = {
  instruments: [],
  levels: [],
  genres: [],
  goals: [],
  radiusKm: DEFAULT_RADIUS_KM,
};

/** Indica se há algum filtro ativo além do raio padrão. */
export function hasActiveFilters(f: MatchFilters): boolean {
  return (
    f.instruments.length > 0 ||
    f.levels.length > 0 ||
    f.genres.length > 0 ||
    f.goals.length > 0 ||
    f.radiusKm !== DEFAULT_RADIUS_KM
  );
}

/** Conta quantos grupos de filtro estão ativos (para badge na UI). */
export function activeFilterCount(f: MatchFilters): number {
  let n = 0;
  if (f.instruments.length > 0) n += 1;
  if (f.levels.length > 0) n += 1;
  if (f.genres.length > 0) n += 1;
  if (f.goals.length > 0) n += 1;
  if (f.radiusKm !== DEFAULT_RADIUS_KM) n += 1;
  return n;
}

function hasAny<T extends string>(selected: T[], values: T[]): boolean {
  if (selected.length === 0) return true;
  const set = new Set(values.map((v) => v.toLowerCase()));
  return selected.some((s) => set.has(s.toLowerCase()));
}

/**
 * Aplica os filtros a uma lista de candidatos em relação ao usuário.
 * Um candidato passa se atende a TODOS os grupos de filtro ativos
 * (e, dentro de um grupo, basta casar com ALGUM valor selecionado).
 */
export function applyFilters(me: Artist, candidates: Artist[], f: MatchFilters): Artist[] {
  return candidates.filter((c) => {
    if (!hasAny(f.instruments, c.instruments)) return false;
    if (f.levels.length > 0 && !f.levels.includes(c.level)) return false;
    if (!hasAny(f.genres, c.genres)) return false;
    if (!hasAny(f.goals, c.goals)) return false;
    if (distanceKm(me.coordinates, c.coordinates) > f.radiusKm) return false;
    return true;
  });
}

// ---------- Relevância de vagas ----------

/**
 * Relevância de uma vaga para o usuário. Diferente do match pessoa-pessoa:
 * aqui o foco é "eu sirvo para essa vaga?" — toco o instrumento procurado,
 * compartilho o gênero, o objetivo bate, estou perto e meu nível serve.
 */
export function computeOpeningMatch(me: Artist, opening: Opening): MatchResult {
  // Instrumento: o usuário toca o que a vaga procura?
  const iPlay = new Set(me.instruments.map((i) => i.toLowerCase()));
  const wanted = opening.instruments.map((i) => i.toLowerCase());
  const plays = wanted.some((w) => iPlay.has(w));
  const instrument: CriterionScore = {
    key: 'instrument',
    label: 'Instrumento',
    score: wanted.length === 0 ? 0.5 : plays ? 1 : 0,
    weight: 0.35,
    reason: plays
      ? `Você toca ${opening.instruments.join(', ')}`
      : `Procuram ${opening.instruments.join(', ')}`,
  };

  // Estilo
  const genreHits = overlapCount(me.genres, opening.genres);
  const genres: CriterionScore = {
    key: 'genres',
    label: 'Estilo',
    score: opening.genres.length === 0 ? 0.5 : Math.min(1, genreHits / 1),
    weight: 0.2,
    reason: genreHits > 0 ? `Gêneros em comum (${genreHits})` : 'Estilos diferentes',
  };

  // Objetivo
  const goalShared = me.goals.includes(opening.goal);
  const goals: CriterionScore = {
    key: 'goals',
    label: 'Objetivo',
    score: goalShared ? 1 : 0.3,
    weight: 0.2,
    reason: goalShared ? `Mesmo objetivo: ${opening.goal}` : `Objetivo: ${opening.goal}`,
  };

  // Nível
  const levelScore =
    !opening.level || opening.level === me.level
      ? 1
      : Math.max(0, 1 - Math.abs(LEVEL_RANK[me.level] - LEVEL_RANK[opening.level]) * 0.25);
  const level: CriterionScore = {
    key: 'level',
    label: 'Nível',
    score: levelScore,
    weight: 0.1,
    reason: !opening.level
      ? 'Nível flexível'
      : opening.level === me.level
        ? `Nível certo (${opening.level})`
        : `Pedem ${opening.level}`,
  };

  // Proximidade
  let proximityScore = 0.5;
  let proximityReason = 'Localização a confirmar';
  if (opening.coordinates) {
    const dist = distanceKm(me.coordinates, opening.coordinates);
    proximityScore = Math.max(0, 1 - dist / DEFAULT_RADIUS_KM);
    proximityReason = dist < 1 ? 'Na sua região' : `A ~${Math.round(dist)} km`;
  }
  const proximity: CriterionScore = {
    key: 'proximity',
    label: 'Proximidade',
    score: proximityScore,
    weight: 0.15,
    reason: proximityReason,
  };

  const criteria = [instrument, genres, goals, level, proximity];
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0) || 1;
  const weighted = criteria.reduce((s, c) => s + c.score * c.weight, 0);
  const score = Math.round((weighted / totalWeight) * 100);
  const breakdown = [...criteria].sort((a, b) => b.score * b.weight - a.score * a.weight);
  const topReasons = breakdown
    .filter((c) => c.score >= 0.5)
    .slice(0, 3)
    .map((c) => c.reason);

  return { score, breakdown, topReasons };
}

/** Ordena vagas pela relevância ao usuário. */
export function rankOpenings(me: Artist, openings: Opening[]): Opening[] {
  return openings
    .map((o) => {
      const result = computeOpeningMatch(me, o);
      return { opening: { ...o, matchScore: result.score, matchReasons: result.topReasons }, score: result.score };
    })
    .sort((a, b) => b.score - a.score)
    .map((e) => e.opening);
}

import { supabase } from './supabase';
import type { CollabGoal, Instrument, Opening, SkillLevel } from '../data/mockData';

interface OpeningRow {
  id: string;
  author_id: string;
  title: string;
  description: string;
  instruments: string[];
  genres: string[];
  level: string | null;
  goal: string;
  location: string;
  lat: number | null;
  lng: number | null;
  is_open: boolean;
  created_at: string;
}

function rowToOpening(row: OpeningRow): Opening {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    description: row.description,
    instruments: row.instruments as Instrument[],
    genres: row.genres,
    level: (row.level as SkillLevel) ?? undefined,
    goal: row.goal as CollabGoal,
    location: row.location,
    coordinates: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : undefined,
    isOpen: row.is_open,
    createdAt: row.created_at,
  };
}

/** Lista as vagas abertas, mais recentes primeiro. */
export async function fetchOpenings(): Promise<Opening[]> {
  const { data, error } = await supabase
    .from('openings')
    .select('*')
    .eq('is_open', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[openingsRepository] fetch falhou:', error.message);
    return [];
  }
  return (data as OpeningRow[]).map(rowToOpening);
}

export interface NewOpening {
  title: string;
  description: string;
  instruments: Instrument[];
  genres: string[];
  level?: SkillLevel;
  goal: CollabGoal;
  location: string;
  coordinates?: { lat: number; lng: number };
}

/** Cria uma nova vaga em nome do usuário autenticado. */
export async function createOpening(
  authorId: string,
  opening: NewOpening
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('openings').insert({
    author_id: authorId,
    title: opening.title,
    description: opening.description,
    instruments: opening.instruments,
    genres: opening.genres,
    level: opening.level ?? null,
    goal: opening.goal,
    location: opening.location,
    lat: opening.coordinates?.lat ?? null,
    lng: opening.coordinates?.lng ?? null,
  });
  if (error) {
    console.warn('[openingsRepository] create falhou:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

/** Remove uma vaga do usuário. */
export async function deleteOpening(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('openings').delete().eq('id', id);
  return { error: error ? error.message : null };
}

import { supabase } from './supabase';
import type {
  Artist,
  AvailabilitySchedule,
  BandExperience,
  CollabGoal,
  EquipmentLevel,
  Instrument,
  MediaSample,
  SkillLevel,
  SoftSkills,
} from '../data/mockData';
import { MY_PROFILE } from '../data/mockData';

/** Formato da linha na tabela `public.profiles` (snake_case do Postgres). */
interface ProfileRow {
  id: string;
  name: string;
  age: number | null;
  role: string;
  location: string;
  bio: string;
  instruments: string[];
  level: string;
  genres: string[];
  influences: string[];
  goals: string[];
  schedule: AvailabilitySchedule;
  equipment: string | null;
  band_experience: BandExperience | null;
  soft_skills: SoftSkills | null;
  media_samples: MediaSample[];
  vibe_color: string;
  vibe_color_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  is_onboarded: boolean;
}

/**
 * Converte uma linha do banco para o `Artist` usado no app.
 * Campos visuais que ainda não vivem no banco (avatar, cover, socials, connections)
 * usam os valores padrão do mock por enquanto — serão tratados em etapas futuras.
 */
function rowToArtist(row: ProfileRow): Artist {
  return {
    id: row.id,
    name: row.name,
    age: row.age ?? 0,
    role: row.role,
    instruments: row.instruments as Instrument[],
    level: (row.level as SkillLevel) || 'Iniciante',
    genres: row.genres,
    influences: row.influences,
    location: row.location,
    coordinates: MY_PROFILE.coordinates,
    availability: [],
    schedule: row.schedule ?? {},
    goals: row.goals as CollabGoal[],
    equipment: (row.equipment as EquipmentLevel) ?? undefined,
    bandExperience: row.band_experience ?? undefined,
    softSkills: row.soft_skills ?? undefined,
    mediaSamples: row.media_samples ?? [],
    connections: 0,
    bio: row.bio,
    vibeColor: row.vibe_color,
    vibeColorName: row.vibe_color_name,
    favAlbum: MY_PROFILE.favAlbum,
    favAlbumCover: MY_PROFILE.favAlbumCover,
    socials: {},
    // Usa a mídia salva no storage; cai no mock só se o usuário ainda não enviou.
    avatar: row.avatar_url || MY_PROFILE.avatar,
    coverImage: row.cover_url || MY_PROFILE.coverImage,
    avatarUrl: row.avatar_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
  };
}

/** Converte o `Artist` do app para o formato de escrita da tabela. */
function artistToRow(userId: string, artist: Artist, isOnboarded: boolean): Partial<ProfileRow> {
  return {
    id: userId,
    name: artist.name,
    age: artist.age || null,
    role: artist.role,
    location: artist.location,
    bio: artist.bio,
    instruments: artist.instruments,
    level: artist.level,
    genres: artist.genres,
    influences: artist.influences,
    goals: artist.goals,
    schedule: artist.schedule ?? {},
    equipment: artist.equipment ?? null,
    band_experience: artist.bandExperience ?? null,
    soft_skills: artist.softSkills ?? null,
    media_samples: artist.mediaSamples ?? [],
    vibe_color: artist.vibeColor,
    vibe_color_name: artist.vibeColorName,
    avatar_url: artist.avatarUrl ?? null,
    cover_url: artist.coverUrl ?? null,
    is_onboarded: isOnboarded,
  };
}

export interface FetchedProfile {
  artist: Artist;
  isOnboarded: boolean;
}

/**
 * Busca o perfil do usuário autenticado.
 * Retorna `null` se a linha ainda não existir (ex.: trigger não rodou).
 */
export async function fetchProfile(userId: string): Promise<FetchedProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[profileRepository] fetch falhou:', error.message);
    return null;
  }
  if (!data) return null;

  const row = data as ProfileRow;
  return { artist: rowToArtist(row), isOnboarded: row.is_onboarded };
}

/** Grava (upsert) o perfil do usuário autenticado no banco. */
export async function upsertProfile(
  userId: string,
  artist: Artist,
  isOnboarded: boolean
): Promise<{ error: string | null }> {
  const row = artistToRow(userId, artist, isOnboarded);
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) {
    console.warn('[profileRepository] upsert falhou:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

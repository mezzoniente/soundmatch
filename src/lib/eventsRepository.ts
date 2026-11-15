import { supabase } from './supabase';
import type { Instrument, MusicEvent } from '../data/mockData';

interface EventRow {
  id: string;
  author_id: string;
  title: string;
  description: string;
  event_type: string;
  instruments: string[];
  genres: string[];
  event_date: string | null;
  budget: string;
  location: string;
  lat: number | null;
  lng: number | null;
  is_open: boolean;
  created_at: string;
}

function rowToEvent(row: EventRow): MusicEvent {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    description: row.description,
    eventType: row.event_type,
    instruments: row.instruments as Instrument[],
    genres: row.genres,
    eventDate: row.event_date ?? undefined,
    budget: row.budget,
    location: row.location,
    coordinates: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : undefined,
    isOpen: row.is_open,
    createdAt: row.created_at,
  };
}

/** Lista os eventos abertos, por data mais próxima primeiro. */
export async function fetchEvents(): Promise<MusicEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_open', true)
    .order('event_date', { ascending: true });

  if (error) {
    console.warn('[eventsRepository] fetch falhou:', error.message);
    return [];
  }
  return (data as EventRow[]).map(rowToEvent);
}

export interface NewEvent {
  title: string;
  description: string;
  eventType: string;
  instruments: Instrument[];
  genres: string[];
  eventDate?: string;
  budget: string;
  location: string;
  coordinates?: { lat: number; lng: number };
}

/** Cria um novo evento em nome do usuário autenticado. */
export async function createEvent(
  authorId: string,
  event: NewEvent
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('events').insert({
    author_id: authorId,
    title: event.title,
    description: event.description,
    event_type: event.eventType,
    instruments: event.instruments,
    genres: event.genres,
    event_date: event.eventDate ?? null,
    budget: event.budget,
    location: event.location,
    lat: event.coordinates?.lat ?? null,
    lng: event.coordinates?.lng ?? null,
  });
  return { error: error ? error.message : null };
}

/** Remove um evento do usuário. */
export async function deleteEvent(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  return { error: error ? error.message : null };
}

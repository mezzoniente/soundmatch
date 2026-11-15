import { supabase } from './supabase';
import type { Review } from '../data/mockData';

interface ReviewRow {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  context: string;
  created_at: string;
}

/**
 * Lista as avaliações recebidas por um usuário, mais recentes primeiro.
 * Resolve o nome/foto de cada autor numa segunda consulta a `profiles`
 * (evita depender do nome exato da FK para um join embutido).
 */
export async function fetchReviews(revieweeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', revieweeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[reviewsRepository] fetch falhou:', error.message);
    return [];
  }

  const rows = data as ReviewRow[];
  if (rows.length === 0) return [];

  // Busca os perfis dos autores de uma vez.
  const reviewerIds = Array.from(new Set(rows.map((r) => r.reviewer_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', reviewerIds);

  const byId = new Map(
    (profiles ?? []).map((p: { id: string; name: string | null; avatar_url: string | null }) => [
      p.id,
      p,
    ])
  );

  return rows.map((row) => {
    const author = byId.get(row.reviewer_id);
    return {
      id: row.id,
      reviewerId: row.reviewer_id,
      revieweeId: row.reviewee_id,
      reviewerName: author?.name ?? undefined,
      reviewerAvatar: author?.avatar_url ?? undefined,
      rating: row.rating,
      comment: row.comment,
      context: row.context,
      createdAt: row.created_at,
    };
  });
}

export interface NewReview {
  revieweeId: string;
  rating: number;
  comment: string;
  context: string;
}

/**
 * Cria ou atualiza a avaliação do usuário autenticado sobre outro.
 * Usa upsert pelo par (reviewer, reviewee) — uma avaliação por par.
 */
export async function submitReview(
  reviewerId: string,
  review: NewReview
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reviews').upsert(
    {
      reviewer_id: reviewerId,
      reviewee_id: review.revieweeId,
      rating: review.rating,
      comment: review.comment,
      context: review.context,
    },
    { onConflict: 'reviewer_id,reviewee_id' }
  );
  if (error) {
    console.warn('[reviewsRepository] submit falhou:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

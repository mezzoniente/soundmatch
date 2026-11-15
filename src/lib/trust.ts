import type { Artist, Review } from '../data/mockData';

/**
 * Um perfil é "verificado" quando subiu pelo menos uma amostra de áudio/vídeo,
 * provando que realmente toca (reduz perfis falsos / só autodeclarados).
 */
export function isVerified(p: Artist): boolean {
  return (p.mediaSamples ?? []).length > 0;
}

/** Um item do histórico de colaborações, derivado de uma avaliação recebida. */
export interface Collaboration {
  id: string;
  /** Com quem foi a colaboração (o autor da avaliação). */
  partnerName: string;
  partnerAvatar?: string;
  /** Contexto da colaboração, quando informado. */
  context: string;
  /** Nota que a pessoa deu. */
  rating: number;
  date?: string;
}

/**
 * Deriva o histórico de colaborações a partir das avaliações recebidas.
 * Cada avaliação recebida representa uma colaboração que de fato aconteceu.
 */
export function collaborationsFromReviews(reviews: Review[]): Collaboration[] {
  return reviews
    .filter((r) => r.context.trim().length > 0 || r.comment.trim().length > 0)
    .map((r) => ({
      id: r.id,
      partnerName: r.reviewerName ?? 'Músico',
      partnerAvatar: r.reviewerAvatar,
      context: r.context.trim() || 'Colaboração',
      rating: r.rating,
      date: r.createdAt,
    }));
}

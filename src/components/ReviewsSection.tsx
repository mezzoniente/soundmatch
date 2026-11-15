import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import type { Review } from '../data/mockData';

/** Renderiza estrelas preenchidas/vazias para uma nota de 0 a 5. */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: i <= full ? Colors.gold : Colors.textMuted }}>
          ★
        </Text>
      ))}
    </View>
  );
}

interface ReviewsSectionProps {
  ratingAvg: number;
  ratingCount: number;
  reviews: Review[];
  /** Quando fornecido, mostra o botão "Avaliar". */
  onAddReview?: () => void;
}

/** Seção de reputação: média, contagem, botão de avaliar e lista de comentários. */
export function ReviewsSection({ ratingAvg, ratingCount, reviews, onAddReview }: ReviewsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>AVALIAÇÕES</Text>
        {onAddReview ? (
          <TouchableOpacity style={styles.addBtn} onPress={onAddReview}>
            <Text style={styles.addText}>★ Avaliar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Resumo */}
      <View style={styles.summary}>
        <Text style={styles.avg}>{ratingCount > 0 ? ratingAvg.toFixed(1) : '—'}</Text>
        <View>
          <Stars rating={ratingAvg} size={18} />
          <Text style={styles.count}>
            {ratingCount > 0 ? `${ratingCount} avaliação(ões)` : 'Ainda sem avaliações'}
          </Text>
        </View>
      </View>

      {/* Lista */}
      {reviews.length > 0 && (
        <View style={styles.list}>
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                {r.reviewerAvatar ? (
                  <Image source={{ uri: r.reviewerAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>{(r.reviewerName ?? '?')[0]}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>{r.reviewerName ?? 'Músico'}</Text>
                  {r.context ? <Text style={styles.context}>{r.context}</Text> : null}
                </View>
                <Stars rating={r.rating} size={13} />
              </View>
              {r.comment ? <Text style={styles.comment}>{r.comment}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingTop: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  addBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addText: { color: Colors.bg, fontSize: 12, fontWeight: '700' },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avg: { fontSize: 36, fontWeight: '900', color: Colors.textPrimary },
  starsRow: { flexDirection: 'row', gap: 2 },
  count: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },

  list: { gap: 10, marginTop: 12 },
  reviewCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: Colors.textPrimary, fontWeight: '700' },
  reviewerName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  context: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  comment: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
});

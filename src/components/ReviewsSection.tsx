import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { Icon } from './Icon';
import type { Review } from '../data/mockData';

/** Renderiza estrelas preenchidas/vazias para uma nota de 0 a 5. */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name={i <= full ? 'star' : 'star-outline'}
          size={size}
          color={i <= full ? Colors.warning : Colors.textMuted}
        />
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
            <Icon name="star" size={13} color={Colors.base} />
            <Text style={styles.addText}>Avaliar</Text>
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
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionLabel: { ...Typography.label },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
  },
  addText: { color: Colors.base, fontSize: 12, fontWeight: '700' },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md + 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avg: { ...Typography.display, fontSize: 36, lineHeight: 40 },
  starsRow: { flexDirection: 'row', gap: 2 },
  count: { color: Colors.textSecondary, fontSize: 13, marginTop: Spacing.xs },

  list: { gap: Spacing.sm + 2, marginTop: Spacing.md },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2, marginBottom: Spacing.sm },
  avatar: { width: 32, height: 32, borderRadius: Radius.pill },
  avatarFallback: { backgroundColor: Colors.elevated, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: Colors.textPrimary, fontWeight: '700' },
  reviewerName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  context: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  comment: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
});

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { Icon } from './Icon';
import type { Opening } from '../data/mockData';

const GOAL_COLORS: Record<string, string> = {
  'Banda Fixa': Colors.accent,
  'Colaboração Pontual': Colors.blue,
  'Jam Session': Colors.warning,
  'Trabalho Remunerado': Colors.success,
  'Substituição Temporária': '#E67E22',
};

/** Cartão de uma vaga aberta, com relevância calculada e metadados. */
export function OpeningCard({ opening }: { opening: Opening }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.goalBadge, { backgroundColor: GOAL_COLORS[opening.goal] ?? Colors.accent }]}>
          <Text style={styles.goalText}>{opening.goal}</Text>
        </View>
        {opening.matchScore !== undefined && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{opening.matchScore}% p/ você</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{opening.title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {opening.description}
      </Text>

      {/* Instrumentos procurados */}
      <View style={styles.tagsRow}>
        {opening.instruments.map((i) => (
          <View key={i} style={styles.instrumentTag}>
            <Icon name="musical-notes" size={11} color={Colors.accent} />
            <Text style={styles.instrumentText}>{i}</Text>
          </View>
        ))}
        {opening.genres.slice(0, 2).map((g) => (
          <View key={g} style={styles.genreTag}>
            <Text style={styles.genreText}>{g}</Text>
          </View>
        ))}
      </View>

      <View style={styles.locationRow}>
        <Icon name="location" size={13} color={Colors.textSecondary} />
        <Text style={styles.location}>{opening.location}</Text>
      </View>

      {/* Autor */}
      <View style={styles.authorRow}>
        {opening.authorAvatar ? (
          <Image source={{ uri: opening.authorAvatar }} style={styles.authorAvatar} />
        ) : (
          <View style={[styles.authorAvatar, styles.authorAvatarFallback]}>
            <Text style={styles.authorInitial}>{(opening.authorName ?? '?')[0]}</Text>
          </View>
        )}
        <Text style={styles.authorName}>{opening.authorName ?? 'Alguém'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm + 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalBadge: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 5, borderRadius: Radius.sm },
  goalText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  matchBadge: {
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  matchText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  title: { ...Typography.h3, fontSize: 17 },
  description: { ...Typography.body, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs + 2 },
  instrumentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm - 2,
  },
  instrumentText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  genreTag: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm - 2,
  },
  genreText: { color: Colors.textSecondary, fontSize: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  location: { color: Colors.textSecondary, fontSize: 13 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  authorAvatar: { width: 26, height: 26, borderRadius: Radius.pill },
  authorAvatarFallback: { backgroundColor: Colors.elevated, alignItems: 'center', justifyContent: 'center' },
  authorInitial: { color: Colors.textPrimary, fontWeight: '700', fontSize: 12 },
  authorName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
});

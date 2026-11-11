import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import type { Opening } from '../data/mockData';

const GOAL_COLORS: Record<string, string> = {
  'Banda Fixa': Colors.teal,
  'Colaboração Pontual': Colors.blue,
  'Jam Session': Colors.gold,
  'Trabalho Remunerado': Colors.green,
  'Substituição Temporária': '#E67E22',
};

/** Cartão de uma vaga aberta, com relevância calculada e metadados. */
export function OpeningCard({ opening }: { opening: Opening }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.goalBadge, { backgroundColor: GOAL_COLORS[opening.goal] ?? Colors.teal }]}>
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
            <Text style={styles.instrumentText}>🎯 {i}</Text>
          </View>
        ))}
        {opening.genres.slice(0, 2).map((g) => (
          <View key={g} style={styles.genreTag}>
            <Text style={styles.genreText}>{g}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.location}>📍 {opening.location}</Text>

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
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  goalText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  matchBadge: {
    backgroundColor: 'rgba(0, 212, 200, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  matchText: { color: Colors.teal, fontSize: 11, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  instrumentTag: {
    backgroundColor: 'rgba(0, 212, 200, 0.12)',
    borderWidth: 1,
    borderColor: Colors.teal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  instrumentText: { color: Colors.teal, fontSize: 12, fontWeight: '600' },
  genreTag: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreText: { color: Colors.textSecondary, fontSize: 12 },
  location: { color: Colors.textSecondary, fontSize: 13 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  authorAvatar: { width: 26, height: 26, borderRadius: 13 },
  authorAvatarFallback: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  authorInitial: { color: Colors.textPrimary, fontWeight: '700', fontSize: 12 },
  authorName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
});

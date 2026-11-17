import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { Icon } from './Icon';
import type { MusicEvent } from '../data/mockData';

/** Formata uma data ISO (yyyy-mm-dd) para exibição curta em pt-BR. */
function formatDate(iso?: string): string {
  if (!iso) return 'Data a definir';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' });
}

/** Cartão de um evento/demanda, com relevância e dados principais. */
export function EventCard({ event }: { event: MusicEvent }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{event.eventType || 'Evento'}</Text>
        </View>
        {event.matchScore !== undefined && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{event.matchScore}% p/ você</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{event.title}</Text>

      {/* Data + cachê em destaque */}
      <View style={styles.highlightRow}>
        <View style={styles.highlight}>
          <Icon name="calendar" size={14} color={Colors.textSecondary} />
          <Text style={styles.highlightText}>{formatDate(event.eventDate)}</Text>
        </View>
        <View style={styles.highlight}>
          <Icon name="cash" size={14} color={Colors.success} />
          <Text style={styles.highlightText}>{event.budget || 'a combinar'}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {event.description}
      </Text>

      <View style={styles.tagsRow}>
        {event.instruments.map((i) => (
          <View key={i} style={styles.instrumentTag}>
            <Icon name="musical-notes" size={11} color={Colors.accent} />
            <Text style={styles.instrumentText}>{i}</Text>
          </View>
        ))}
        {event.genres.slice(0, 2).map((g) => (
          <View key={g} style={styles.genreTag}>
            <Text style={styles.genreText}>{g}</Text>
          </View>
        ))}
      </View>

      <View style={styles.locationRow}>
        <Icon name="location" size={13} color={Colors.textSecondary} />
        <Text style={styles.location}>{event.location}</Text>
      </View>

      <View style={styles.authorRow}>
        {event.authorAvatar ? (
          <Image source={{ uri: event.authorAvatar }} style={styles.authorAvatar} />
        ) : (
          <View style={[styles.authorAvatar, styles.authorFallback]}>
            <Text style={styles.authorInitial}>{(event.authorName ?? '?')[0]}</Text>
          </View>
        )}
        <Text style={styles.authorName}>{event.authorName ?? 'Contratante'}</Text>
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
  typeBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  typeText: { color: Colors.base, fontSize: 11, fontWeight: '700' },
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

  highlightRow: { flexDirection: 'row', gap: Spacing.sm },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
  },
  highlightText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },

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
  authorFallback: { backgroundColor: Colors.elevated, alignItems: 'center', justifyContent: 'center' },
  authorInitial: { color: Colors.textPrimary, fontWeight: '700', fontSize: 12 },
  authorName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
});

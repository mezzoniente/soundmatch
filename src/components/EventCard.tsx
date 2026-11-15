import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
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
          <Text style={styles.highlightIcon}>📅</Text>
          <Text style={styles.highlightText}>{formatDate(event.eventDate)}</Text>
        </View>
        <View style={styles.highlight}>
          <Text style={styles.highlightIcon}>💰</Text>
          <Text style={styles.highlightText}>{event.budget || 'a combinar'}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {event.description}
      </Text>

      <View style={styles.tagsRow}>
        {event.instruments.map((i) => (
          <View key={i} style={styles.instrumentTag}>
            <Text style={styles.instrumentText}>🎯 {i}</Text>
          </View>
        ))}
        {event.genres.slice(0, 2).map((g) => (
          <View key={g} style={styles.genreTag}>
            <Text style={styles.genreText}>{g}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.location}>📍 {event.location}</Text>

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
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { backgroundColor: Colors.gold, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  typeText: { color: Colors.bg, fontSize: 11, fontWeight: '700' },
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

  highlightRow: { flexDirection: 'row', gap: 8 },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  highlightIcon: { fontSize: 13 },
  highlightText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },

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
  genreTag: { backgroundColor: Colors.bgElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  genreText: { color: Colors.textSecondary, fontSize: 12 },
  location: { color: Colors.textSecondary, fontSize: 13 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  authorAvatar: { width: 26, height: 26, borderRadius: 13 },
  authorFallback: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  authorInitial: { color: Colors.textPrimary, fontWeight: '700', fontSize: 12 },
  authorName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
});

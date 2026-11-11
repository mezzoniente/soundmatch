import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import type { MatchResult, CriterionKey } from '../lib/matchEngine';

const CRITERION_ICON: Record<CriterionKey, string> = {
  instrument: '🎸',
  proximity: '📍',
  genres: '🎵',
  level: '⭐',
  availability: '🗓️',
  goals: '🎯',
};

/** Cor da barra conforme a força do critério. */
function barColor(score: number): string {
  if (score >= 0.66) return Colors.green;
  if (score >= 0.33) return Colors.gold;
  return Colors.red;
}

/**
 * Explicação transparente do match: score geral + detalhamento por critério,
 * cada um com barra de progresso, peso e a razão legível.
 */
export function MatchBreakdown({ result }: { result: MatchResult }) {
  return (
    <View style={styles.container}>
      {/* Cabeçalho com o score geral */}
      <View style={styles.header}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreNumber}>{result.score}%</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Compatibilidade</Text>
          <Text style={styles.headerSubtitle}>Por que esse match</Text>
        </View>
      </View>

      {/* Critérios */}
      <View style={styles.criteria}>
        {result.breakdown.map((c) => (
          <View key={c.key} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowLabel}>
                {CRITERION_ICON[c.key]} {c.label}
              </Text>
              <Text style={styles.rowPercent}>{Math.round(c.score * 100)}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.max(2, c.score * 100)}%`, backgroundColor: barColor(c.score) },
                ]}
              />
            </View>
            <Text style={styles.rowReason}>{c.reason}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  scoreBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 20, fontWeight: '900', color: Colors.bg },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  criteria: { gap: 14 },
  row: {},
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowPercent: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },
  rowReason: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
});

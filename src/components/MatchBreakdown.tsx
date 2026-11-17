import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { Icon, IconName } from './Icon';
import type { MatchResult, CriterionKey } from '../lib/matchEngine';

const CRITERION_ICON: Record<CriterionKey, IconName> = {
  instrument: 'musical-notes',
  proximity: 'location',
  genres: 'disc',
  level: 'star',
  availability: 'calendar',
  goals: 'flag',
  reputation: 'ribbon',
};

/** Cor da barra conforme a força do critério. */
function barColor(score: number): string {
  if (score >= 0.66) return Colors.success;
  if (score >= 0.33) return Colors.warning;
  return Colors.danger;
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
              <View style={styles.rowLabelWrap}>
                <Icon name={CRITERION_ICON[c.key]} size={14} color={Colors.textSecondary} />
                <Text style={styles.rowLabel}>{c.label}</Text>
              </View>
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md + 2, marginBottom: Spacing.lg },
  scoreBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 20, fontWeight: '900', color: Colors.base },
  headerText: { flex: 1 },
  headerTitle: { ...Typography.h3, fontSize: 18 },
  headerSubtitle: { ...Typography.caption, marginTop: 2 },

  criteria: { gap: Spacing.md + 2 },
  row: {},
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  rowLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs + 2 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowPercent: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.base,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },
  rowReason: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
});

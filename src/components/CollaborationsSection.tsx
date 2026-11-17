import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { Icon } from './Icon';
import type { Collaboration } from '../lib/trust';

/** Histórico público de colaborações concluídas (derivado das avaliações recebidas). */
export function CollaborationsSection({ collaborations }: { collaborations: Collaboration[] }) {
  if (collaborations.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>COLABORAÇÕES</Text>
      <View style={styles.list}>
        {collaborations.map((c) => (
          <View key={c.id} style={styles.row}>
            {c.partnerAvatar ? (
              <Image source={{ uri: c.partnerAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{c.partnerName[0]}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.context}>{c.context}</Text>
              <Text style={styles.partner}>com {c.partnerName}</Text>
            </View>
            <View style={styles.ratingPill}>
              <Icon name="star" size={12} color={Colors.warning} />
              <Text style={styles.ratingText}>{c.rating}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionLabel: { ...Typography.label, marginBottom: Spacing.md },
  list: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { width: 36, height: 36, borderRadius: Radius.pill },
  avatarFallback: { backgroundColor: Colors.elevated, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: Colors.textPrimary, fontWeight: '700' },
  context: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  partner: { color: Colors.textSecondary, fontSize: 13, marginTop: 1 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.warningSoft,
    borderWidth: 1,
    borderColor: Colors.warning,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  ratingText: { color: Colors.warning, fontSize: 12, fontWeight: '700' },
});

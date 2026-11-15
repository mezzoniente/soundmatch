import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
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
              <Text style={styles.ratingText}>★ {c.rating}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: Colors.textPrimary, fontWeight: '700' },
  context: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  partner: { color: Colors.textSecondary, fontSize: 13, marginTop: 1 },
  ratingPill: {
    backgroundColor: 'rgba(240, 180, 41, 0.15)',
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: { color: Colors.gold, fontSize: 12, fontWeight: '700' },
});

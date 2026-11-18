import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { Icon, IconName } from './Icon';
import { WEEKDAYS, TIME_SLOTS } from '../constants/options';
import type {
  AvailabilitySchedule,
  BandExperience,
  EquipmentLevel,
  SoftSkills,
} from '../data/mockData';

const EQUIPMENT_ICONS: Record<EquipmentLevel, IconName> = {
  'Estúdio próprio': 'headset',
  'Equipamento portátil': 'bag',
  'Apenas instrumento': 'musical-note',
  'Sem equipamento': 'ban',
};

/** Rótulo de seção padrão, reaproveitando o visual das telas de perfil. */
function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

/** Grade visual de disponibilidade (dia x turno). Somente leitura. */
export function AvailabilityGrid({ schedule }: { schedule?: AvailabilitySchedule }) {
  if (!schedule || Object.keys(schedule).length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <SectionLabel>DISPONIBILIDADE</SectionLabel>
      <View style={styles.card}>
        <View style={styles.gridHeaderRow}>
          <View style={styles.dayCell} />
          {TIME_SLOTS.map((slot) => (
            <Text key={slot} style={styles.gridHeaderText}>
              {slot}
            </Text>
          ))}
        </View>
        {WEEKDAYS.map((day) => {
          const slots = schedule[day] ?? [];
          return (
            <View key={day} style={styles.gridRow}>
              <Text style={styles.dayLabel}>{day}</Text>
              {TIME_SLOTS.map((slot) => {
                const active = slots.includes(slot);
                return (
                  <View
                    key={slot}
                    style={[styles.gridCell, active && styles.gridCellActive]}
                  >
                    {active && <Icon name="checkmark" size={14} color={Colors.accent} />}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Cartão de equipamento. */
export function EquipmentSection({ equipment }: { equipment?: EquipmentLevel }) {
  if (!equipment) return null;
  return (
    <View style={styles.section}>
      <SectionLabel>EQUIPAMENTO</SectionLabel>
      <View style={styles.inlineCard}>
        <Icon name={EQUIPMENT_ICONS[equipment]} size={22} color={Colors.accent} />
        <Text style={styles.inlineText}>{equipment}</Text>
      </View>
    </View>
  );
}

/** Cartão de experiência de banda/palco. */
export function BandExperienceSection({ experience }: { experience?: BandExperience }) {
  if (!experience) return null;
  return (
    <View style={styles.section}>
      <SectionLabel>EXPERIÊNCIA</SectionLabel>
      <View style={styles.card}>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, experience.playedLive ? styles.badgeOn : styles.badgeOff]}>
            <Icon
              name={experience.playedLive ? 'checkmark' : 'remove'}
              size={13}
              color={experience.playedLive ? Colors.success : Colors.textMuted}
            />
            <Text style={experience.playedLive ? styles.badgeOnText : styles.badgeOffText}>
              Ao vivo
            </Text>
          </View>
          <View style={[styles.badge, experience.recorded ? styles.badgeOn : styles.badgeOff]}>
            <Icon
              name={experience.recorded ? 'checkmark' : 'remove'}
              size={13}
              color={experience.recorded ? Colors.success : Colors.textMuted}
            />
            <Text style={experience.recorded ? styles.badgeOnText : styles.badgeOffText}>
              Gravou
            </Text>
          </View>
          <View style={styles.badgeNeutral}>
            <Text style={styles.badgeNeutralText}>
              {experience.yearsInBands} {experience.yearsInBands === 1 ? 'ano' : 'anos'} de banda
            </Text>
          </View>
        </View>
        {experience.notes ? <Text style={styles.notes}>{experience.notes}</Text> : null}
      </View>
    </View>
  );
}

/** Barras de soft skills (1-5). */
export function SoftSkillsSection({ skills }: { skills?: SoftSkills }) {
  if (!skills) return null;
  const rows: { label: string; value: number }[] = [
    { label: 'Pontualidade', value: skills.punctuality },
    { label: 'Comprometimento', value: skills.commitment },
    { label: 'Abertura a estilos', value: skills.openness },
  ];
  return (
    <View style={styles.section}>
      <SectionLabel>SOFT SKILLS</SectionLabel>
      <View style={styles.card}>
        {rows.map((row) => (
          <View key={row.label} style={styles.skillRow}>
            <Text style={styles.skillLabel}>{row.label}</Text>
            <View style={styles.skillBarTrack}>
              <View style={[styles.skillBarFill, { width: `${(row.value / 5) * 100}%` }]} />
            </View>
            <Text style={styles.skillValue}>{row.value}/5</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionLabel: { ...Typography.label, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Availability grid
  gridHeaderRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  gridHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs + 2 },
  dayCell: { width: 40 },
  dayLabel: { width: 40, color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  gridCell: {
    flex: 1,
    height: 30,
    marginHorizontal: Spacing.xs,
    borderRadius: Radius.sm - 2,
    backgroundColor: Colors.base,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },

  // Equipment
  inlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inlineText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },

  // Band experience
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  badgeOn: { backgroundColor: Colors.successSoft, borderColor: Colors.success },
  badgeOnText: { color: Colors.success, fontSize: 13, fontWeight: '600' },
  badgeOff: { backgroundColor: Colors.base, borderColor: Colors.border },
  badgeOffText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  badgeNeutral: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: Radius.sm,
    backgroundColor: Colors.elevated,
  },
  badgeNeutralText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  notes: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: Spacing.md },

  // Soft skills
  skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  skillLabel: { width: 130, color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  skillBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.base,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm + 2,
  },
  skillBarFill: { height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  skillValue: { width: 32, color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { WEEKDAYS, TIME_SLOTS } from '../constants/options';
import type {
  AvailabilitySchedule,
  BandExperience,
  EquipmentLevel,
  SoftSkills,
} from '../data/mockData';

const EQUIPMENT_ICONS: Record<EquipmentLevel, string> = {
  'Estúdio próprio': '🎚️',
  'Equipamento portátil': '🎒',
  'Apenas instrumento': '🎻',
  'Sem equipamento': '🚫',
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
                    {active && <Text style={styles.gridCheck}>●</Text>}
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
        <Text style={styles.inlineIcon}>{EQUIPMENT_ICONS[equipment]}</Text>
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
            <Text style={experience.playedLive ? styles.badgeOnText : styles.badgeOffText}>
              {experience.playedLive ? '✓' : '—'} Ao vivo
            </Text>
          </View>
          <View style={[styles.badge, experience.recorded ? styles.badgeOn : styles.badgeOff]}>
            <Text style={experience.recorded ? styles.badgeOnText : styles.badgeOffText}>
              {experience.recorded ? '✓' : '—'} Gravou
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
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Availability grid
  gridHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  gridHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dayCell: { width: 40 },
  dayLabel: { width: 40, color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  gridCell: {
    flex: 1,
    height: 30,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellActive: { backgroundColor: 'rgba(0, 212, 200, 0.2)', borderColor: Colors.teal },
  gridCheck: { color: Colors.teal, fontSize: 12 },

  // Equipment
  inlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inlineIcon: { fontSize: 24 },
  inlineText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },

  // Band experience
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1 },
  badgeOn: { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderColor: Colors.green },
  badgeOnText: { color: Colors.green, fontSize: 13, fontWeight: '600' },
  badgeOff: { backgroundColor: Colors.bg, borderColor: Colors.border },
  badgeOffText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  badgeNeutral: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.blueMid,
  },
  badgeNeutralText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  notes: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 12 },

  // Soft skills
  skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  skillLabel: { width: 130, color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  skillBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  skillBarFill: { height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  skillValue: { width: 32, color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
});

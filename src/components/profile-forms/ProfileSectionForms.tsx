import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/theme';
import { Typography } from '../../constants/typography';
import { Icon } from '../Icon';
import { SelectChip } from '../SelectChip';
import { FormField } from '../FormField';
import {
  INSTRUMENTS,
  SKILL_LEVELS,
  GENRE_SUGGESTIONS,
  COLLAB_GOALS,
  EQUIPMENT_LEVELS,
  WEEKDAYS,
  TIME_SLOTS,
  VIBE_COLORS,
} from '../../constants/options';
import type {
  Instrument,
  SkillLevel,
  CollabGoal,
  EquipmentLevel,
  AvailabilitySchedule,
  Weekday,
  TimeSlot,
} from '../../data/mockData';

/**
 * Formulários de cada seção do perfil, reutilizáveis tanto no onboarding (wizard)
 * quanto na edição modular. Cada um é controlado: recebe valor + setter.
 */

export function IdentityForm({
  name,
  setName,
  age,
  setAge,
  role,
  setRole,
  location,
  setLocation,
}: {
  name: string;
  setName: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}) {
  return (
    <View>
      <FormField label="Nome artístico" value={name} onChangeText={setName} placeholder="Seu nome" />
      <FormField
        label="Idade"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        placeholder="Ex: 27"
      />
      <FormField
        label="Como você se descreve?"
        value={role}
        onChangeText={setRole}
        placeholder="Ex: Guitarrista de rock"
      />
      <FormField
        label="Localização"
        value={location}
        onChangeText={setLocation}
        placeholder="Ex: São Paulo, SP"
      />
    </View>
  );
}

export function InstrumentsForm({
  instruments,
  toggleInstrument,
  level,
  setLevel,
}: {
  instruments: Instrument[];
  toggleInstrument: (i: Instrument) => void;
  level: SkillLevel;
  setLevel: (l: SkillLevel) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Instrumentos</Text>
      <View style={styles.chipGrid}>
        {INSTRUMENTS.map((inst) => (
          <SelectChip
            key={inst}
            label={inst}
            selected={instruments.includes(inst)}
            onPress={() => toggleInstrument(inst)}
          />
        ))}
      </View>
      <Text style={[styles.label, { marginTop: 20 }]}>Nível</Text>
      <View style={styles.chipGrid}>
        {SKILL_LEVELS.map((lvl) => (
          <SelectChip key={lvl} label={lvl} selected={level === lvl} onPress={() => setLevel(lvl)} />
        ))}
      </View>
    </View>
  );
}

export function StyleForm({
  genres,
  toggleGenre,
  influencesText,
  setInfluencesText,
}: {
  genres: string[];
  toggleGenre: (g: string) => void;
  influencesText: string;
  setInfluencesText: (v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Gêneros</Text>
      <View style={styles.chipGrid}>
        {GENRE_SUGGESTIONS.map((g) => (
          <SelectChip
            key={g}
            label={g}
            selected={genres.includes(g)}
            onPress={() => toggleGenre(g)}
          />
        ))}
      </View>
      <View style={{ marginTop: 24 }}>
        <FormField
          label="Influências"
          hint="Separe por vírgula (ex: Jimi Hendrix, Djavan)."
          value={influencesText}
          onChangeText={setInfluencesText}
          placeholder="Artistas que te inspiram"
        />
      </View>
    </View>
  );
}

export function GoalsForm({
  goals,
  toggleGoal,
}: {
  goals: CollabGoal[];
  toggleGoal: (g: CollabGoal) => void;
}) {
  return (
    <View style={styles.goalList}>
      {COLLAB_GOALS.map((g) => {
        const selected = goals.includes(g.value);
        return (
          <TouchableOpacity
            key={g.value}
            activeOpacity={0.8}
            onPress={() => toggleGoal(g.value)}
            style={[styles.goalCard, selected && styles.goalCardSelected]}
          >
            <Icon
              name={g.icon}
              size={22}
              color={selected ? Colors.accent : Colors.textSecondary}
              style={styles.goalIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalTitle, selected && styles.goalTitleSelected]}>
                {g.value}
              </Text>
              <Text style={styles.goalDesc}>{g.description}</Text>
            </View>
            {selected && <Icon name="checkmark" size={18} color={Colors.accent} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AvailabilityForm({
  schedule,
  toggleSlot,
}: {
  schedule: AvailabilitySchedule;
  toggleSlot: (day: Weekday, slot: TimeSlot) => void;
}) {
  return (
    <View style={styles.scheduleGrid}>
      <View style={styles.scheduleHeaderRow}>
        <View style={styles.scheduleDayCell} />
        {TIME_SLOTS.map((slot) => (
          <Text key={slot} style={styles.scheduleHeaderText}>
            {slot}
          </Text>
        ))}
      </View>
      {WEEKDAYS.map((day) => (
        <View key={day} style={styles.scheduleRow}>
          <Text style={styles.scheduleDayLabel}>{day}</Text>
          {TIME_SLOTS.map((slot) => {
            const active = schedule[day]?.includes(slot) ?? false;
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.scheduleCell, active && styles.scheduleCellActive]}
                onPress={() => toggleSlot(day, slot)}
              >
                {active && <Icon name="checkmark" size={16} color={Colors.base} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function ExperienceForm({
  equipment,
  setEquipment,
  playedLive,
  setPlayedLive,
  recorded,
  setRecorded,
  yearsInBands,
  setYearsInBands,
}: {
  equipment: EquipmentLevel | undefined;
  setEquipment: (e: EquipmentLevel) => void;
  playedLive: boolean;
  setPlayedLive: (v: boolean) => void;
  recorded: boolean;
  setRecorded: (v: boolean) => void;
  yearsInBands: string;
  setYearsInBands: (v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Equipamento</Text>
      <View style={styles.chipGrid}>
        {EQUIPMENT_LEVELS.map((eq) => (
          <SelectChip
            key={eq.value}
            label={eq.value}
            icon={eq.icon}
            selected={equipment === eq.value}
            onPress={() => setEquipment(eq.value)}
          />
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>Experiência de banda</Text>
      <View style={styles.toggleRow}>
        <TogglePill label="Já toquei ao vivo" active={playedLive} onPress={() => setPlayedLive(!playedLive)} />
        <TogglePill label="Já gravei" active={recorded} onPress={() => setRecorded(!recorded)} />
      </View>
      <View style={{ marginTop: 16 }}>
        <FormField
          label="Anos em bandas"
          value={yearsInBands}
          onChangeText={setYearsInBands}
          keyboardType="number-pad"
          placeholder="0"
        />
      </View>
    </View>
  );
}

export function VibeForm({
  vibe,
  setVibe,
  bio,
  setBio,
}: {
  vibe: { color: string; name: string };
  setVibe: (v: { color: string; name: string }) => void;
  bio: string;
  setBio: (v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Cor da sua vibe</Text>
      <View style={styles.vibeGrid}>
        {VIBE_COLORS.map((v) => {
          const selected = vibe.color === v.color;
          return (
            <TouchableOpacity
              key={v.color}
              onPress={() => setVibe(v)}
              style={[styles.vibeSwatch, { backgroundColor: v.color }, selected && styles.vibeSwatchSelected]}
            >
              {selected && <Icon name="checkmark" size={22} color="#fff" />}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.vibeName}>{vibe.name}</Text>

      <View style={{ marginTop: 24 }}>
        <FormField
          label="Bio"
          hint="Uma frase que te apresenta."
          value={bio}
          onChangeText={setBio}
          placeholder="Ex: Cantora de soul buscando banda fixa."
          multiline
          numberOfLines={3}
          style={styles.bioInput}
        />
      </View>
    </View>
  );
}

function TogglePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.togglePill, active && styles.togglePillActive]}>
      {active && <Icon name="checkmark" size={14} color={Colors.base} style={styles.togglePillIcon} />}
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    ...Typography.label,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm + 2,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

  goalList: { gap: Spacing.sm + 2 },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  goalIcon: { width: 28, textAlign: 'center' },
  goalTitle: { ...Typography.h3, fontSize: 16 },
  goalTitleSelected: { color: Colors.accent },
  goalDesc: { ...Typography.caption, fontSize: 13, marginTop: 2 },

  scheduleGrid: { marginTop: Spacing.xs },
  scheduleHeaderRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  scheduleHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  scheduleDayCell: { width: 44 },
  scheduleDayLabel: { width: 44, color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  scheduleCell: {
    flex: 1,
    height: 44,
    marginHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleCellActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },

  toggleRow: { flexDirection: 'row', gap: Spacing.sm + 2 },
  togglePill: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePillActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  togglePillIcon: { marginRight: 0 },
  toggleText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  toggleTextActive: { color: Colors.base },

  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.md },
  vibeSwatch: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  vibeSwatchSelected: { borderColor: Colors.textPrimary },
  vibeName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },

  bioInput: { minHeight: 80, textAlignVertical: 'top' },
});

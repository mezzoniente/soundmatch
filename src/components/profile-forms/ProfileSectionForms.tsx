import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
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
            <Text style={styles.goalIcon}>{g.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalTitle, selected && styles.goalTitleSelected]}>
                {g.value}
              </Text>
              <Text style={styles.goalDesc}>{g.description}</Text>
            </View>
            {selected && <Text style={styles.goalCheck}>✓</Text>}
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
                {active && <Text style={styles.scheduleCheck}>✓</Text>}
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
              {selected && <Text style={styles.vibeCheck}>✓</Text>}
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
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
        {active ? '✓ ' : ''}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  goalList: { gap: 10 },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardSelected: { borderColor: Colors.teal, backgroundColor: 'rgba(0, 212, 200, 0.08)' },
  goalIcon: { fontSize: 26 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  goalTitleSelected: { color: Colors.teal },
  goalDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  goalCheck: { fontSize: 18, color: Colors.teal, fontWeight: '800' },

  scheduleGrid: { marginTop: 4 },
  scheduleHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  scheduleHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scheduleDayCell: { width: 44 },
  scheduleDayLabel: { width: 44, color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  scheduleCell: {
    flex: 1,
    height: 44,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleCellActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  scheduleCheck: { color: Colors.bg, fontWeight: '900', fontSize: 16 },

  toggleRow: { flexDirection: 'row', gap: 10 },
  togglePill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  togglePillActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  toggleText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  toggleTextActive: { color: Colors.bg },

  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  vibeSwatch: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  vibeSwatchSelected: { borderColor: Colors.textPrimary },
  vibeCheck: { color: '#fff', fontSize: 22, fontWeight: '900' },
  vibeName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },

  bioInput: { minHeight: 80, textAlignVertical: 'top' },
});

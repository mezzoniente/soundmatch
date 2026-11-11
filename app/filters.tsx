import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { SelectChip } from '../src/components/SelectChip';
import { useFilters } from '../src/state/FilterContext';
import { INSTRUMENTS, SKILL_LEVELS, GENRE_SUGGESTIONS, COLLAB_GOALS } from '../src/constants/options';
import { EMPTY_FILTERS, activeFilterCount } from '../src/lib/matchEngine';
import type { Instrument, SkillLevel, CollabGoal } from '../src/data/mockData';

/** Presets de raio em km. `Infinity` = sem limite. */
const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
  { label: 'Sem limite', value: Infinity },
];

export default function FiltersScreen() {
  const router = useRouter();
  const { filters, setFilters } = useFilters();

  // Estado local; só aplica ao confirmar.
  const [instruments, setInstruments] = useState<Instrument[]>(filters.instruments);
  const [levels, setLevels] = useState<SkillLevel[]>(filters.levels);
  const [genres, setGenres] = useState<string[]>(filters.genres);
  const [goals, setGoals] = useState<CollabGoal[]>(filters.goals);
  const [radiusKm, setRadiusKm] = useState<number>(filters.radiusKm);

  const toggle = <T,>(list: T[], item: T, setter: (v: T[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const draft = { instruments, levels, genres, goals, radiusKm };
  const count = activeFilterCount(draft);

  const apply = () => {
    setFilters(draft);
    router.back();
  };

  const clearAll = () => {
    setInstruments([]);
    setLevels([]);
    setGenres([]);
    setGoals([]);
    setRadiusKm(EMPTY_FILTERS.radiusKm);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtros</Text>
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Raio */}
        <Text style={styles.label}>Distância máxima</Text>
        <View style={styles.chipGrid}>
          {RADIUS_PRESETS.map((r) => (
            <SelectChip
              key={r.label}
              label={r.label}
              selected={radiusKm === r.value}
              onPress={() => setRadiusKm(r.value)}
            />
          ))}
        </View>

        {/* Instrumentos */}
        <Text style={[styles.label, styles.labelSpaced]}>Instrumento</Text>
        <View style={styles.chipGrid}>
          {INSTRUMENTS.map((i) => (
            <SelectChip
              key={i}
              label={i}
              selected={instruments.includes(i)}
              onPress={() => toggle(instruments, i, setInstruments)}
            />
          ))}
        </View>

        {/* Nível */}
        <Text style={[styles.label, styles.labelSpaced]}>Nível</Text>
        <View style={styles.chipGrid}>
          {SKILL_LEVELS.map((l) => (
            <SelectChip
              key={l}
              label={l}
              selected={levels.includes(l)}
              onPress={() => toggle(levels, l, setLevels)}
            />
          ))}
        </View>

        {/* Gêneros */}
        <Text style={[styles.label, styles.labelSpaced]}>Gêneros</Text>
        <View style={styles.chipGrid}>
          {GENRE_SUGGESTIONS.map((g) => (
            <SelectChip
              key={g}
              label={g}
              selected={genres.includes(g)}
              onPress={() => toggle(genres, g, setGenres)}
            />
          ))}
        </View>

        {/* Objetivos */}
        <Text style={[styles.label, styles.labelSpaced]}>Objetivo</Text>
        <View style={styles.chipGrid}>
          {COLLAB_GOALS.map((g) => (
            <SelectChip
              key={g.value}
              label={g.value}
              icon={g.icon}
              selected={goals.includes(g.value)}
              onPress={() => toggle(goals, g.value, setGoals)}
            />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={apply}>
          <Text style={styles.applyText}>
            Aplicar{count > 0 ? ` (${count})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 32, color: Colors.textPrimary, lineHeight: 32 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  clearBtn: { paddingHorizontal: 12, height: 44, justifyContent: 'center' },
  clearText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },

  content: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  labelSpaced: { marginTop: 24 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  applyBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
});

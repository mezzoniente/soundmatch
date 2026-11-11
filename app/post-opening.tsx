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
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { FormField } from '../src/components/FormField';
import { SelectChip } from '../src/components/SelectChip';
import { useAuth } from '../src/state/AuthContext';
import { useProfile } from '../src/state/ProfileContext';
import { createOpening } from '../src/lib/openingsRepository';
import { INSTRUMENTS, GENRE_SUGGESTIONS, COLLAB_GOALS, SKILL_LEVELS } from '../src/constants/options';
import type { Instrument, CollabGoal, SkillLevel } from '../src/data/mockData';

export default function PostOpeningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [goal, setGoal] = useState<CollabGoal | undefined>(undefined);
  const [level, setLevel] = useState<SkillLevel | undefined>(undefined);
  const [location, setLocation] = useState(profile.location);
  const [submitting, setSubmitting] = useState(false);

  const toggle = <T,>(list: T[], item: T, setter: (v: T[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const canSubmit =
    title.trim().length > 0 &&
    instruments.length > 0 &&
    goal !== undefined &&
    location.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || !user || !goal) return;
    setSubmitting(true);
    const { error } = await createOpening(user.id, {
      title: title.trim(),
      description: description.trim(),
      instruments,
      genres,
      level,
      goal,
      location: location.trim(),
      coordinates: profile.coordinates,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Erro', 'Não foi possível publicar a vaga. Tente novamente.');
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Postar vaga</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="Título"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Banda indie procura baterista"
          />
          <FormField
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Conte sobre o projeto, ensaios, expectativas..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <Text style={styles.label}>Instrumento(s) procurado(s)</Text>
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

          <Text style={[styles.label, styles.spaced]}>Gêneros</Text>
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

          <Text style={[styles.label, styles.spaced]}>Objetivo</Text>
          <View style={styles.chipGrid}>
            {COLLAB_GOALS.map((g) => (
              <SelectChip
                key={g.value}
                label={g.value}
                icon={g.icon}
                selected={goal === g.value}
                onPress={() => setGoal(g.value)}
              />
            ))}
          </View>

          <Text style={[styles.label, styles.spaced]}>Nível desejado (opcional)</Text>
          <View style={styles.chipGrid}>
            {SKILL_LEVELS.map((l) => (
              <SelectChip
                key={l}
                label={l}
                selected={level === l}
                onPress={() => setLevel(level === l ? undefined : l)}
              />
            ))}
          </View>

          <View style={styles.spaced}>
            <FormField
              label="Localização"
              value={location}
              onChangeText={setLocation}
              placeholder="Ex: São Paulo, SP"
            />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
            onPress={submit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                Publicar vaga
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  content: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  spaced: { marginTop: 20 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },

  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  submitBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Colors.bgCard },
  submitText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
  submitTextDisabled: { color: Colors.textMuted },
});

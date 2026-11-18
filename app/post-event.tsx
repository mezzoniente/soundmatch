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
import { Spacing, Radius } from '../src/constants/theme';
import { Typography } from '../src/constants/typography';
import { Icon } from '../src/components/Icon';
import { PressableScale } from '../src/components/PressableScale';
import { FormField } from '../src/components/FormField';
import { SelectChip } from '../src/components/SelectChip';
import { useAuth } from '../src/state/AuthContext';
import { useProfile } from '../src/state/ProfileContext';
import { createEvent } from '../src/lib/eventsRepository';
import { INSTRUMENTS, GENRE_SUGGESTIONS } from '../src/constants/options';
import { EVENT_TYPES } from '../src/data/mockData';
import type { Instrument } from '../src/data/mockData';

/** Valida se a string é uma data no formato aaaa-mm-dd. */
function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

export default function PostEventScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState(profile.location);
  const [submitting, setSubmitting] = useState(false);

  const toggle = <T,>(list: T[], item: T, setter: (v: T[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const dateOk = eventDate.length === 0 || isValidDate(eventDate);
  const canSubmit =
    title.trim().length > 0 && eventType !== undefined && location.trim().length > 0 && dateOk;

  const submit = async () => {
    if (!canSubmit || !user || !eventType) return;
    setSubmitting(true);
    const { error } = await createEvent(user.id, {
      title: title.trim(),
      description: description.trim(),
      eventType,
      instruments,
      genres,
      eventDate: eventDate.length > 0 ? eventDate : undefined,
      budget: budget.trim(),
      location: location.trim(),
      coordinates: profile.coordinates,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Erro', 'Não foi possível publicar o evento. Tente novamente.');
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
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Voltar">
            <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Postar evento</Text>
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
            placeholder="Ex: Banda cover para casamento"
          />
          <FormField
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Repertório, duração, detalhes do evento..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <Text style={styles.label}>Tipo de evento</Text>
          <View style={styles.chipGrid}>
            {EVENT_TYPES.map((t) => (
              <SelectChip
                key={t}
                label={t}
                selected={eventType === t}
                onPress={() => setEventType(t)}
              />
            ))}
          </View>

          <View style={styles.spaced}>
            <FormField
              label="Data do evento"
              hint="Formato: aaaa-mm-dd (ex: 2026-12-13)"
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="2026-12-13"
            />
            {!dateOk ? <Text style={styles.error}>Data inválida. Use aaaa-mm-dd.</Text> : null}
          </View>

          <FormField
            label="Cachê"
            value={budget}
            onChangeText={setBudget}
            placeholder="Ex: R$ 2.500 ou a combinar"
          />

          <Text style={[styles.label, styles.spaced]}>Instrumentos / formação</Text>
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
          <PressableScale
            style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
            onPress={submit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.base} />
            ) : (
              <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                Publicar evento
              </Text>
            )}
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.h3, fontSize: 18 },

  content: { padding: Spacing.xl },
  label: { ...Typography.label, fontSize: 13, letterSpacing: 0.8, marginBottom: Spacing.sm + 2 },
  spaced: { marginTop: Spacing.xl },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  error: { color: Colors.danger, fontSize: 13, marginTop: Spacing.xs + 2 },

  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.base,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Colors.surface },
  submitText: { ...Typography.button, fontSize: 16 },
  submitTextDisabled: { color: Colors.textMuted },
});

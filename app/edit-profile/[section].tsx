import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Spacing, Radius } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon } from '../../src/components/Icon';
import { PressableScale } from '../../src/components/PressableScale';
import { useProfile } from '../../src/state/ProfileContext';
import { EDIT_SECTIONS, EditSectionKey } from '../../src/constants/editSections';
import {
  IdentityForm,
  InstrumentsForm,
  StyleForm,
  GoalsForm,
  AvailabilityForm,
  ExperienceForm,
  VibeForm,
} from '../../src/components/profile-forms/ProfileSectionForms';
import { PhotosForm } from '../../src/components/profile-forms/PhotosForm';
import type {
  Instrument,
  SkillLevel,
  CollabGoal,
  EquipmentLevel,
  AvailabilitySchedule,
  Weekday,
  TimeSlot,
} from '../../src/data/mockData';

export default function EditSectionScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: EditSectionKey }>();
  const { profile, updateProfile } = useProfile();

  const sectionDef = EDIT_SECTIONS.find((s) => s.key === section);

  // Estado local de todos os campos (apenas os da seção ativa são usados ao salvar).
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(String(profile.age ?? ''));
  const [role, setRole] = useState(profile.role);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);

  const [instruments, setInstruments] = useState<Instrument[]>(profile.instruments);
  const [level, setLevel] = useState<SkillLevel>(profile.level);

  const [genres, setGenres] = useState<string[]>(profile.genres);
  const [influencesText, setInfluencesText] = useState(profile.influences.join(', '));

  const [goals, setGoals] = useState<CollabGoal[]>(profile.goals);

  const [schedule, setSchedule] = useState<AvailabilitySchedule>(profile.schedule ?? {});

  const [equipment, setEquipment] = useState<EquipmentLevel | undefined>(profile.equipment);
  const [playedLive, setPlayedLive] = useState(profile.bandExperience?.playedLive ?? false);
  const [recorded, setRecorded] = useState(profile.bandExperience?.recorded ?? false);
  const [yearsInBands, setYearsInBands] = useState(
    String(profile.bandExperience?.yearsInBands ?? '')
  );

  const [vibe, setVibe] = useState({ color: profile.vibeColor, name: profile.vibeColorName });

  const toggleInList = <T,>(list: T[], item: T, setter: (v: T[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const toggleSlot = (day: Weekday, slot: TimeSlot) => {
    setSchedule((prev) => {
      const current = prev[day] ?? [];
      const next = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      const updated = { ...prev };
      if (next.length === 0) delete updated[day];
      else updated[day] = next;
      return updated;
    });
  };

  // Valida se é possível salvar a seção atual.
  const canSave = useMemo(() => {
    switch (section) {
      case 'photos':
        return true;
      case 'identity':
        return name.trim().length > 0 && role.trim().length > 0;
      case 'instruments':
        return instruments.length > 0;
      case 'style':
        return genres.length > 0;
      case 'goals':
        return goals.length > 0;
      case 'availability':
        return Object.keys(schedule).length > 0;
      case 'experience':
        return equipment !== undefined;
      case 'vibe':
        return true;
      default:
        return false;
    }
  }, [section, name, role, instruments, genres, goals, schedule, equipment]);

  const handleSave = () => {
    if (!canSave) return;
    switch (section) {
      case 'identity':
        updateProfile({
          name: name.trim(),
          age: Number(age) || 0,
          role: role.trim(),
          location: location.trim(),
        });
        break;
      case 'instruments':
        updateProfile({ instruments, level });
        break;
      case 'style':
        updateProfile({
          genres,
          influences: influencesText
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean),
        });
        break;
      case 'goals':
        updateProfile({ goals });
        break;
      case 'availability':
        updateProfile({ schedule });
        break;
      case 'experience':
        updateProfile({
          equipment,
          bandExperience: { playedLive, recorded, yearsInBands: Number(yearsInBands) || 0 },
        });
        break;
      case 'vibe':
        updateProfile({ vibeColor: vibe.color, vibeColorName: vibe.name, bio: bio.trim() });
        break;
    }
    router.back();
  };

  if (!sectionDef) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seção inválida</Text>
          <View style={styles.headerBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{sectionDef.title}</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {section === 'photos' && <PhotosForm />}
          {section === 'identity' && (
            <IdentityForm
              name={name}
              setName={setName}
              age={age}
              setAge={setAge}
              role={role}
              setRole={setRole}
              location={location}
              setLocation={setLocation}
            />
          )}
          {section === 'instruments' && (
            <InstrumentsForm
              instruments={instruments}
              toggleInstrument={(i) => toggleInList(instruments, i, setInstruments)}
              level={level}
              setLevel={setLevel}
            />
          )}
          {section === 'style' && (
            <StyleForm
              genres={genres}
              toggleGenre={(g) => toggleInList(genres, g, setGenres)}
              influencesText={influencesText}
              setInfluencesText={setInfluencesText}
            />
          )}
          {section === 'goals' && (
            <GoalsForm goals={goals} toggleGoal={(g) => toggleInList(goals, g, setGoals)} />
          )}
          {section === 'availability' && (
            <AvailabilityForm schedule={schedule} toggleSlot={toggleSlot} />
          )}
          {section === 'experience' && (
            <ExperienceForm
              equipment={equipment}
              setEquipment={setEquipment}
              playedLive={playedLive}
              setPlayedLive={setPlayedLive}
              recorded={recorded}
              setRecorded={setRecorded}
              yearsInBands={yearsInBands}
              setYearsInBands={setYearsInBands}
            />
          )}
          {section === 'vibe' && (
            <VibeForm vibe={vibe} setVibe={setVibe} bio={bio} setBio={setBio} />
          )}

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* A seção de fotos salva automaticamente ao enviar, sem botão. */}
        {section !== 'photos' && (
          <View style={styles.footer}>
            <PressableScale
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
                Salvar alterações
              </Text>
            </PressableScale>
          </View>
        )}
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

  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.base,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: Colors.surface },
  saveText: { ...Typography.button, fontSize: 16 },
  saveTextDisabled: { color: Colors.textMuted },
});

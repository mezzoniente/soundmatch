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
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { useProfile, ProfileDraft } from '../src/state/ProfileContext';
import {
  IdentityForm,
  InstrumentsForm,
  StyleForm,
  GoalsForm,
  AvailabilityForm,
  ExperienceForm,
  VibeForm,
} from '../src/components/profile-forms/ProfileSectionForms';
import type {
  Instrument,
  SkillLevel,
  CollabGoal,
  EquipmentLevel,
  AvailabilitySchedule,
  Weekday,
  TimeSlot,
} from '../src/data/mockData';

const STEPS = [
  'Identidade',
  'Instrumentos',
  'Estilo',
  'Objetivos',
  'Disponibilidade',
  'Experiência',
  'Vibe',
] as const;

const STEP_TITLES: { title: string; subtitle: string }[] = [
  { title: 'Vamos criar seu perfil', subtitle: 'Comece com o básico.' },
  { title: 'Quais instrumentos você toca?', subtitle: 'Selecione um ou mais e o seu nível.' },
  { title: 'Seu estilo', subtitle: 'Gêneros e influências que te representam.' },
  { title: 'O que você procura?', subtitle: 'Pode escolher mais de um objetivo.' },
  { title: 'Quando você pode tocar?', subtitle: 'Toque nos turnos disponíveis em cada dia.' },
  { title: 'Equipamento e experiência', subtitle: 'Conta um pouco da sua estrada.' },
  { title: 'Sua vibe', subtitle: 'A cor e a frase que representam sua arte.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, completeOnboarding } = useProfile();

  const [step, setStep] = useState(0);

  // Campos do rascunho, pré-preenchidos com o perfil atual (modo edição ou retomada).
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

  const [vibe, setVibe] = useState<{ color: string; name: string }>({
    color: profile.vibeColor,
    name: profile.vibeColorName,
  });

  // --- Helpers de toggle ---
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
      if (next.length === 0) {
        delete updated[day];
      } else {
        updated[day] = next;
      }
      return updated;
    });
  };

  // --- Validação por passo ---
  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return name.trim().length > 0 && age.trim().length > 0 && role.trim().length > 0;
      case 1:
        return instruments.length > 0;
      case 2:
        return genres.length > 0;
      case 3:
        return goals.length > 0;
      case 4:
        return Object.keys(schedule).length > 0;
      case 5:
        return equipment !== undefined;
      case 6:
        return true;
      default:
        return false;
    }
  }, [step, name, age, role, instruments, genres, goals, schedule, equipment]);

  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLastStep) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    // No primeiro passo não há para onde voltar: o onboarding é o fluxo
    // obrigatório de criação do perfil logo após o cadastro.
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const finish = () => {
    const draft: ProfileDraft = {
      name: name.trim(),
      age: Number(age) || 0,
      role: role.trim(),
      instruments,
      level,
      genres,
      influences: influencesText
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      location: location.trim(),
      schedule,
      goals,
      equipment,
      bandExperience: {
        playedLive,
        recorded,
        yearsInBands: Number(yearsInBands) || 0,
      },
      softSkills: profile.softSkills,
      mediaSamples: profile.mediaSamples,
      bio: bio.trim(),
      vibeColor: vibe.color,
      vibeColorName: vibe.name,
    };
    completeOnboarding(draft);
    router.replace('/(tabs)/profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header + progresso */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            disabled={step === 0}
          >
            <Text style={[styles.backIcon, step === 0 && styles.backIconHidden]}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.stepLabel}>
            {step + 1} / {STEPS.length} · {STEPS[step]}
          </Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.stepTitleWrap}>
            <Text style={styles.stepTitle}>{STEP_TITLES[step].title}</Text>
            <Text style={styles.stepSubtitle}>{STEP_TITLES[step].subtitle}</Text>
          </View>

          {step === 0 && (
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

          {step === 1 && (
            <InstrumentsForm
              instruments={instruments}
              toggleInstrument={(i) => toggleInList(instruments, i, setInstruments)}
              level={level}
              setLevel={setLevel}
            />
          )}

          {step === 2 && (
            <StyleForm
              genres={genres}
              toggleGenre={(g) => toggleInList(genres, g, setGenres)}
              influencesText={influencesText}
              setInfluencesText={setInfluencesText}
            />
          )}

          {step === 3 && (
            <GoalsForm goals={goals} toggleGoal={(g) => toggleInList(goals, g, setGoals)} />
          )}

          {step === 4 && <AvailabilityForm schedule={schedule} toggleSlot={toggleSlot} />}

          {step === 5 && (
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

          {step === 6 && <VibeForm vibe={vibe} setVibe={setVibe} bio={bio} setBio={setBio} />}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, !canAdvance && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canAdvance}
          >
            <Text style={[styles.nextText, !canAdvance && styles.nextTextDisabled]}>
              {isLastStep ? 'Concluir perfil' : 'Continuar'}
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 30, color: Colors.textPrimary, lineHeight: 30 },
  backIconHidden: { opacity: 0 },
  stepLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

  progressTrack: {
    height: 4,
    backgroundColor: Colors.bgCard,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: Colors.teal, borderRadius: 2 },

  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 32 },

  stepTitleWrap: { marginBottom: 16, marginTop: 8 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  stepSubtitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 6 },

  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  nextBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: Colors.bgCard },
  nextText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
  nextTextDisabled: { color: Colors.textMuted },
});

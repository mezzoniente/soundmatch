import React, { useRef, ComponentRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Spacing, Radius, Elevation } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { paletteFromVibe } from '../../src/lib/adaptiveColor';
import { GlassView } from '../../src/components/GlassView';
import { Icon } from '../../src/components/Icon';
import { useProfile } from '../../src/state/ProfileContext';
import { useAuth } from '../../src/state/AuthContext';
import {
  AvailabilityGrid,
  EquipmentSection,
  BandExperienceSection,
  SoftSkillsSection,
} from '../../src/components/ProfileSections';
import { MediaSamplesSection } from '../../src/components/MediaSamplesSection';
import { CompletenessCard } from '../../src/components/CompletenessCard';
import { evaluateCompleteness } from '../../src/lib/profileCompleteness';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { isVerified } from '../../src/lib/trust';

const { width: W } = Dimensions.get('window');
const WIDGET_HALF = (W - Spacing.xl * 2 - Spacing.sm) / 2;

export default function MyProfileScreen() {
  const router = useRouter();
  const { profile: p, addMediaSample, removeMediaSample } = useProfile();
  const { signOut } = useAuth();
  const completeness = evaluateCompleteness(p);

  // Alvo de blur do hero (capa + scrims) para o blur real no Android.
  const heroBlurTarget = useRef<ComponentRef<typeof View> | null>(null);

  // Paleta adaptativa derivada da vibe do artista — tinge o hero e os realces.
  const palette = paletteFromVibe(p.vibeColor);

  const handleSignOut = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          {/* Camada desfocável: capa + scrims + tingimento adaptativo da vibe */}
          <BlurTargetView ref={heroBlurTarget} style={StyleSheet.absoluteFill}>
            <Image source={{ uri: p.coverImage }} style={styles.heroCover} resizeMode="cover" />
            <View style={styles.heroScrimTop} />
            <View style={styles.heroScrimBottom} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.tintedBg }]} />
          </BlurTargetView>

          {/* Top bar — controles com blur de vidro real */}
          <View style={styles.heroTopBar}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/edit-profile')}>
              <GlassView
                variant="blur"
                intensity={75}
                blurTarget={heroBlurTarget}
                radius={Radius.pill}
                style={styles.glassPill}
              >
                <Text style={styles.glassPillText}>Editar perfil</Text>
              </GlassView>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <GlassView
                variant="blur"
                intensity={75}
                blurTarget={heroBlurTarget}
                radius={Radius.pill}
                style={styles.glassCircle}
              >
                <Icon name="power" size={18} color={Colors.textPrimary} />
              </GlassView>
            </TouchableOpacity>
          </View>

          {/* Avatar + connections */}
          <View style={styles.heroMid}>
            <View style={[styles.avatarHalo, { backgroundColor: palette.halo }]}>
              <Image
                source={{ uri: p.avatar }}
                style={[styles.heroAvatar, { borderColor: palette.base }]}
              />
            </View>
            <GlassView
              variant="blur"
              intensity={75}
              blurTarget={heroBlurTarget}
              radius={Radius.pill}
              style={styles.connectionsBadge}
            >
              <Text style={styles.connectionsText}>{p.connections} conexões</Text>
            </GlassView>
            <View style={styles.socialsRow}>
              {p.socials.instagram && (
                <Icon name="logo-instagram" size={20} color={Colors.textSecondary} />
              )}
              {p.socials.youtube && (
                <Icon name="logo-youtube" size={20} color={Colors.textSecondary} />
              )}
              {p.socials.spotify && (
                <Icon name="musical-notes" size={20} color={Colors.textSecondary} />
              )}
            </View>
          </View>

          {/* Name */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroName}>{p.name}</Text>
            <View style={styles.roleBadgeRow}>
              <GlassView
                variant="blur"
                intensity={75}
                blurTarget={heroBlurTarget}
                radius={Radius.pill}
                style={styles.roleBadge}
              >
                <Text style={styles.roleText}>{p.role}</Text>
              </GlassView>
              {isVerified(p) && <VerifiedBadge />}
            </View>
          </View>
        </View>

        {/* Completude do perfil (gamificação do cold start) */}
        <CompletenessCard result={completeness} />

        {/* Plano de assinatura */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.85} onPress={() => router.push('/upgrade')}>
          {p.plan === 'pro' && (
            <Icon name="trophy" size={22} color={Colors.accent} style={styles.planIcon} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.planTitle}>
              {p.plan === 'pro' ? 'SoundMatch Pro' : 'Plano gratuito'}
            </Text>
            <Text style={styles.planSubtitle}>
              {p.plan === 'pro'
                ? 'Recomendações ilimitadas e destaque no feed'
                : 'Assine o Pro para swipes ilimitados'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={22} color={Colors.accent} />
        </TouchableOpacity>

        {/* Traits grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERFIL ARTÍSTICO</Text>

          <View style={styles.widgetGrid}>
            {/* Instrument widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Icon
                name={p.instruments[0] === 'Voz' ? 'mic' : 'musical-notes'}
                size={26}
                color={Colors.accent}
                style={styles.widgetIcon}
              />
              <Text style={styles.widgetLabel}>{p.instruments.join(', ')}</Text>
            </View>

            {/* Age widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetBigNumber}>{p.age}</Text>
              <Text style={styles.widgetLabel}>anos</Text>
            </View>

            {/* Vibe color widget */}
            <View style={[styles.widget, { width: WIDGET_HALF, backgroundColor: p.vibeColor }]}>
              <Text style={styles.widgetColorCode}>#{p.vibeColor.slice(1)}</Text>
              <Text style={[styles.widgetLabel, { color: 'rgba(255,255,255,0.85)' }]}>
                {p.vibeColorName}
              </Text>
            </View>

            {/* Level widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Icon name="star" size={26} color={Colors.warning} style={styles.widgetIcon} />
              <Text style={styles.widgetTiny}>{p.level}</Text>
            </View>

            {/* Genre widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Icon name="disc" size={26} color={Colors.accent} style={styles.widgetIcon} />
              <Text style={styles.widgetLabel}>{p.genres[0]}</Text>
              {p.genres[1] && <Text style={styles.widgetSubLabel}>{p.genres[1]}</Text>}
            </View>

            {/* Goal widget */}
            <View style={[styles.widget, { width: WIDGET_HALF, backgroundColor: Colors.elevated }]}>
              <Icon name="flag" size={26} color={Colors.accent} style={styles.widgetIcon} />
              <Text style={styles.widgetTiny}>{p.goals.join(' · ')}</Text>
            </View>

            {/* Fav album widget */}
            <View style={[styles.widget, styles.albumWidget, { width: WIDGET_HALF }]}>
              <Image source={{ uri: p.favAlbumCover }} style={styles.albumCover} />
              <View style={styles.albumOverlay} />
              <Text style={styles.albumTitle}>{p.favAlbum}</Text>
            </View>

            {/* Location widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Icon name="location" size={26} color={Colors.accent} style={styles.widgetIcon} />
              <Text style={styles.widgetTiny}>{p.location}</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BIO</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{p.bio}</Text>
          </View>
        </View>

        {/* Influences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFLUÊNCIAS</Text>
          <View style={styles.tagsRow}>
            {p.influences.map((inf) => (
              <View key={inf} style={styles.influenceTag}>
                <Text style={styles.influenceText}>{inf}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Availability (grade visual) */}
        <AvailabilityGrid schedule={p.schedule} />

        {/* Equipment */}
        <EquipmentSection equipment={p.equipment} />

        {/* Band experience */}
        <BandExperienceSection experience={p.bandExperience} />

        {/* Soft skills */}
        <SoftSkillsSection skills={p.softSkills} />

        {/* Media samples (editável) */}
        <MediaSamplesSection
          samples={p.mediaSamples ?? []}
          onAdd={addMediaSample}
          onRemove={removeMediaSample}
        />

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },

  // Hero
  heroSection: { height: 470, position: 'relative' },
  heroCover: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroScrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(8, 11, 20, 0.45)',
  },
  heroScrimBottom: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 11, 20, 0.35)',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  // Glass controls (raio/borda/overflow vêm do GlassView)
  glassPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  glassPillText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  glassCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },


  heroMid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  avatarHalo: {
    width: 88,
    height: 88,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatar: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    borderWidth: 3,
  },
  connectionsBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  connectionsText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  socialsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },

  heroBottom: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
    gap: Spacing.sm + 2,
  },
  heroName: {
    ...Typography.display,
    fontSize: 46,
    lineHeight: 50,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  roleBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  roleText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },

  // Plano
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
    ...Elevation.sm,
  },
  planIcon: { marginRight: Spacing.md },
  planTitle: { ...Typography.h3, fontSize: 16 },
  planSubtitle: { ...Typography.caption, marginTop: 2 },

  // Sections
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionLabel: { ...Typography.label, marginBottom: Spacing.md },

  // Widgets grid
  widgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  widget: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 96,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  widgetIcon: { marginBottom: Spacing.xs },
  widgetBigNumber: { ...Typography.display, fontSize: 40, lineHeight: 42 },
  widgetLabel: { ...Typography.bodyStrong, fontSize: 13, marginTop: 2 },
  widgetSubLabel: { ...Typography.caption, fontSize: 11, marginTop: 1 },
  widgetTiny: { ...Typography.bodyStrong, fontSize: 12, marginTop: 2 },
  widgetColorCode: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },

  albumWidget: { padding: 0, overflow: 'hidden' },
  albumCover: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  albumOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,11,20,0.45)' },
  albumTitle: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    ...Typography.bodyStrong,
    fontSize: 13,
  },

  // Bio
  bioCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioText: { ...Typography.body, color: Colors.textSecondary },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  influenceTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  influenceText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '500' },
});

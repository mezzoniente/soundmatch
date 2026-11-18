import React, { useMemo } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_ARTISTS, MOCK_REVIEWS } from '../../src/data/mockData';
import { Colors } from '../../src/constants/colors';
import { Spacing, Radius, Elevation } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon } from '../../src/components/Icon';
import { GlassView } from '../../src/components/GlassView';
import { PressableScale } from '../../src/components/PressableScale';
import { paletteFromVibe } from '../../src/lib/adaptiveColor';
import { useProfile } from '../../src/state/ProfileContext';
import { computeMatch } from '../../src/lib/matchEngine';
import { MatchBreakdown } from '../../src/components/MatchBreakdown';
import {
  AvailabilityGrid,
  EquipmentSection,
  BandExperienceSection,
  SoftSkillsSection,
} from '../../src/components/ProfileSections';
import { MediaSamplesSection } from '../../src/components/MediaSamplesSection';
import { ReviewsSection } from '../../src/components/ReviewsSection';
import { CollaborationsSection } from '../../src/components/CollaborationsSection';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { isVerified, collaborationsFromReviews } from '../../src/lib/trust';

const { width: W } = Dimensions.get('window');
const WIDGET_HALF = (W - Spacing.xl * 2 - Spacing.sm) / 2;

const GOAL_COLORS: Record<string, string> = {
  'Banda Fixa': Colors.accent,
  'Colaboração Pontual': Colors.blue,
  'Jam Session': Colors.warning,
  'Trabalho Remunerado': Colors.success,
  'Substituição Temporária': '#E67E22',
};

export default function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile: me } = useProfile();
  const baseArtist = MOCK_ARTISTS.find((a) => a.id === id);

  // Recalcula a compatibilidade com o motor real, em vez dos valores do mock.
  const match = useMemo(
    () => (baseArtist ? computeMatch(me, baseArtist) : undefined),
    [baseArtist, me]
  );
  const artist = useMemo(() => {
    if (!baseArtist || !match) return undefined;
    return { ...baseArtist, matchScore: match.score, matchReasons: match.topReasons };
  }, [baseArtist, match]);

  if (!artist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Artista não encontrado</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const verified = isVerified(artist);
  const reviews = MOCK_REVIEWS[artist.id] ?? [];
  const palette = paletteFromVibe(artist.vibeColor);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero: cover + scrim em camadas + tingimento adaptativo. Tudo dentro
            do hero fica empilhado numa coluna só, sem posicionamento absoluto
            concorrente — evita a sobreposição anterior. */}
        <View style={styles.heroSection}>
          <Image source={{ uri: artist.coverImage }} style={styles.heroCover} resizeMode="cover" />
          <View style={styles.heroScrimTop} />
          <View style={styles.heroScrimBottom} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.tintedBg }]} />

          {/* Top actions — glass real */}
          <View style={styles.heroTopBar}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()}>
              <GlassView intensity={60} radius={Radius.pill} style={styles.circleBtn}>
                <Icon name="chevron-back" size={22} color={Colors.textPrimary} />
              </GlassView>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85}>
              <GlassView intensity={60} radius={Radius.pill} style={styles.circleBtn}>
                <Icon name="ellipsis-horizontal" size={18} color={Colors.textPrimary} />
              </GlassView>
            </TouchableOpacity>
          </View>

          {/* Avatar com halo adaptativo */}
          <View style={styles.heroCenter}>
            <View style={[styles.avatarHalo, { backgroundColor: palette.halo }]}>
              <Image
                source={{ uri: artist.avatar }}
                style={[styles.heroAvatar, { borderColor: palette.base }]}
              />
            </View>

            <View style={styles.nameRow}>
              <Text style={styles.heroNameText}>{artist.name}</Text>
              {verified && <VerifiedBadge compact />}
            </View>
            <Text style={styles.heroRole}>{artist.role}</Text>

            {/* Conexões + socials, numa linha só, com glass */}
            <View style={styles.heroSubRow}>
              <GlassView intensity={60} radius={Radius.pill} style={styles.connectionsBadge}>
                <Text style={styles.connectionsText}>{artist.connections} conexões</Text>
              </GlassView>
              <View style={styles.socialsRow}>
                {artist.socials.instagram && (
                  <Icon name="logo-instagram" size={20} color={Colors.textSecondary} />
                )}
                {artist.socials.youtube && (
                  <Icon name="logo-youtube" size={20} color={Colors.textSecondary} />
                )}
                {artist.socials.spotify && (
                  <Icon name="musical-notes" size={20} color={Colors.textSecondary} />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Match score */}
        {match && (
          <View style={styles.matchWrapper}>
            <MatchBreakdown result={match} />
          </View>
        )}

        {/* Info traits grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERFIL ARTÍSTICO</Text>
          <View style={styles.widgetGrid}>
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Icon
                name={artist.instruments[0] === 'Voz' ? 'mic' : 'musical-notes'}
                size={26}
                color={Colors.accent}
                style={styles.widgetIcon}
              />
              <Text style={styles.widgetLabel}>{artist.instruments.join(', ')}</Text>
            </View>
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetBigNumber}>{artist.age}</Text>
              <Text style={styles.widgetLabel}>anos</Text>
            </View>
            <View style={[styles.widget, { width: WIDGET_HALF, backgroundColor: artist.vibeColor }]}>
              <Text style={styles.widgetColorCode}>#{artist.vibeColor.slice(1)}</Text>
              <Text style={[styles.widgetLabel, { color: '#ffffffcc' }]}>{artist.vibeColorName}</Text>
            </View>
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Icon name="star" size={26} color={Colors.warning} style={styles.widgetIcon} />
              <Text style={styles.widgetTiny}>{artist.level}</Text>
            </View>
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Icon name="disc" size={26} color={Colors.accent} style={styles.widgetIcon} />
              <Text style={styles.widgetLabel}>{artist.genres[0]}</Text>
              {artist.genres[1] && <Text style={styles.widgetSub}>{artist.genres[1]}</Text>}
            </View>
            <View style={[styles.widget, styles.albumWidget, { width: WIDGET_HALF }]}>
              <Image source={{ uri: artist.favAlbumCover }} style={styles.albumCover} />
              <View style={styles.albumOverlay} />
              <Text style={styles.albumTitle}>{artist.favAlbum}</Text>
            </View>
          </View>
        </View>

        {/* Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {artist.goals.length > 1 ? 'OBJETIVOS' : 'OBJETIVO'}
          </Text>
          <View style={styles.tagsRow}>
            {artist.goals.map((goal) => (
              <View
                key={goal}
                style={[
                  styles.goalBadge,
                  { backgroundColor: GOAL_COLORS[goal] ?? Colors.accent },
                ]}
              >
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BIO</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{artist.bio}</Text>
          </View>
        </View>

        {/* Influences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFLUÊNCIAS</Text>
          <View style={styles.tagsRow}>
            {artist.influences.map((inf) => (
              <View key={inf} style={styles.tag}>
                <Text style={styles.tagText}>{inf}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LOCALIZAÇÃO</Text>
          <View style={styles.locationCard}>
            <Icon name="location" size={18} color={Colors.accent} />
            <Text style={styles.locationText}>{artist.location}</Text>
          </View>
        </View>

        {/* Availability (grade visual) */}
        <AvailabilityGrid schedule={artist.schedule} />

        {/* Equipment */}
        <EquipmentSection equipment={artist.equipment} />

        {/* Band experience */}
        <BandExperienceSection experience={artist.bandExperience} />

        {/* Soft skills */}
        <SoftSkillsSection skills={artist.softSkills} />

        {/* Media samples (somente leitura) */}
        <MediaSamplesSection samples={artist.mediaSamples ?? []} />

        {/* Avaliações / reputação */}
        <ReviewsSection
          ratingAvg={artist.ratingAvg ?? 0}
          ratingCount={artist.ratingCount ?? 0}
          reviews={reviews}
          onAddReview={() => router.push(`/review/${artist.id}`)}
        />

        {/* Histórico de colaborações (derivado das avaliações) */}
        <CollaborationsSection collaborations={collaborationsFromReviews(reviews)} />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.actionsBar}>
        <PressableScale
          style={[styles.actionBtn, styles.passBtn]}
          onPress={() => router.back()}
          activeScale={0.88}
        >
          <Icon name="close" size={26} color={Colors.danger} />
        </PressableScale>
        <PressableScale style={[styles.actionBtn, styles.saveBtn]} activeScale={0.88}>
          <Icon name="bookmark-outline" size={22} color={Colors.textMuted} />
        </PressableScale>
        <PressableScale style={[styles.actionBtn, styles.acceptBtn]} activeScale={0.88}>
          <Icon name="checkmark" size={26} color={Colors.base} />
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  notFoundText: { color: Colors.textPrimary, fontSize: 18 },
  backButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  backButtonText: { color: Colors.base, fontWeight: '700' },

  // Hero empilhado (sem sobreposição): cover de fundo + coluna de conteúdo.
  heroSection: { position: 'relative', paddingBottom: Spacing.lg, minHeight: 360 },
  heroCover: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroScrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(8,11,20,0.4)',
  },
  heroScrimBottom: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,11,20,0.55)',
  },

  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  circleBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCenter: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  avatarHalo: {
    width: 128,
    height: 128,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroAvatar: {
    width: 112,
    height: 112,
    borderRadius: Radius.pill,
    borderWidth: 3,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  heroNameText: {
    ...Typography.display,
    fontSize: 34,
    lineHeight: 38,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroRole: { ...Typography.bodyStrong, color: Colors.textSecondary, marginTop: 2 },

  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  connectionsBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  connectionsText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  socialsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },

  matchWrapper: { margin: Spacing.xl },

  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionLabel: { ...Typography.label, marginBottom: Spacing.md },

  widgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  widget: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 90,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  widgetIcon: { marginBottom: Spacing.xs },
  widgetBigNumber: { ...Typography.display, fontSize: 40, lineHeight: 42 },
  widgetLabel: { ...Typography.bodyStrong, fontSize: 13, marginTop: 2 },
  widgetSub: { ...Typography.caption, fontSize: 11, marginTop: 1 },
  widgetTiny: { ...Typography.bodyStrong, fontSize: 12, marginTop: 2 },
  widgetColorCode: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },

  albumWidget: { padding: 0, overflow: 'hidden' },
  albumCover: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  albumOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,11,20,0.5)' },
  albumTitle: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    ...Typography.bodyStrong,
    fontSize: 13,
  },

  goalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
  },
  goalText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  bioCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '500' },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },

  actionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.md,
  },
  passBtn: { backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.danger },
  saveBtn: { backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.textMuted },
  acceptBtn: { backgroundColor: Colors.accent },
});

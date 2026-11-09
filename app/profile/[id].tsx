import React from 'react';
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
import { MOCK_ARTISTS } from '../../src/data/mockData';
import { Colors } from '../../src/constants/colors';
import {
  AvailabilityGrid,
  EquipmentSection,
  BandExperienceSection,
  SoftSkillsSection,
} from '../../src/components/ProfileSections';
import { MediaSamplesSection } from '../../src/components/MediaSamplesSection';

const { width: W } = Dimensions.get('window');
const WIDGET_HALF = (W - 48) / 2;

const GOAL_COLORS: Record<string, string> = {
  'Banda Fixa': Colors.teal,
  'Colaboração Pontual': Colors.blue,
  'Jam Session': Colors.gold,
  'Trabalho Remunerado': Colors.green,
  'Substituição Temporária': '#E67E22',
};

export default function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const artist = MOCK_ARTISTS.find((a) => a.id === id);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: artist.coverImage }} style={styles.heroCover} resizeMode="cover" />
          <View style={styles.heroOverlay} />

          {/* Top actions */}
          <View style={styles.heroTopBar}>
            <TouchableOpacity style={styles.menuBtn}>
              <Text style={styles.menuBtnText}>⋯</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchText}>🔍  Buscar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <Text style={styles.closeBtnText}>◁</Text>
            </TouchableOpacity>
          </View>

          {/* Name hero */}
          <View style={styles.heroName}>
            <Text style={styles.heroNameText}>{artist.name}</Text>
          </View>

          {/* Photo card */}
          <View style={styles.photoCard}>
            <Image source={{ uri: artist.avatar }} style={styles.photoImage} resizeMode="cover" />
            <View style={styles.photoOverlay} />
            <View style={styles.photoMeta}>
              <Text style={styles.photoRole}>{artist.role}</Text>
            </View>
          </View>

          {/* Connections + socials */}
          <View style={styles.heroSubRow}>
            <View style={styles.connectionsBadge}>
              <Text style={styles.connectionsText}>{artist.connections} Conexões</Text>
            </View>
            <View style={styles.socialsRow}>
              {artist.socials.instagram && <Text style={styles.socialIcon}>📷</Text>}
              {artist.socials.youtube && <Text style={styles.socialIcon}>▶️</Text>}
              {artist.socials.spotify && <Text style={styles.socialIcon}>🎵</Text>}
            </View>
          </View>
        </View>

        {/* Match score */}
        {artist.matchScore !== undefined && (
          <View style={styles.matchSection}>
            <View style={styles.matchScoreCard}>
              <Text style={styles.matchScoreNumber}>{artist.matchScore}%</Text>
              <Text style={styles.matchScoreLabel}>Compatibilidade</Text>
            </View>
            <View style={styles.matchReasons}>
              {artist.matchReasons?.map((r) => (
                <View key={r} style={styles.reasonRow}>
                  <Text style={styles.reasonCheck}>✓</Text>
                  <Text style={styles.reasonText}>{r}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Info traits grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERFIL ARTÍSTICO</Text>
          <View style={styles.widgetGrid}>
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetIcon}>
                {artist.instruments[0] === 'Voz' ? '🎤' : '🎸'}
              </Text>
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
              <Text style={styles.widgetIcon}>⭐</Text>
              <Text style={styles.widgetTiny}>{artist.level}</Text>
            </View>
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetIcon}>🎵</Text>
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
                  { backgroundColor: GOAL_COLORS[goal] ?? Colors.teal },
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
            <Text style={styles.locationIcon}>📍</Text>
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

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={() => router.back()}>
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]}>
          <Text style={styles.actionIcon}>🔖</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
          <Text style={styles.actionIcon}>✓</Text>
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
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { color: Colors.textPrimary, fontSize: 18 },
  backButton: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: { color: Colors.bg, fontWeight: '700' },

  heroSection: { position: 'relative', paddingBottom: 16 },
  heroCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: 'rgba(10,14,26,0.55)',
  },

  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnText: { color: Colors.textPrimary, fontSize: 18 },
  searchBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  searchText: { color: Colors.textSecondary, fontSize: 14 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: Colors.textPrimary, fontSize: 16 },

  heroName: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  heroNameText: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 48,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  photoCard: {
    marginHorizontal: 20,
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  photoImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  photoMeta: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  photoRole: { color: Colors.textPrimary, fontWeight: '600', fontSize: 13 },

  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  connectionsBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectionsText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  socialsRow: { flexDirection: 'row', gap: 10 },
  socialIcon: { fontSize: 20 },

  matchSection: {
    margin: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  matchScoreCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.teal,
    borderRadius: 16,
    padding: 12,
    minWidth: 72,
  },
  matchScoreNumber: { fontSize: 26, fontWeight: '900', color: Colors.bg },
  matchScoreLabel: { fontSize: 10, fontWeight: '700', color: Colors.bg, marginTop: 2 },
  matchReasons: { flex: 1, gap: 6, justifyContent: 'center' },
  reasonRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  reasonCheck: { color: Colors.green, fontWeight: '800', fontSize: 14 },
  reasonText: { color: Colors.textSecondary, fontSize: 13, flex: 1 },

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  widgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  widget: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 16,
    minHeight: 90,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  widgetIcon: { fontSize: 28, marginBottom: 4 },
  widgetBigNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 42,
  },
  widgetLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  widgetSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  widgetTiny: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  widgetColorCode: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },

  albumWidget: { padding: 0, overflow: 'hidden' },
  albumCover: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  albumOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  albumTitle: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  goalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  goalText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  bioCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '500' },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationIcon: { fontSize: 20 },
  locationText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },

  actionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  passBtn: { backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.red },
  saveBtn: { backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.textMuted },
  acceptBtn: { backgroundColor: Colors.teal },
  actionIcon: { fontSize: 22 },
});


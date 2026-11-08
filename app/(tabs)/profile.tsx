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
import { MY_PROFILE } from '../../src/data/mockData';
import { Colors } from '../../src/constants/colors';

const { width: W } = Dimensions.get('window');
const WIDGET_HALF = (W - 48) / 2;
const WIDGET_THIRD = (W - 56) / 3;

export default function MyProfileScreen() {
  const p = MY_PROFILE;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Image source={{ uri: p.coverImage }} style={styles.heroCover} resizeMode="cover" />
          <View style={styles.heroOverlay} />

          {/* Top bar */}
          <View style={styles.heroTopBar}>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn}>
              <Text style={styles.backBtnIcon}>◁</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar + connections */}
          <View style={styles.heroMid}>
            <Image source={{ uri: p.avatar }} style={styles.heroAvatar} />
            <View style={styles.connectionsBadge}>
              <Text style={styles.connectionsText}>{p.connections} Conexões</Text>
            </View>
            <View style={styles.socialsRow}>
              {p.socials.instagram && <Text style={styles.socialIcon}>📷</Text>}
              {p.socials.youtube && <Text style={styles.socialIcon}>▶️</Text>}
              {p.socials.spotify && <Text style={styles.socialIcon}>🎵</Text>}
            </View>
          </View>

          {/* Name */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroName}>{p.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{p.role}</Text>
            </View>
          </View>
        </View>

        {/* Traits grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERFIL ARTÍSTICO</Text>

          <View style={styles.widgetGrid}>
            {/* Instrument widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetIcon}>
                {p.instruments[0] === 'Voz' ? '🎤' : '🎸'}
              </Text>
              <Text style={styles.widgetLabel}>{p.instruments.join(', ')}</Text>
            </View>

            {/* Age widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetBigNumber}>{p.age}</Text>
              <Text style={styles.widgetLabel}>anos</Text>
            </View>

            {/* Vibe color widget */}
            <View
              style={[
                styles.widget,
                { width: WIDGET_HALF * 1.4 + 8, backgroundColor: p.vibeColor },
              ]}
            >
              <Text style={styles.widgetColorCode}>#{p.vibeColor.slice(1)}</Text>
              <Text style={[styles.widgetLabel, { color: '#ffffffcc' }]}>{p.vibeColorName}</Text>
            </View>

            {/* Level widget */}
            <View style={[styles.widget, { width: WIDGET_HALF * 0.6 - 4 }]}>
              <Text style={styles.widgetIcon}>⭐</Text>
              <Text style={styles.widgetTiny}>{p.level}</Text>
            </View>

            {/* Genre widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetIcon}>🎵</Text>
              <Text style={styles.widgetLabel}>{p.genres[0]}</Text>
              {p.genres[1] && (
                <Text style={styles.widgetSubLabel}>{p.genres[1]}</Text>
              )}
            </View>

            {/* Goal widget */}
            <View
              style={[
                styles.widget,
                { width: WIDGET_HALF, backgroundColor: Colors.blueMid },
              ]}
            >
              <Text style={styles.widgetIcon}>🎯</Text>
              <Text style={styles.widgetTiny}>{p.goal}</Text>
            </View>

            {/* Fav album widget */}
            <View style={[styles.widget, styles.albumWidget, { width: WIDGET_HALF }]}>
              <Image source={{ uri: p.favAlbumCover }} style={styles.albumCover} />
              <View style={styles.albumOverlay} />
              <Text style={styles.albumTitle}>{p.favAlbum}</Text>
            </View>

            {/* Location widget */}
            <View style={[styles.widget, { width: WIDGET_HALF }]}>
              <Text style={styles.widgetIcon}>📍</Text>
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

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISPONIBILIDADE</Text>
          <View style={styles.tagsRow}>
            {p.availability.map((a) => (
              <View key={a} style={styles.availTag}>
                <Text style={styles.availText}>🕐 {a}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },

  // Hero
  heroSection: {
    height: 480,
    position: 'relative',
  },
  heroCover: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editBtnText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 13 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnIcon: { color: Colors.textPrimary, fontSize: 16 },

  heroMid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 16,
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.teal,
  },
  connectionsBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectionsText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  socialsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialIcon: { fontSize: 20 },

  heroBottom: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  heroName: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 56,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },

  // Sections
  section: { padding: 20, paddingTop: 24 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 14,
  },

  // Widgets grid
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
    fontSize: 42,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 44,
  },
  widgetLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  widgetSubLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  widgetTiny: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  widgetColorCode: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },

  albumWidget: {
    backgroundColor: Colors.bgCard,
    padding: 0,
    overflow: 'hidden',
  },
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

  // Bio
  bioCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  influenceTag: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  influenceText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '500' },
  availTag: {
    backgroundColor: 'rgba(0, 212, 200, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  availText: { color: Colors.teal, fontSize: 13, fontWeight: '600' },
});

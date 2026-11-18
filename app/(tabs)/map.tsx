import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Spacing, Radius } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon, IconName } from '../../src/components/Icon';
import { MAP_MARKERS } from '../../src/data/mockData';

const SCALES = ['1:500', '1:1000', '1:5000', '1:10000'];

const MARKER_COLORS: Record<string, string> = {
  artist: Colors.accent,
  event: Colors.warning,
  vaga: '#E67E22',
};

const MARKER_ICONS: Record<string, IconName> = {
  artist: 'musical-notes',
  event: 'calendar',
  vaga: 'clipboard',
};

type FilterType = 'all' | 'artist' | 'event' | 'vaga';

export default function MapScreen() {
  const router = useRouter();
  const [scaleIdx, setScaleIdx] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const scale = SCALES[scaleIdx];
  const delta = scaleIdx === 0 ? 0.02 : scaleIdx === 1 ? 0.08 : scaleIdx === 2 ? 0.3 : 1.2;

  const filteredMarkers = MAP_MARKERS.filter(
    (m) => filter === 'all' || m.type === filter
  );

  const selectedMarker = MAP_MARKERS.find((m) => m.id === selected);

  const cycleScale = () => setScaleIdx((prev) => (prev + 1) % SCALES.length);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Mais opções">
          <Icon name="ellipsis-horizontal" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} accessibilityRole="button" accessibilityLabel="Buscar">
          <Icon name="search" size={16} color={Colors.textSecondary} />
          <Text style={styles.searchText}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Configurações do mapa">
          <Icon name="options" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Scale + settings */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.scaleBadge}
          onPress={cycleScale}
          accessibilityRole="button"
          accessibilityLabel={`Escala do mapa: ${scale}. Toque para alternar`}
        >
          <Text style={styles.scaleText}>{scale}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsBtn} accessibilityRole="button" accessibilityLabel="Ajustes">
          <Icon name="settings" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'artist', 'event', 'vaga'] as FilterType[]).map((f) => {
          const active = filter === f;
          const label =
            f === 'all' ? 'Todos' : f === 'artist' ? 'Artistas' : f === 'event' ? 'Eventos' : 'Vagas';
          const contentColor = active ? Colors.base : Colors.textSecondary;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, active && styles.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              {f !== 'all' && (
                <Icon name={MARKER_ICONS[f]} size={13} color={contentColor} />
              )}
              <Text style={[styles.filterText, { color: contentColor }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: -23.561,
            longitude: -46.656,
            latitudeDelta: delta,
            longitudeDelta: delta * 0.6,
          }}
          region={{
            latitude: -23.561,
            longitude: -46.656,
            latitudeDelta: delta,
            longitudeDelta: delta * 0.6,
          }}
          customMapStyle={darkMapStyle}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {filteredMarkers.map((marker) => (
            <React.Fragment key={marker.id}>
              {/* Heatmap-style glow circle */}
              <Circle
                center={{ latitude: marker.lat, longitude: marker.lng }}
                radius={800}
                fillColor={`${MARKER_COLORS[marker.type]}${Math.round(marker.intensity * 40).toString(16).padStart(2, '0')}`}
                strokeColor="transparent"
              />
              <Marker
                coordinate={{ latitude: marker.lat, longitude: marker.lng }}
                onPress={() => setSelected(marker.id)}
              >
                <View
                  style={[
                    styles.markerContainer,
                    { borderColor: MARKER_COLORS[marker.type] },
                    selected === marker.id && styles.markerSelected,
                  ]}
                >
                  <Icon
                    name={MARKER_ICONS[marker.type]}
                    size={16}
                    color={MARKER_COLORS[marker.type]}
                  />
                </View>
              </Marker>
            </React.Fragment>
          ))}
        </MapView>
      </View>

      {/* Selected info popup */}
      {selectedMarker && (
        <View style={styles.popup}>
          <View style={styles.popupLeft}>
            <Icon
              name={MARKER_ICONS[selectedMarker.type]}
              size={22}
              color={MARKER_COLORS[selectedMarker.type]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.popupName}>{selectedMarker.name}</Text>
            <Text style={styles.popupType}>
              {selectedMarker.type === 'artist'
                ? 'Artista'
                : selectedMarker.type === 'event'
                ? 'Evento'
                : 'Vaga'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.popupClose} accessibilityRole="button" accessibilityLabel="Fechar">
            <Icon name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom buttons */}
      <View style={styles.bottomBtns}>
        <TouchableOpacity style={styles.studiosBtn} onPress={() => router.push('/studios')}>
          <Icon name="headset" size={18} color={Colors.base} />
          <Text style={styles.studiosLabel}>Estúdios perto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn} accessibilityRole="button" accessibilityLabel="Centralizar na minha localização">
          <Icon name="locate" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.pill,
  },
  searchText: { ...Typography.body, fontSize: 14, color: Colors.textSecondary },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  scaleBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scaleText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterScroll: { maxHeight: 44, marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterText: { fontSize: 13, fontWeight: '600' },

  mapContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: { flex: 1 },

  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(8,11,20,0.75)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.3 }],
    borderWidth: 3,
  },

  popup: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popupLeft: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupName: { ...Typography.bodyStrong, fontSize: 15 },
  popupType: { ...Typography.caption, fontSize: 12, marginTop: 2 },
  popupClose: { padding: Spacing.xs },

  bottomBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  bottomBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studiosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 52,
    paddingHorizontal: Spacing.lg + 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
  },
  studiosLabel: { color: Colors.base, fontSize: 14, fontWeight: '800' },
});

// Dark map style matching the app theme
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a0e1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8899bb' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0e1a' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#1e2d45' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1c2333' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1e3a5f' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#00d4c8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0d1b2a' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'simplified' }],
  },
];

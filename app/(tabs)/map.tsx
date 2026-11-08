import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '../../src/constants/colors';
import { MAP_MARKERS } from '../../src/data/mockData';

const { width: W } = Dimensions.get('window');

const SCALES = ['1:500', '1:1000', '1:5000', '1:10000'];

const MARKER_COLORS: Record<string, string> = {
  artist: Colors.teal,
  event: Colors.gold,
  vaga: '#E67E22',
};

const MARKER_ICONS: Record<string, string> = {
  artist: '🎸',
  event: '🎤',
  vaga: '📋',
};

type FilterType = 'all' | 'artist' | 'event' | 'vaga';

export default function MapScreen() {
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
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={styles.headerIcon}>⋯</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchText}>🔍  Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={styles.headerIcon}>◁</Text>
        </TouchableOpacity>
      </View>

      {/* Scale + settings */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.scaleBadge} onPress={cycleScale}>
          <Text style={styles.scaleText}>{scale}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'artist', 'event', 'vaga'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Todos' : f === 'artist' ? '🎸 Artistas' : f === 'event' ? '🎤 Eventos' : '📋 Vagas'}
            </Text>
          </TouchableOpacity>
        ))}
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
                  <Text style={styles.markerIcon}>{MARKER_ICONS[marker.type]}</Text>
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
            <Text style={styles.popupIcon}>{MARKER_ICONS[selectedMarker.type]}</Text>
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
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.popupClose}>
            <Text style={styles.popupCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom buttons */}
      <View style={styles.bottomBtns}>
        <TouchableOpacity style={styles.bottomBtn}>
          <Text style={styles.bottomBtnIcon}>⚓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn}>
          <Text style={styles.bottomBtnIcon}>📍</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 18, color: Colors.textPrimary },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  searchText: { color: Colors.textSecondary, fontSize: 14 },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  scaleBadge: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scaleText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 18 },

  filterScroll: { maxHeight: 44, marginBottom: 8 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.bg },

  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: { flex: 1 },

  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.3 }],
    borderWidth: 3,
  },
  markerIcon: { fontSize: 16 },

  popup: {
    margin: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popupLeft: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupIcon: { fontSize: 22 },
  popupName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  popupType: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  popupClose: { padding: 4 },
  popupCloseText: { color: Colors.textSecondary, fontSize: 18 },

  bottomBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  bottomBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomBtnIcon: { fontSize: 22 },
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

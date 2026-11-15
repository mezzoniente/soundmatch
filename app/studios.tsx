import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { useProfile } from '../src/state/ProfileContext';
import { rankStudiosByProximity } from '../src/lib/matchEngine';
import { MOCK_STUDIOS, type Studio } from '../src/data/mockData';

function StudioCard({ studio }: { studio: Studio }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: studio.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.kindBadge}>
            <Text style={styles.kindText}>{studio.kind}</Text>
          </View>
          {studio.distanceKm !== undefined && (
            <Text style={styles.distance}>
              {studio.distanceKm < 1 ? 'pertinho' : `${Math.round(studio.distanceKm)} km`}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{studio.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {studio.description}
        </Text>
        <Text style={styles.address}>📍 {studio.address}</Text>
        <View style={styles.amenitiesRow}>
          {studio.amenities.map((a) => (
            <View key={a} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.price}>{studio.price}</Text>
      </View>
    </View>
  );
}

export default function StudiosScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const studios = useMemo(() => rankStudiosByProximity(profile, MOCK_STUDIOS), [profile]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estúdios e espaços</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Parceiros perto de você para ensaiar e gravar.</Text>
        {studios.map((s) => (
          <StudioCard key={s.id} studio={s} />
        ))}
        <View style={{ height: 24 }} />
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
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginBottom: 16 },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  image: { width: '100%', height: 140 },
  body: { padding: 14, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kindBadge: { backgroundColor: Colors.blueMid, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  kindText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  distance: { color: Colors.teal, fontSize: 13, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  address: { color: Colors.textSecondary, fontSize: 13 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityTag: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: { color: Colors.textSecondary, fontSize: 12 },
  price: { color: Colors.teal, fontSize: 15, fontWeight: '800', marginTop: 2 },
});

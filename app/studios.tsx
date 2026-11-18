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
import { Spacing, Radius } from '../src/constants/theme';
import { Typography } from '../src/constants/typography';
import { Icon } from '../src/components/Icon';
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
        <View style={styles.addressRow}>
          <Icon name="location" size={13} color={Colors.textSecondary} />
          <Text style={styles.address}>{studio.address}</Text>
        </View>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Voltar">
          <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
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
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md + 2,
  },
  image: { width: '100%', height: 140 },
  body: { padding: Spacing.md + 2, gap: Spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kindBadge: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  kindText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  distance: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  name: { ...Typography.h3, fontSize: 18 },
  description: { ...Typography.body, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  address: { color: Colors.textSecondary, fontSize: 13 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs + 2 },
  amenityTag: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm - 2,
  },
  amenityText: { color: Colors.textSecondary, fontSize: 12 },
  price: { color: Colors.accent, fontSize: 15, fontWeight: '800', marginTop: 2 },
});

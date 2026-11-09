import React from 'react';
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
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useProfile } from '../../src/state/ProfileContext';
import { EDIT_SECTIONS } from '../../src/constants/editSections';

export default function EditProfileHub() {
  const router = useRouter();
  const { profile } = useProfile();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Escolha o que deseja atualizar.</Text>

        {EDIT_SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => router.push(`/edit-profile/${section.key}`)}
          >
            <Text style={styles.rowIcon}>{section.icon}</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{section.title}</Text>
              <Text style={styles.rowPreview} numberOfLines={1}>
                {section.preview(profile)}
              </Text>
            </View>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowIcon: { fontSize: 24 },
  rowInfo: { flex: 1 },
  rowTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  rowPreview: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  rowChevron: { color: Colors.textMuted, fontSize: 26, fontWeight: '300' },
});

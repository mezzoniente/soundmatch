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
import { Spacing, Radius } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon } from '../../src/components/Icon';
import { PressableScale } from '../../src/components/PressableScale';
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
          <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Escolha o que deseja atualizar.</Text>

        {EDIT_SECTIONS.map((section) => (
          <PressableScale
            key={section.key}
            style={styles.row}
            activeScale={0.98}
            onPress={() => router.push(`/edit-profile/${section.key}`)}
          >
            <View style={styles.rowIconWrap}>
              <Icon name={section.icon} size={20} color={Colors.accent} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{section.title}</Text>
              <Text style={styles.rowPreview} numberOfLines={1}>
                {section.preview(profile)}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
          </PressableScale>
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md + 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowTitle: { ...Typography.h3, fontSize: 16 },
  rowPreview: { ...Typography.caption, fontSize: 13, marginTop: 2 },
});

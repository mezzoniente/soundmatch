import React, { useState } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Spacing, Radius } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon } from '../../src/components/Icon';
import { MOCK_JAMS, MOCK_DMS, JamRoom, DMConversation } from '../../src/data/mockData';

function JamCard({ jam, onPress }: { jam: JamRoom; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.conversationCard} activeOpacity={0.8} onPress={onPress}>
      <Image source={{ uri: jam.cover }} style={styles.conversationCover} />
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {jam.name}
          </Text>
          <Text style={styles.conversationTime}>{jam.time}</Text>
        </View>
        {/* Participants */}
        <View style={styles.participantsRow}>
          {jam.participants.slice(0, 3).map((p, i) => (
            <Image
              key={p.name}
              source={{ uri: p.avatar }}
              style={[styles.participantAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i }]}
            />
          ))}
        </View>
        <Text style={styles.conversationLast} numberOfLines={1}>
          <Text style={styles.conversationSender}>{jam.lastSender}: </Text>
          {jam.lastMessage}
        </Text>
      </View>
      <View style={styles.conversationMeta}>
        {jam.unread && jam.unread > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{jam.unread}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function DMCard({ dm, onPress }: { dm: DMConversation; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.conversationCard} activeOpacity={0.8} onPress={onPress}>
      <Image source={{ uri: dm.avatar }} style={styles.dmAvatar} />
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {dm.name}
          </Text>
          <Text style={styles.conversationTime}>{dm.time}</Text>
        </View>
        <Text style={styles.conversationLast} numberOfLines={1}>
          {dm.lastMessage}
        </Text>
      </View>
      <View style={styles.conversationMeta}>
        {dm.unread && dm.unread > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{dm.unread}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJams = MOCK_JAMS.filter((j) =>
    j.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDMs = MOCK_DMS.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Mais opções">
            <Icon name="ellipsis-horizontal" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Nova conversa">
            <Icon name="create-outline" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversa..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* JAMS section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>JAMS</Text>
            <TouchableOpacity style={styles.newBtn}>
              <Icon name="add" size={14} color={Colors.base} />
              <Text style={styles.newBtnText}>Nova Jam</Text>
            </TouchableOpacity>
          </View>

          {filteredJams.length > 0 ? (
            filteredJams.map((jam) => (
              <JamCard key={jam.id} jam={jam} onPress={() => router.push(`/chat/${jam.id}`)} />
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma jam encontrada</Text>
          )}

          {/* DMs section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>DMs</Text>
          </View>

          {filteredDMs.length > 0 ? (
            filteredDMs.map((dm) => (
              <DMCard key={dm.id} dm={dm} onPress={() => router.push(`/chat/${dm.id}`)} />
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma DM encontrada</Text>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { ...Typography.h3, fontSize: 18 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.textPrimary,
    fontSize: 15,
  },

  scrollContent: { paddingHorizontal: Spacing.xl },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.label, fontSize: 13, color: Colors.textSecondary },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
  },
  newBtnText: { ...Typography.bodyStrong, fontSize: 12, color: Colors.base },

  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conversationCover: {
    width: 58,
    height: 58,
    borderRadius: Radius.md,
    marginRight: Spacing.md,
  },
  dmAvatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.pill,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  conversationInfo: { flex: 1 },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  conversationName: {
    ...Typography.bodyStrong,
    flex: 1,
    marginRight: Spacing.sm,
  },
  conversationTime: { ...Typography.caption, fontSize: 12 },
  participantsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  participantAvatar: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.base,
  },
  conversationLast: {
    ...Typography.caption,
    fontSize: 13,
  },
  conversationSender: {
    fontWeight: '600',
    color: Colors.textMuted,
  },
  conversationMeta: {
    marginLeft: Spacing.sm,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: Colors.base, fontSize: 11, fontWeight: '800' },

  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.lg,
    fontSize: 14,
  },
});

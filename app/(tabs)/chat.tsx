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
import { Colors } from '../../src/constants/colors';
import { MOCK_JAMS, MOCK_DMS, JamRoom, DMConversation } from '../../src/data/mockData';

function JamCard({ jam }: { jam: JamRoom }) {
  return (
    <TouchableOpacity style={styles.conversationCard} activeOpacity={0.8}>
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

function DMCard({ dm }: { dm: DMConversation }) {
  return (
    <TouchableOpacity style={styles.conversationCard} activeOpacity={0.8}>
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
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerIcon}>⋯</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
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
              <Text style={styles.newBtnText}>+ Nova Jam</Text>
            </TouchableOpacity>
          </View>

          {filteredJams.length > 0 ? (
            filteredJams.map((jam) => <JamCard key={jam.id} jam={jam} />)
          ) : (
            <Text style={styles.emptyText}>Nenhuma jam encontrada</Text>
          )}

          {/* DMs section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>DMs</Text>
          </View>

          {filteredDMs.length > 0 ? (
            filteredDMs.map((dm) => <DMCard key={dm.id} dm={dm} />)
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.textPrimary,
    fontSize: 15,
  },

  scrollContent: { paddingHorizontal: 20 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  newBtn: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  newBtnText: { color: Colors.bg, fontWeight: '700', fontSize: 12 },

  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conversationCover: {
    width: 58,
    height: 58,
    borderRadius: 12,
    marginRight: 12,
  },
  dmAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.teal,
  },
  conversationInfo: { flex: 1 },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  conversationTime: { fontSize: 12, color: Colors.textSecondary },
  participantsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  participantAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.bg,
  },
  conversationLast: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  conversationSender: {
    fontWeight: '600',
    color: Colors.textMuted,
  },
  conversationMeta: {
    marginLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  unreadBadge: {
    backgroundColor: Colors.teal,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: Colors.bg, fontSize: 11, fontWeight: '800' },

  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
});

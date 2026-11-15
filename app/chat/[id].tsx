import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { MessageBubble } from '../../src/components/MessageBubble';
import { MOCK_DMS, MOCK_JAMS, MOCK_MESSAGES, type ChatMessage } from '../../src/data/mockData';

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Resolve o título e avatar a partir dos mocks de DM/Jam.
  const dm = MOCK_DMS.find((d) => d.id === id);
  const jam = MOCK_JAMS.find((j) => j.id === id);
  const title = dm?.name ?? jam?.name ?? 'Conversa';
  const subtitle = jam ? `${jam.participants.length} participante(s)` : undefined;

  const [messages, setMessages] = useState<ChatMessage[]>(
    // Mensagens mais recentes embaixo; FlatList invertida renderiza do fim p/ o topo.
    [...(MOCK_MESSAGES[id ?? ''] ?? [])].reverse()
  );
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const message: ChatMessage = {
      id: `local-${Date.now()}`,
      senderId: 'me',
      senderName: 'Você',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [message, ...prev]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          {dm ? (
            <Image source={{ uri: dm.avatar }} style={styles.headerAvatar} />
          ) : jam ? (
            <Image source={{ uri: jam.cover }} style={styles.headerAvatarSquare} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {/* Mensagens */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMine={item.senderId === 'me'} showSender={Boolean(jam)} />
          )}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem..."
            placeholderTextColor={Colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
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
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 30, color: Colors.textPrimary, lineHeight: 30 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19 },
  headerAvatarSquare: { width: 38, height: 38, borderRadius: 10 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  messagesList: { padding: 16, gap: 8 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.bgCard },
  sendIcon: { color: Colors.bg, fontSize: 18, fontWeight: '900' },
});

import React, { useState, useRef, useEffect } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../src/constants/colors';
import { MessageBubble } from '../../src/components/MessageBubble';
import { useAuth } from '../../src/state/AuthContext';
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
} from '../../src/lib/messagesRepository';
import { notifyLocal } from '../../src/lib/notifications';
import {
  MOCK_DMS,
  MOCK_JAMS,
  MOCK_MESSAGES,
  type ChatMessage,
  type MessageAudio,
} from '../../src/data/mockData';

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const conversationId = id ?? '';

  // Resolve o título e avatar a partir dos mocks de DM/Jam.
  const dm = MOCK_DMS.find((d) => d.id === id);
  const jam = MOCK_JAMS.find((j) => j.id === id);
  const title = dm?.name ?? jam?.name ?? 'Conversa';
  const subtitle = jam ? `${jam.participants.length} participante(s)` : undefined;

  // Lista em ordem cronológica crescente no estado; a FlatList inverte para render.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  // Áudio anexado, aguardando envio.
  const [pendingAudio, setPendingAudio] = useState<MessageAudio | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Carrega o histórico do banco; cai nos mocks se a conversa ainda não tem nada.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const remote = await fetchMessages(conversationId, user.id);
      if (!active) return;
      setMessages(remote.length > 0 ? remote : (MOCK_MESSAGES[conversationId] ?? []));
    })();
    return () => {
      active = false;
    };
  }, [conversationId, user]);

  // Assina novas mensagens em tempo real.
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId, (row) => {
      const fromOther = row.sender_id !== user?.id;
      setMessages((prev) => {
        // Evita duplicar uma mensagem que o próprio cliente acabou de inserir.
        if (prev.some((m) => m.id === row.id)) return prev;
        const name = fromOther ? 'Músico' : 'Você';
        return [
          ...prev,
          {
            id: row.id,
            senderId: row.sender_id,
            senderName: name,
            text: row.text,
            audio: row.audio ?? undefined,
            createdAt: row.created_at,
          },
        ];
      });
      // Notificação local para mensagens recebidas de outra pessoa.
      if (fromOther) {
        notifyLocal(title, row.text || 'Enviou um áudio', { conversationId });
      }
    });
    return unsubscribe;
  }, [conversationId, user?.id, title]);

  const attachAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    setPendingAudio({ uri: asset.uri, title: asset.name ?? 'Áudio' });
  };

  const send = async () => {
    const text = draft.trim();
    if ((!text && !pendingAudio) || !user) return;
    const audio = pendingAudio ?? undefined;
    setDraft('');
    setPendingAudio(null);
    // A mensagem aparece via Realtime; o fallback local cobre o caso offline.
    const { error } = await sendMessage(conversationId, user.id, text, audio);
    if (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          senderId: 'me',
          senderName: 'Você',
          text,
          audio,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
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
          data={[...messages].reverse()}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={item.senderId === 'me' || item.senderId === user?.id}
              showSender={Boolean(jam)}
            />
          )}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Áudio anexado, aguardando envio */}
        {pendingAudio ? (
          <View style={styles.pendingAudio}>
            <Text style={styles.pendingText} numberOfLines={1}>
              🎵 {pendingAudio.title}
            </Text>
            <TouchableOpacity onPress={() => setPendingAudio(null)}>
              <Text style={styles.pendingRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Composer */}
        <View style={styles.composer}>
          <TouchableOpacity style={styles.attachBtn} onPress={attachAudio}>
            <Text style={styles.attachIcon}>🎵</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Mensagem..."
            placeholderTextColor={Colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && !pendingAudio && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim() && !pendingAudio}
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

  pendingAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  pendingText: { flex: 1, color: Colors.textPrimary, fontSize: 13 },
  pendingRemove: { color: Colors.textSecondary, fontSize: 16, paddingHorizontal: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachIcon: { fontSize: 18 },
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

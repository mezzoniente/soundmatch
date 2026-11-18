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
import { Spacing, Radius } from '../../src/constants/theme';
import { Typography } from '../../src/constants/typography';
import { Icon } from '../../src/components/Icon';
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Icon name="chevron-back" size={26} color={Colors.textPrimary} />
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
            <Icon name="musical-note" size={16} color={Colors.accent} />
            <Text style={styles.pendingText} numberOfLines={1}>
              {pendingAudio.title}
            </Text>
            <TouchableOpacity onPress={() => setPendingAudio(null)}>
              <Icon name="close" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Composer */}
        <View style={styles.composer}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={attachAudio}
            accessibilityRole="button"
            accessibilityLabel="Anexar áudio"
          >
            <Icon name="musical-note" size={18} color={Colors.textSecondary} />
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
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
          >
            <Icon
              name="send"
              size={18}
              color={!draft.trim() && !pendingAudio ? Colors.textMuted : Colors.base}
            />
          </TouchableOpacity>
        </View>
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
    gap: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 38, height: 38, borderRadius: Radius.pill },
  headerAvatarSquare: { width: 38, height: 38, borderRadius: Radius.sm },
  headerTitle: { ...Typography.h3, fontSize: 16 },
  headerSubtitle: { ...Typography.caption, fontSize: 12, marginTop: 1 },

  messagesList: { padding: Spacing.lg, gap: Spacing.sm },

  pendingAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  pendingText: { flex: 1, color: Colors.textPrimary, fontSize: 13 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.base,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.surface },
});

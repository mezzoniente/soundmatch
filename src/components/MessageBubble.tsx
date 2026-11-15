import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import type { ChatMessage } from '../data/mockData';

interface MessageBubbleProps {
  message: ChatMessage;
  /** Mensagem enviada pelo usuário atual (alinha à direita). */
  isMine: boolean;
  /** Mostra o nome do remetente (útil em Jams com vários participantes). */
  showSender: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Balão de mensagem de chat. */
export function MessageBubble({ message, isMine, showSender }: MessageBubbleProps) {
  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      {!isMine && showSender && message.senderAvatar ? (
        <Image source={{ uri: message.senderAvatar }} style={styles.avatar} />
      ) : null}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {!isMine && showSender ? (
          <Text style={styles.sender}>{message.senderName}</Text>
        ) : null}
        <Text style={[styles.text, isMine && styles.textMine]}>{message.text}</Text>
        <Text style={[styles.time, isMine && styles.timeMine]}>{formatTime(message.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  rowMine: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start' },
  avatar: { width: 26, height: 26, borderRadius: 13 },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleMine: { backgroundColor: Colors.teal, borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: Colors.bgCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sender: { fontSize: 12, fontWeight: '700', color: Colors.teal, marginBottom: 2 },
  text: { fontSize: 15, color: Colors.textPrimary, lineHeight: 20 },
  textMine: { color: Colors.bg },
  time: { fontSize: 10, color: Colors.textSecondary, marginTop: 3, alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(10,14,26,0.6)' },
});

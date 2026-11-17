import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { Typography } from '../constants/typography';
import { ChatAudioPreview } from './ChatAudioPreview';
import { ChatLinkCard } from './ChatLinkCard';
import { extractLink } from '../lib/linkDetection';
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
  // Separa um eventual link do texto para exibi-lo como cartão.
  const { text: displayText, link } = extractLink(message.text);

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      {!isMine && showSender && message.senderAvatar ? (
        <Image source={{ uri: message.senderAvatar }} style={styles.avatar} />
      ) : null}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {!isMine && showSender ? (
          <Text style={styles.sender}>{message.senderName}</Text>
        ) : null}

        {/* Texto (sem a URL, que vira cartão abaixo) */}
        {displayText.length > 0 ? (
          <Text style={[styles.text, isMine && styles.textMine]}>{displayText}</Text>
        ) : null}

        {/* Anexo de áudio */}
        {message.audio ? (
          <View style={styles.attachment}>
            <ChatAudioPreview audio={message.audio} mine={isMine} />
          </View>
        ) : null}

        {/* Cartão de link musical */}
        {link ? (
          <View style={styles.attachment}>
            <ChatLinkCard link={link} mine={isMine} />
          </View>
        ) : null}

        <Text style={[styles.time, isMine && styles.timeMine]}>{formatTime(message.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, maxWidth: '85%' },
  rowMine: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start' },
  avatar: { width: 26, height: 26, borderRadius: Radius.pill },
  bubble: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 1,
  },
  bubbleMine: { backgroundColor: Colors.accent, borderBottomRightRadius: Spacing.xs },
  bubbleTheirs: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sender: { fontSize: 12, fontWeight: '700', color: Colors.accent, marginBottom: 2 },
  text: { ...Typography.body, fontSize: 15, lineHeight: 20 },
  attachment: { marginTop: Spacing.xs + 2 },
  textMine: { color: Colors.base },
  time: { ...Typography.caption, fontSize: 10, marginTop: 3, alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(8,11,20,0.6)' },
});

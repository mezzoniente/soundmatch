import { supabase } from './supabase';
import type { ChatMessage, MessageAudio } from '../data/mockData';

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  audio: MessageAudio | null;
  created_at: string;
}

function rowToMessage(row: MessageRow, senderName: string, senderAvatar?: string): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName,
    senderAvatar,
    text: row.text,
    audio: row.audio ?? undefined,
    createdAt: row.created_at,
  };
}

/** Lista as mensagens de uma conversa, resolvendo nome/foto dos remetentes. */
export async function fetchMessages(
  conversationId: string,
  currentUserId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[messagesRepository] fetch falhou:', error.message);
    return [];
  }

  const rows = data as MessageRow[];
  if (rows.length === 0) return [];

  // Resolve os perfis dos remetentes numa consulta.
  const senderIds = Array.from(new Set(rows.map((r) => r.sender_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', senderIds);
  const byId = new Map(
    (profiles ?? []).map((p: { id: string; name: string | null; avatar_url: string | null }) => [
      p.id,
      p,
    ])
  );

  return rows.map((row) => {
    const author = byId.get(row.sender_id);
    const name = row.sender_id === currentUserId ? 'Você' : author?.name || 'Músico';
    return rowToMessage(row, name, author?.avatar_url ?? undefined);
  });
}

/** Envia uma mensagem para uma conversa. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  audio?: MessageAudio
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    text,
    audio: audio ?? null,
  });
  return { error: error ? error.message : null };
}

/**
 * Assina as novas mensagens de uma conversa em tempo real.
 * Retorna uma função para cancelar a subscription (chamar no cleanup).
 */
export function subscribeToMessages(
  conversationId: string,
  onInsert: (row: {
    id: string;
    sender_id: string;
    text: string;
    audio: MessageAudio | null;
    created_at: string;
  }) => void
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(payload.new as MessageRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

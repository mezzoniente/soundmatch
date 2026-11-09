import { File } from 'expo-file-system';
import { supabase } from './supabase';

export type StorageBucket = 'avatars' | 'media-samples';

/** Deriva a extensão a partir de uma URI local, com fallback. */
function extensionFromUri(uri: string, fallback: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri);
  return match ? match[1].toLowerCase() : fallback;
}

/** Mapeia extensões comuns para content-type. */
function contentTypeFor(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    m4v: 'video/x-m4v',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
  };
  return map[ext] ?? 'application/octet-stream';
}

interface UploadResult {
  /** URL pública do arquivo (buckets públicos). */
  publicUrl: string | null;
  /** Caminho dentro do bucket ("<uid>/<arquivo>"). */
  path: string | null;
  error: string | null;
}

/**
 * Faz upload de um arquivo local (file:// ou content://) para o Supabase Storage.
 * Lê o arquivo como bytes via expo-file-system (abordagem recomendada no RN,
 * já que Blob/File/FormData não funcionam corretamente aqui).
 *
 * @param bucket    bucket de destino
 * @param userId    id do usuário (vira a primeira pasta do caminho, exigido pelas policies)
 * @param localUri  URI local do arquivo
 * @param kind      prefixo lógico do nome ('avatar', 'cover', 'sample')
 * @param fallbackExt extensão padrão caso não seja possível inferir
 */
export async function uploadFile(
  bucket: StorageBucket,
  userId: string,
  localUri: string,
  kind: string,
  fallbackExt: string
): Promise<UploadResult> {
  try {
    const ext = extensionFromUri(localUri, fallbackExt);
    const contentType = contentTypeFor(ext);
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;

    // Lê o conteúdo binário do arquivo local.
    const bytes = await new File(localUri).bytes();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, bytes, { contentType, upsert: true });

    if (error) {
      console.warn('[storage] upload falhou:', error.message);
      return { publicUrl: null, path: null, error: error.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { publicUrl: data.publicUrl, path, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Falha ao ler o arquivo.';
    console.warn('[storage] erro:', message);
    return { publicUrl: null, path: null, error: message };
  }
}

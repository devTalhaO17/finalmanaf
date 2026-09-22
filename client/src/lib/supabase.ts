import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured =
  Boolean(
    url &&
      anonKey &&
      /^https:\/\/.+\.supabase\.(co|in)/.test(url) &&
      anonKey !== 'your-anon-key' &&
      anonKey.length > 20
  );

export const supabase: SupabaseClient | null =
  isSupabaseConfigured ? createClient(url!, anonKey!) : null;

export const supabaseUrl = url || '';

export async function uploadImage(
  data: string | Blob,
  folder = 'media'
): Promise<string | null> {
  if (!supabase) return null;
  if (typeof data === 'string' && data.startsWith('http')) return data;

  let blob: Blob;
  if (typeof data === 'string' && data.startsWith('data:')) {
    blob = await compressDataUrl(data);
  } else if (data instanceof Blob) {
    blob = data;
  } else {
    return null;
  }

  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage.from('sajks').upload(path, blob, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) {
    console.error('Upload failed', error);
    return null;
  }
  return `${supabaseUrl}/storage/v1/object/public/sajks/${path}`;
}

function compressDataUrl(dataUrl: string, maxDim = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('WebP encode failed'))),
        'image/webp',
        0.82
      );
    };
    img.onerror = () => reject(new Error('Invalid image data'));
    img.src = dataUrl;
  });
}
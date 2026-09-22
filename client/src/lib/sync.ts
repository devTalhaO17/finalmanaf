
import { supabase, isSupabaseConfigured, uploadImage } from './supabase';
import { INITIAL_SITE_INFO } from '../data/initialData';

const KEY_TO_TABLE: Record<string, string> = {
  sajks_users_v1: 'users',
  sajks_books_v1: 'books',
  sajks_digital_books_v1: 'digital_books',
  sajks_notices_v1: 'notices',
  sajks_events_v1: 'events',
  sajks_gallery_v1: 'gallery',
  sajks_donors_v1: 'donors',
  sajks_borrow_v1: 'borrow_records',
  sajks_reservations_v1: 'reservations',
  sajks_fines_v1: 'fines',
  sajks_site_info_v1: 'site_info',
  sajks_milestones_v1: 'milestones',
  sajks_media_library_v1: 'media_library',
  sajks_system_logs_v1: 'system_logs',
};

const REPLACE_TABLES = new Set([
  'books',
  'digital_books',
  'notices',
  'events',
  'gallery',
  'donors',
  'milestones',
  'media_library',
  'site_info',
]);

const UPSERT_ONLY_TABLES = new Set([
  'users',
  'borrow_records',
  'reservations',
  'fines',
  'system_logs',
]);

type AnyRow = Record<string, unknown>;

const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase());

const mediaUrlCache = new Map<string, string>();

function toDbRow(row: AnyRow): AnyRow {
  const out: AnyRow = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === undefined) continue;
    if (k === 'passwordHash') continue;
    if (typeof v === 'object' && v !== null) {
      out[camelToSnake(k)] = JSON.parse(JSON.stringify(v));
    } else {
      out[camelToSnake(k)] = v;
    }
  }
  if (row.id === undefined || row.id === null) {
    out.id = (row as { id?: unknown }).id ?? `c_${Date.now()}`;
  }
  return out;
}

function toAppRow(row: AnyRow): AnyRow {
  const out: AnyRow = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out;
}

const debounced = new Map<string, number>();

function debounce(key: string, fn: () => void, ms = 1500) {
  const existing = debounced.get(key);
  if (existing) window.clearTimeout(existing);
  debounced.set(
    key,
    window.setTimeout(() => {
      debounced.delete(key);
      fn();
    }, ms)
  );
}

async function materializeImages(table: string, row: AnyRow): Promise<AnyRow> {
  if (table !== 'media_library') return row;
  let url = row.url as string;
  if (typeof url === 'string' && url.startsWith('data:')) {
    if (mediaUrlCache.has(url)) {
      url = mediaUrlCache.get(url)!;
    } else {
      const uploaded = await uploadImage(url, 'media');
      if (uploaded) {
        mediaUrlCache.set(url, uploaded);
        url = uploaded;
      }
    }
    return { ...row, url };
  }
  return row;
}

export function syncKey(key: string, rows: unknown[]): void {
  if (!supabase || !isSupabaseConfigured) return;
  const table = KEY_TO_TABLE[key];
  if (!table) return;

  debounce(key, async () => {
    try {
      if (table === 'site_info') {
        const info = (rows[0] || {}) as AnyRow;
        await supabase!.from('site_info').upsert({ ...toDbRow(info), id: 'main' });
        return;
      }
      const items = (rows as AnyRow[]).filter((r) => r && typeof r === 'object');
      const dbRows: AnyRow[] = [];
      for (const r of items) {
        dbRows.push(await materializeImages(table, toDbRow(r)));
      }
      if (dbRows.length > 0) {
        const { error } = await supabase!.from(table).upsert(dbRows);
        if (error) console.error(`[sync] upsert ${table} failed`, error.message);
      }
      if (REPLACE_TABLES.has(table)) {
        const { data: existing } = await supabase!
          .from(table)
          .select('id');
        const localIds = new Set(dbRows.map((r) => r.id as string));
        const toDelete = (existing || [])
          .map((r) => r.id as string)
          .filter((id) => !localIds.has(id));
        if (toDelete.length > 0) {
          const { error } = await supabase!.from(table).delete().in('id', toDelete);
          if (error) console.error(`[sync] delete ${table} failed`, error.message);
        }
      }
    } catch (err) {
      console.error(`[sync] ${table}`, (err as Error)?.message || err);
    }
  }, table === 'system_logs' ? 3000 : 1200);
}

export function syncRemove(key: string, ids: string | string[]): void {
  if (!supabase || !isSupabaseConfigured) return;
  const table = KEY_TO_TABLE[key];
  if (!table || !UPSERT_ONLY_TABLES.has(table)) return;
  const idList = Array.isArray(ids) ? ids : [ids];
  if (idList.length === 0) return;
  debounce(key, async () => {
    const { error } = await supabase!.from(table).delete().in('id', idList);
    if (error) console.error(`[sync] delete ${table} failed`, error.message);
  }, 300);
}

export async function pullAll(): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  const pulls: Array<[string, string]> = [
    ['sajks_books_v1', 'books'],
    ['sajks_digital_books_v1', 'digital_books'],
    ['sajks_notices_v1', 'notices'],
    ['sajks_events_v1', 'events'],
    ['sajks_gallery_v1', 'gallery'],
    ['sajks_donors_v1', 'donors'],
    ['sajks_milestones_v1', 'milestones'],
    ['sajks_media_library_v1', 'media_library'],
  ];
  for (const [key, table] of pulls) {
    try {
      const { data } = await supabase.from(table).select('*');
      if (data && Array.isArray(data) && data.length > 0) {
        localStorage.setItem(key, JSON.stringify(data.map(toAppRow)));
      }
    } catch (err) {
      console.error(`[sync] pull ${table} failed`, (err as Error)?.message || err);
    }
  }
  try {
    const { data: info } = await supabase.from('site_info').select('*').eq('id', 'main').maybeSingle();
    if (info) {
      const merged = { ...INITIAL_SITE_INFO, ...toAppRow(info as AnyRow) };
      localStorage.setItem('sajks_site_info_v1', JSON.stringify(merged));
    }
  } catch (err) {
    console.error('[sync] pull site_info failed', (err as Error)?.message || err);
  }
}

export async function pushAllLocal(): Promise<{ ok: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { ok: false, message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env' };
  }
  try {
    for (const key of Object.keys(KEY_TO_TABLE)) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      const table = KEY_TO_TABLE[key];
      if (table === 'site_info') {
        await supabase.from('site_info').upsert({ ...toDbRow(rows[0]), id: 'main' });
        continue;
      }
      const dbRows: AnyRow[] = [];
      for (const r of rows) dbRows.push(await materializeImages(table, toDbRow(r)));
      if (dbRows.length > 0) {
        await supabase.from(table).upsert(dbRows);
      }
    }
    return { ok: true, message: 'সব ডাটা সফলভাবে Supabase-এ আপলোড হয়েছে!' };
  } catch (err) {
    return { ok: false, message: `আপলোড ব্যর্থ: ${(err as Error)?.message || 'unknown error'}` };
  }
}

export async function pullMyData(): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  const localUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user_data') || 'null') as {
        id?: string;
        email?: string;
      } | null;
    } catch {
      return null;
    }
  })();
  const appId = localUser?.id;
  const email = localUser?.email?.toLowerCase();
  if (!appId) return;
  const filters = [`user_id.eq.${appId}`];
  if (email) filters.push(`user_email.ilike.${email}`);
  const pulls: Array<[string, string]> = [
    ['sajks_borrow_v1', 'borrow_records'],
    ['sajks_fines_v1', 'fines'],
    ['sajks_reservations_v1', 'reservations'],
  ];
  for (const [key, table] of pulls) {
    try {
      const query = supabase.from(table).select('*').or(filters.join(','));
      const { data } = await query;
      if (data && data.length > 0) {
        const merged = mergeById(getLocal(key), data.map(toAppRow));
        localStorage.setItem(key, JSON.stringify(merged));
      }
    } catch (err) {
      console.error(`[sync] pull ${table} failed`, (err as Error)?.message || err);
    }
  }
}

function getLocal(key: string): AnyRow[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AnyRow[]) : [];
  } catch {
    return [];
  }
}

function mergeById(local: AnyRow[], remote: AnyRow[]): AnyRow[] {
  const byId = new Map<string, AnyRow>();
  for (const r of remote) byId.set(r.id as string, r);
  for (const r of local) if (!byId.has(r.id as string)) byId.set(r.id as string, r);
  return [...byId.values()];
}
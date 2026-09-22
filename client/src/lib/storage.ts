import {
  User,
  Book,
  DigitalBook,
  Notice,
  LibraryEvent,
  GalleryItem,
  DonorMember,
  BorrowRecord,
  Reservation,
  FineRecord,
  SiteInfo,
  MilestoneItem,
  MediaItem,
  ImageCategory,
  SystemLog,
  LogCategory,
  LogSeverity
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BOOKS,
  INITIAL_DIGITAL_BOOKS,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_GALLERY,
  INITIAL_DONORS,
  INITIAL_BORROW_RECORDS,
  INITIAL_RESERVATIONS,
  INITIAL_FINES,
  INITIAL_SITE_INFO,
  INITIAL_MILESTONES,
  INITIAL_MEDIA_LIBRARY,
  INITIAL_SYSTEM_LOGS,
  DEFAULT_FALLBACK_IMAGE,
  mockHashPassword
} from '../data/initialData';
import { syncKey, syncRemove } from './sync';

export { mockHashPassword, DEFAULT_FALLBACK_IMAGE };

const KEYS = {
  USERS: 'sajks_users_v1',
  BOOKS: 'sajks_books_v1',
  DIGITAL_BOOKS: 'sajks_digital_books_v1',
  NOTICES: 'sajks_notices_v1',
  EVENTS: 'sajks_events_v1',
  GALLERY: 'sajks_gallery_v1',
  DONORS: 'sajks_donors_v1',
  BORROW_RECORDS: 'sajks_borrow_v1',
  RESERVATIONS: 'sajks_reservations_v1',
  FINES: 'sajks_fines_v1',
  FAVORITES: 'sajks_favorites_v1',
  LOGGED_USER: 'sajks_current_user_v1',
  LANG: 'sajks_language_v1',
  THEME: 'sajks_theme_v1',
  SITE_INFO: 'sajks_site_info_v1',
  MILESTONES: 'sajks_milestones_v1',
  MEDIA_LIBRARY: 'sajks_media_library_v1',
  SYSTEM_LOGS: 'sajks_system_logs_v1'
};

function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== null && obj[key] !== undefined) {
      out[key] = obj[key];
    }
  }
  return out;
}

function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage`, err);
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    const rows = Array.isArray(val) ? val : [val];
    syncKey(key, rows);
  } catch (err) {
    console.error(`Error writing ${key} to storage`, err);
  }
}

export const storage = {
  resetAll: () => {
    localStorage.clear();
    setStoredItem(KEYS.USERS, INITIAL_USERS);
    setStoredItem(KEYS.BOOKS, INITIAL_BOOKS);
    setStoredItem(KEYS.DIGITAL_BOOKS, INITIAL_DIGITAL_BOOKS);
    setStoredItem(KEYS.NOTICES, INITIAL_NOTICES);
    setStoredItem(KEYS.EVENTS, INITIAL_EVENTS);
    setStoredItem(KEYS.GALLERY, INITIAL_GALLERY);
    setStoredItem(KEYS.DONORS, INITIAL_DONORS);
    setStoredItem(KEYS.BORROW_RECORDS, INITIAL_BORROW_RECORDS);
    setStoredItem(KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
    setStoredItem(KEYS.FINES, INITIAL_FINES);
    setStoredItem(KEYS.FAVORITES, []);
    setStoredItem(KEYS.SITE_INFO, INITIAL_SITE_INFO);
    setStoredItem(KEYS.MILESTONES, INITIAL_MILESTONES);
    setStoredItem(KEYS.MEDIA_LIBRARY, INITIAL_MEDIA_LIBRARY);
    setStoredItem(KEYS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS);
    storage.notifyMediaUpdate();
  },

  notifyMediaUpdate: () => {
    try {
      window.dispatchEvent(new CustomEvent('sajks_media_updated', { detail: { timestamp: Date.now() } }));
    } catch (e) {
      console.warn('Could not dispatch sajks_media_updated event', e);
    }
  },

  getMediaLibrary: (): MediaItem[] => getStoredItem<MediaItem[]>(KEYS.MEDIA_LIBRARY, INITIAL_MEDIA_LIBRARY),
  
  saveMediaLibrary: (items: MediaItem[]) => {
    setStoredItem(KEYS.MEDIA_LIBRARY, items);
    storage.notifyMediaUpdate();
  },

  getMediaById: (id: string): MediaItem | undefined => {
    if (!id) return undefined;
    const list = storage.getMediaLibrary();
    return list.find(m => m.id === id);
  },

  findDuplicateImage: (url: string): MediaItem | undefined => {
    if (!url) return undefined;
    const clean = url.trim();
    const list = storage.getMediaLibrary();
    return list.find(m => m.url.trim() === clean || (m.id && m.id === clean));
  },

  saveMediaItem: (itemData: Partial<MediaItem> & { url: string; title: string; category: ImageCategory | string }): MediaItem => {
    const list = storage.getMediaLibrary();
    
    const existing = storage.findDuplicateImage(itemData.url);
    if (existing) {
      const updated = { ...existing, title: itemData.title || existing.title, updatedAt: new Date().toISOString().split('T')[0] };
      storage.saveMediaLibrary(list.map(m => m.id === existing.id ? updated : m));
      return updated;
    }

    const catStr = (itemData.category as ImageCategory) || 'general';
    const newId = itemData.id || `img_${catStr}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newItem: MediaItem = {
      id: newId,
      title: itemData.title,
      category: catStr as ImageCategory,
      url: itemData.url,
      dimensions: itemData.dimensions || '400x400',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      referenceCount: 1
    };
    list.unshift(newItem);
    storage.saveMediaLibrary(list);
    return newItem;
  },

  updateMediaItem: (id: string, newUrl: string, newTitle?: string): MediaItem | undefined => {
    const list = storage.getMediaLibrary();
    let updatedItem: MediaItem | undefined;
    const updatedList = list.map(item => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          url: newUrl,
          title: newTitle || item.title,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        return updatedItem;
      }
      return item;
    });

    if (updatedItem) {
      storage.saveMediaLibrary(updatedList);
    }
    return updatedItem;
  },

  deleteMediaItem: (id: string) => {
    const list = storage.getMediaLibrary().filter(m => m.id !== id);
    storage.saveMediaLibrary(list);
  },

  resolveImageUrl: (idOrUrl: string | undefined | null, category: ImageCategory | string = 'general'): string => {
    if (!idOrUrl || idOrUrl.trim() === '') {
      return DEFAULT_FALLBACK_IMAGE;
    }
    const clean = idOrUrl.trim();
    const media = storage.getMediaById(clean);
    if (media && media.url) {
      return media.url;
    }
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) {
      return clean;
    }
    return DEFAULT_FALLBACK_IMAGE;
  },

  clearImageCache: () => {
    storage.notifyMediaUpdate();
  },

  getSiteInfo: (): SiteInfo => {
    const stored = getStoredItem<Partial<SiteInfo>>(KEYS.SITE_INFO, {});
    if (!stored || Object.keys(stored).length === 0) {
      return INITIAL_SITE_INFO;
    }
    return { ...INITIAL_SITE_INFO, ...removeNullish(stored) };
  },
  saveSiteInfo: (info: SiteInfo) => setStoredItem(KEYS.SITE_INFO, info),

  getMilestones: (): MilestoneItem[] => getStoredItem<MilestoneItem[]>(KEYS.MILESTONES, INITIAL_MILESTONES),
  saveMilestones: (milestones: MilestoneItem[]) => setStoredItem(KEYS.MILESTONES, milestones),
  addMilestone: (item: MilestoneItem) => {
    const list = storage.getMilestones();
    list.unshift(item);
    storage.saveMilestones(list);
  },
  updateMilestone: (updated: MilestoneItem) => {
    const list = storage.getMilestones().map(m => m.id === updated.id ? updated : m);
    storage.saveMilestones(list);
  },
  deleteMilestone: (id: string) => {
    const list = storage.getMilestones().filter(m => m.id !== id);
    storage.saveMilestones(list);
  },


  getUsers: (): User[] => {
    const rawList = getStoredItem<User[]>(KEYS.USERS, INITIAL_USERS);
    const cleanList = rawList.filter(u => 
      u.id !== 'usr_demo_admin' && 
      u.email.toLowerCase() !== 'admin@library.com' &&
      u.id !== 'usr_demo_member' && 
      u.email.toLowerCase() !== 'member@library.com'
    );
    let modified = cleanList.length !== rawList.length;
    const merged = [...cleanList];
    for (const initUser of INITIAL_USERS) {
      const existingIndex = merged.findIndex(u => u.email.toLowerCase() === initUser.email.toLowerCase());
      if (existingIndex === -1) {
        merged.push(initUser);
        modified = true;
      } else if (initUser.email.toLowerCase() === 'admin@sajkspla.org') {
        if (merged[existingIndex].role !== 'SUPER_ADMIN' || merged[existingIndex].username !== 'admin') {
          merged[existingIndex].role = 'SUPER_ADMIN';
          merged[existingIndex].username = 'admin';
          modified = true;
        }
      }
    }
    if (modified) {
      setStoredItem(KEYS.USERS, merged);
    }
    return merged;
  },
  saveUsers: (users: User[]) => setStoredItem(KEYS.USERS, users),
  addUser: (user: User) => {
    const users = storage.getUsers();
    users.unshift(user);
    storage.saveUsers(users);
  },
  updateUser: (updatedUser: User) => {
    const users = storage.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    storage.saveUsers(users);
  },
  deleteUser: (id: string) => {
    syncRemove(KEYS.USERS, id);
    const users = storage.getUsers().filter(u => u.id !== id);
    storage.saveUsers(users);
  },

  getCurrentUserSession: (): User | null => {
    const current = getStoredItem<User | null>(KEYS.LOGGED_USER, null);
    if (current && (current.id === 'usr_demo_admin' || current.email?.toLowerCase() === 'admin@library.com' || current.id === 'usr_demo_member' || current.email?.toLowerCase() === 'member@library.com')) {
      setStoredItem(KEYS.LOGGED_USER, null);
      return null;
    }
    return current;
  },
  setCurrentUserSession: (user: User | null) => setStoredItem(KEYS.LOGGED_USER, user),

  getBooks: (): Book[] => getStoredItem<Book[]>(KEYS.BOOKS, INITIAL_BOOKS),
  saveBooks: (books: Book[]) => setStoredItem(KEYS.BOOKS, books),
  addBook: (book: Book) => {
    const books = storage.getBooks();
    books.unshift(book);
    storage.saveBooks(books);
  },
  updateBook: (updatedBook: Book) => {
    const books = storage.getBooks().map(b => b.id === updatedBook.id ? updatedBook : b);
    storage.saveBooks(books);
  },
  deleteBook: (id: string) => {
    const books = storage.getBooks().filter(b => b.id !== id);
    storage.saveBooks(books);
  },

  getDigitalBooks: (): DigitalBook[] => getStoredItem<DigitalBook[]>(KEYS.DIGITAL_BOOKS, INITIAL_DIGITAL_BOOKS),
  saveDigitalBooks: (books: DigitalBook[]) => setStoredItem(KEYS.DIGITAL_BOOKS, books),
  addDigitalBook: (book: DigitalBook) => {
    const books = storage.getDigitalBooks();
    books.unshift(book);
    storage.saveDigitalBooks(books);
  },
  updateDigitalBook: (updatedBook: DigitalBook) => {
    const books = storage.getDigitalBooks().map(b => b.id === updatedBook.id ? updatedBook : b);
    storage.saveDigitalBooks(books);
  },
  deleteDigitalBook: (id: string) => {
    const books = storage.getDigitalBooks().filter(b => b.id !== id);
    storage.saveDigitalBooks(books);
  },

  getNotices: (): Notice[] => getStoredItem<Notice[]>(KEYS.NOTICES, INITIAL_NOTICES),
  saveNotices: (notices: Notice[]) => setStoredItem(KEYS.NOTICES, notices),
  addNotice: (notice: Notice) => {
    const list = storage.getNotices();
    list.unshift(notice);
    storage.saveNotices(list);
  },
  updateNotice: (updated: Notice) => {
    const list = storage.getNotices().map(n => n.id === updated.id ? updated : n);
    storage.saveNotices(list);
  },
  deleteNotice: (id: string) => {
    const list = storage.getNotices().filter(n => n.id !== id);
    storage.saveNotices(list);
  },

  getEvents: (): LibraryEvent[] => getStoredItem<LibraryEvent[]>(KEYS.EVENTS, INITIAL_EVENTS),
  saveEvents: (events: LibraryEvent[]) => setStoredItem(KEYS.EVENTS, events),
  addEvent: (evt: LibraryEvent) => {
    const list = storage.getEvents();
    list.unshift(evt);
    storage.saveEvents(list);
  },
  updateEvent: (updated: LibraryEvent) => {
    const list = storage.getEvents().map(e => e.id === updated.id ? updated : e);
    storage.saveEvents(list);
  },
  deleteEvent: (id: string) => {
    const list = storage.getEvents().filter(e => e.id !== id);
    storage.saveEvents(list);
  },

  getGallery: (): GalleryItem[] => getStoredItem<GalleryItem[]>(KEYS.GALLERY, INITIAL_GALLERY),
  saveGallery: (gallery: GalleryItem[]) => setStoredItem(KEYS.GALLERY, gallery),
  addGalleryItem: (item: GalleryItem) => {
    const list = storage.getGallery();
    list.unshift(item);
    storage.saveGallery(list);
  },
  updateGalleryItem: (updated: GalleryItem) => {
    const list = storage.getGallery().map(g => g.id === updated.id ? updated : g);
    storage.saveGallery(list);
  },
  deleteGalleryItem: (id: string) => {
    const list = storage.getGallery().filter(g => g.id !== id);
    storage.saveGallery(list);
  },

  getDonors: (): DonorMember[] => getStoredItem<DonorMember[]>(KEYS.DONORS, INITIAL_DONORS),
  saveDonors: (donors: DonorMember[]) => setStoredItem(KEYS.DONORS, donors),
  addDonor: (donor: DonorMember) => {
    const list = storage.getDonors();
    list.unshift(donor);
    storage.saveDonors(list);
  },
  updateDonor: (updated: DonorMember) => {
    const list = storage.getDonors().map(d => d.id === updated.id ? updated : d);
    storage.saveDonors(list);
  },
  deleteDonor: (id: string) => {
    const list = storage.getDonors().filter(d => d.id !== id);
    storage.saveDonors(list);
  },

  getBorrowRecords: (): BorrowRecord[] => getStoredItem<BorrowRecord[]>(KEYS.BORROW_RECORDS, INITIAL_BORROW_RECORDS),
  saveBorrowRecords: (records: BorrowRecord[]) => setStoredItem(KEYS.BORROW_RECORDS, records),
  addBorrowRecord: (rec: BorrowRecord) => {
    const list = storage.getBorrowRecords();
    list.unshift(rec);
    storage.saveBorrowRecords(list);

    const books = storage.getBooks();
    const updatedBooks = books.map(b => {
      if (b.id === rec.bookId) {
        return { ...b, availableCopies: Math.max(0, b.availableCopies - 1) };
      }
      return b;
    });
    storage.saveBooks(updatedBooks);
  },
  returnBookRecord: (borrowId: string, returnDate: string, fineAmount: number) => {
    const records = storage.getBorrowRecords();
    let targetBookId = '';
    const updatedRecords = records.map(r => {
      if (r.id === borrowId) {
        targetBookId = r.bookId;
        return {
          ...r,
          returnDate,
          status: 'returned' as const,
          fineAmount,
          finePaid: fineAmount === 0
        };
      }
      return r;
    });
    storage.saveBorrowRecords(updatedRecords);

    if (targetBookId) {
      const books = storage.getBooks();
      const updatedBooks = books.map(b => {
        if (b.id === targetBookId) {
          return { ...b, availableCopies: Math.min(b.quantity, b.availableCopies + 1) };
        }
        return b;
      });
      storage.saveBooks(updatedBooks);
    }
  },

  getReservations: (): Reservation[] => getStoredItem<Reservation[]>(KEYS.RESERVATIONS, INITIAL_RESERVATIONS),
  saveReservations: (reservations: Reservation[]) => setStoredItem(KEYS.RESERVATIONS, reservations),
  addReservation: (res: Reservation) => {
    const list = storage.getReservations();
    list.unshift(res);
    storage.saveReservations(list);
  },
  updateReservationStatus: (id: string, status: Reservation['status'], notes?: string) => {
    const list = storage.getReservations().map(r => r.id === id ? { ...r, status, notes: notes || r.notes } : r);
    storage.saveReservations(list);
  },

  getFines: (): FineRecord[] => getStoredItem<FineRecord[]>(KEYS.FINES, INITIAL_FINES),
  saveFines: (fines: FineRecord[]) => setStoredItem(KEYS.FINES, fines),
  payFine: (fineId: string) => {
    const list = storage.getFines().map(f => f.id === fineId ? { ...f, status: 'paid' as const } : f);
    storage.saveFines(list);
  },

  getFavorites: (userId: string): string[] => {
    const favObj = getStoredItem<Record<string, string[]>>(KEYS.FAVORITES, {});
    return favObj[userId] || [];
  },
  toggleFavorite: (userId: string, bookId: string) => {
    const favObj = getStoredItem<Record<string, string[]>>(KEYS.FAVORITES, {});
    const userFavs = favObj[userId] || [];
    if (userFavs.includes(bookId)) {
      favObj[userId] = userFavs.filter(id => id !== bookId);
    } else {
      favObj[userId] = [...userFavs, bookId];
    }
    setStoredItem(KEYS.FAVORITES, favObj);
    return favObj[userId];
  },

  getSystemLogs: (): SystemLog[] => getStoredItem<SystemLog[]>(KEYS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS),
  saveSystemLogs: (logs: SystemLog[]) => setStoredItem(KEYS.SYSTEM_LOGS, logs),
  addSystemLog: (log: Omit<SystemLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): SystemLog => {
    const list = storage.getSystemLogs();
    const newLog: SystemLog = {
      id: log.id || `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      action: log.action,
      category: log.category,
      severity: log.severity,
      actor: log.actor,
      details: log.details,
      target: log.target,
      metadata: log.metadata
    };
    list.unshift(newLog);
    const trimmed = list.slice(0, 1000);
    storage.saveSystemLogs(trimmed);
    return newLog;
  },
  clearSystemLogs: () => {
    storage.saveSystemLogs([]);
  },
  exportLogsAsJSON: (): string => {
    const logs = storage.getSystemLogs();
    return JSON.stringify(logs, null, 2);
  },
  exportLogsAsCSV: (): string => {
    const logs = storage.getSystemLogs();
    const headers = ['ID', 'Timestamp', 'Category', 'Severity', 'Action', 'Actor Name', 'Actor Email', 'Actor Role', 'Actor IP', 'Target', 'Details'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.category}"`,
      `"${l.severity}"`,
      `"${l.action}"`,
      `"${(l.actor.name || '').replace(/"/g, '""')}"`,
      `"${l.actor.email || ''}"`,
      `"${l.actor.role || ''}"`,
      `"${l.actor.ip || ''}"`,
      `"${(l.target || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};

export const logActivity = (
  action: string,
  category: LogCategory,
  severity: LogSeverity,
  details: string,
  actorOverride?: Partial<SystemLog['actor']>,
  target?: string,
  metadata?: Record<string, any>
): SystemLog => {
  const currentUser = storage.getCurrentUserSession();
  const actor: SystemLog['actor'] = {
    id: actorOverride?.id || currentUser?.id || 'usr_guest',
    name: actorOverride?.name || currentUser?.fullName || 'Guest / Visitor',
    email: actorOverride?.email || currentUser?.email || 'visitor@sajkspla.org',
    role: actorOverride?.role || currentUser?.role || 'GUEST',
    ip: actorOverride?.ip || '103.145.112.45 (Local/Client)',
    userAgent: actorOverride?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser Client')
  };

  return storage.addSystemLog({
    action,
    category,
    severity,
    actor,
    details,
    target,
    metadata
  });
};


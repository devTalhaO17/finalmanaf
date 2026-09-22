export type UserRole = 'ADMIN' | 'MEMBER' | 'SUPER_ADMIN' | 'LIBRARY_ADMIN' | 'LIBRARIAN';

export const isAdminRole = (role?: UserRole | string): boolean => {
  if (!role) return false;
  return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'LIBRARY_ADMIN' || role === 'LIBRARIAN';
};

export type Language = 'bn' | 'en';

export type ViewName = 
  | 'home'
  | 'about'
  | 'history'
  | 'founder'
  | 'donors'
  | 'books'
  | 'digital-library'
  | 'notices'
  | 'events'
  | 'gallery'
  | 'contact'
  | 'faq'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'super-admin'
  | 'admin'
  | 'member'
  | 'access-denied';

export interface User {
  id: string;
  fullName: string;
  email: string;
  username?: string;
  mobile: string;
  address: string;
  role: UserRole;
  passwordHash: string;
  memberId: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending';
  avatarUrl?: string;
  mustChangePassword?: boolean;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export type LogCategory = 
  | 'AUTH' 
  | 'CIRCULATION' 
  | 'BOOK_CIRCULATION'
  | 'CATALOG' 
  | 'USER_MANAGEMENT' 
  | 'CONTENT' 
  | 'CONTENT_MANAGEMENT'
  | 'FINANCIAL'
  | 'DONATION'
  | 'SYSTEM' 
  | 'SECURITY';

export type LogSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  category: LogCategory;
  severity: LogSeverity;
  actor: {
    id?: string;
    name: string;
    email: string;
    role: string;
    ip?: string;
    userAgent?: string;
  };
  details: string;
  target?: string;
  metadata?: Record<string, any>;
}

export type ImageCategory = 
  | 'founder' 
  | 'logo' 
  | 'hero_banner' 
  | 'book_cover' 
  | 'gallery' 
  | 'member_photo' 
  | 'event' 
  | 'notice' 
  | 'general';

export interface MediaItem {
  id: string;
  title: string;
  category: ImageCategory;
  url: string;
  thumbnailUrl?: string;
  dimensions?: string;
  fileSizeKb?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  referenceCount?: number;
}

export type BookCategory =
  | 'Novel'
  | 'Story'
  | 'Science'
  | 'Technology'
  | 'History'
  | 'Liberation War'
  | 'Religion'
  | 'Children'
  | 'Literature'
  | 'Poetry'
  | 'Reference'
  | 'Biography'
  | 'Education'
  | 'Health'
  | 'Agriculture'
  | 'Computer Science'
  | 'Programming'
  | 'AI';

export interface Book {
  id: string;
  title: string;
  titleEn?: string;
  author: string;
  authorEn?: string;
  publisher: string;
  category: BookCategory;
  publicationYear: number;
  edition: string;
  language: 'Bangla' | 'English' | 'Both';
  coverUrl: string;
  coverImage?: string;
  quantity: number;
  availableCopies: number;
  shelfNumber: string;
  isbn: string;
  barcode: string;
  description?: string;
  featured?: boolean;
  popular?: boolean;
  newArrival?: boolean;
  file?: string;
  status?: 'available' | 'issued' | 'reserved';
}

export interface DigitalBook {
  id: string;
  title: string;
  titleEn?: string;
  author: string;
  category: BookCategory;
  coverUrl: string;
  fileSize: string;
  pageCount: number;
  pdfUrl?: string;
  fileUrl?: string;
  fileFormat?: 'PDF' | 'EPUB';
  description: string;
  downloadCount: number;
  readCount: number;
  viewsCount?: number;
  downloadsCount?: number;
  addedDate?: string;
  sampleContentText?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMemberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue';
  fineAmount: number;
  finePaid: boolean;
  issuedBy: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userMemberId: string;
  reservationDate: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled' | 'expired';
  expiryDate?: string;
  notes?: string;
}

export interface FineRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  borrowId: string;
  bookTitle: string;
  amount: number;
  reason: string;
  date: string;
  status: 'paid' | 'unpaid';
}

export interface Notice {
  id: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  date: string;
  category: 'General' | 'Event' | 'Holiday' | 'Urgent';
  pinned?: boolean;
  isUrgent?: boolean;
  publishedBy?: string;
  attachmentUrl?: string;
}

export interface LibraryEvent {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  organizer: string;
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleEn?: string;
  category: 'Library' | 'Events' | 'Inauguration' | 'Guests' | 'Books';
  imageUrl: string;
  date: string;
  description?: string;
}

export interface DonorMember {
  id: string;
  name: string;
  designation: string;
  donorCategory: 'Life Member' | 'Patron' | 'Chief Sponsor' | 'Donor Member';
  contribution: string;
  photoUrl: string;
  joinDate: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category: string;
}

export interface SystemStats {
  totalBooks: number;
  availableBooks: number;
  totalMembers: number;
  digitalBooksCount: number;
  dailyVisitors: number;
  issuedBooksCount: number;
}

export interface FounderInfo {
  name: string;
  designation: string;
  address: string;
  photoUrl: string;
  quote: string;
  bio1: string;
  bio2: string;
}

export interface MilestoneItem {
  id: string;
  year: string;
  title: string;
  desc: string;
}

export interface SiteInfo {
  libraryName: string;
  foundingDate: string;
  address: string;
  email: string;
  phone: string;
  hours: string;
  aboutIntro: string;
  mission: string;
  vision: string;
  facilities: string[];
  mapInfo: string;
  founder: FounderInfo;
  heroTitle?: string;
  heroSubTitle?: string;
  heroBannerImage?: string;
  libraryExteriorImage?: string;
  mottoText?: string;
  aboutHeaderImage?: string;
  libraryLogoUrl?: string;
}

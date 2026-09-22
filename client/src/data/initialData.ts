import { 
  User, 
  Book, 
  DigitalBook, 
  Notice, 
  LibraryEvent, 
  GalleryItem, 
  DonorMember, 
  FAQItem,
  BorrowRecord,
  Reservation,
  FineRecord,
  SiteInfo,
  MilestoneItem,
  MediaItem,
  SystemLog
} from '../types';

export const DEFAULT_FALLBACK_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23064e3b"/><g fill="%2334d399" font-family="sans-serif" text-anchor="middle"><circle cx="200" cy="150" r="55" fill="%23047857" opacity="0.6"/><path d="M160 140 h80 v50 h-80 z" fill="%23a7f3d0" opacity="0.8"/><text x="200" y="260" font-size="20" font-weight="bold" fill="%23ffffff">Speaker Abdul Jabbar Khan</text><text x="200" y="290" font-size="15" fill="%236ee7b7">Memorial Public Library</text><text x="200" y="330" font-size="12" fill="%23a7f3d0" opacity="0.75">[ চিত্র ফাইল পাওয়া যায়নি ]</text></g></svg>`;

export const INITIAL_MEDIA_LIBRARY: MediaItem[] = [
  {
    id: 'img_logo_main',
    title: 'লাইব্রেরি অফিসিয়াল লোগো (Main Logo)',
    category: 'logo',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=300',
    dimensions: '300x300',
    createdAt: '2001-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 15
  },
  {
    id: 'img_founder_01',
    title: 'প্রতিষ্ঠাতা জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধার পোট্রেট',
    category: 'founder',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    dimensions: '400x400',
    createdAt: '2001-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 5
  },
  {
    id: 'img_hero_banner',
    title: 'হোম পেজ হিরো ব্যানার ইমেজ',
    category: 'hero_banner',
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200',
    dimensions: '1200x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 3
  },
  {
    id: 'img_building_ext',
    title: 'লাইব্রেরি ভবনের বাহ্যিক দৃশ্য (Exterior Building)',
    category: 'general',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    dimensions: '800x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 4
  },
  {
    id: 'img_about_header',
    title: 'আমাদের সম্পর্কে পেজের হেডার ব্যানার',
    category: 'hero_banner',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1200',
    dimensions: '1200x500',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 2
  },
  {
    id: 'img_bk_1',
    title: 'একাত্তরের দিনগুলি - প্রচ্ছদ',
    category: 'book_cover',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    dimensions: '400x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  },
  {
    id: 'img_bk_2',
    title: 'আমার বন্ধু রাশেদ - প্রচ্ছদ',
    category: 'book_cover',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    dimensions: '400x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  },
  {
    id: 'img_bk_3',
    title: 'পাইথন দিয়ে প্রোগ্রামিং শেখা - প্রচ্ছদ',
    category: 'book_cover',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
    dimensions: '400x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  },
  {
    id: 'img_bk_4',
    title: 'কৃত্রিম বুদ্ধিমত্তা ও ভবিষ্যৎ পৃথিবী - প্রচ্ছদ',
    category: 'book_cover',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    dimensions: '400x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  },
  {
    id: 'img_gal_1',
    title: 'লাইব্রেরি পাঠ কক্ষের অভ্যন্তরীণ রূপ',
    category: 'gallery',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
    dimensions: '800x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  },
  {
    id: 'img_gal_2',
    title: 'পাঠক কর্নার ও দৈনিক পত্রিকা পাঠ',
    category: 'gallery',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800',
    dimensions: '800x600',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  },
  {
    id: 'img_notice_1',
    title: 'বই মেলা ও সাহিত্য প্রতিযোগিতা নোটিশ ব্যানার',
    category: 'notice',
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=600',
    dimensions: '600x400',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  },
  {
    id: 'img_event_1',
    title: 'জাতীয় বই উৎসব ও র্যালি ফটো',
    category: 'event',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600',
    dimensions: '600x400',
    createdAt: '2026-01-01',
    updatedAt: '2026-08-01',
    referenceCount: 1
  }
];

export const mockHashPassword = (pwd: string) => `hashed_${pwd}_salt_sajkspla_2001`;

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_super_1',
    fullName: 'জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধা',
    email: 'admin@sajkspla.org',
    username: 'admin',
    mobile: '01711000001',
    address: 'গ্রাম: ভূতেরদিয়া, বাবুগঞ্জ, বরিশাল',
    role: 'SUPER_ADMIN',
    passwordHash: mockHashPassword('Library123'),
    mustChangePassword: false,
    isEmailVerified: true,
    memberId: 'SAJKS-ADM-001',
    createdAt: '2001-01-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_lib_admin_1',
    fullName: 'মোসাঃ সেলিনা বেগম',
    email: 'libadmin@sajkspla.org',
    username: 'libadmin',
    mobile: '01711000002',
    address: 'বাবুগঞ্জ, বরিশাল',
    role: 'LIBRARY_ADMIN',
    passwordHash: mockHashPassword('Library123'),
    mustChangePassword: false,
    isEmailVerified: true,
    memberId: 'SAJKS-LA-002',
    createdAt: '2015-03-10',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_librarian_1',
    fullName: 'আব্দুর রহমান',
    email: 'librarian@sajkspla.org',
    username: 'librarian',
    mobile: '01711000003',
    address: 'ভূতেরদিয়া, বাবুগঞ্জ',
    role: 'LIBRARIAN',
    passwordHash: mockHashPassword('Library123'),
    mustChangePassword: false,
    isEmailVerified: true,
    memberId: 'SAJKS-LIB-003',
    createdAt: '2018-06-15',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_member_1',
    fullName: 'তানজিম আহমেদ',
    email: 'member@sajkspla.org',
    username: 'member',
    mobile: '01812345678',
    address: 'বরিশাল সদর, বরিশাল',
    role: 'MEMBER',
    passwordHash: mockHashPassword('Library123'),
    mustChangePassword: false,
    isEmailVerified: true,
    memberId: 'SAJKS-M-1001',
    createdAt: '2023-01-15',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'bk_1',
    title: 'একাত্তরের দিনগুলি',
    titleEn: 'Ekattorer Dinguli',
    author: 'জাহানারা ইমাম',
    authorEn: 'Jahanara Imam',
    publisher: 'সন্ধানী প্রকাশনী',
    category: 'Liberation War',
    publicationYear: 1986,
    edition: '১২শ সংস্করণ',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    quantity: 10,
    availableCopies: 8,
    shelfNumber: 'LW-101',
    isbn: '978-984-480-012-3',
    barcode: 'SAJKS-LW-101',
    description: 'বাংলাদেশের স্বাধীনতা যুদ্ধের একটি অবিস্মরণীয় দিনলিপি গ্রন্থ। শহীদ জননী জাহানারা ইমামের লেখা কালজয়ী সাহিত্য।',
    featured: true,
    popular: true
  },
  {
    id: 'bk_2',
    title: 'আমিTopু',
    titleEn: 'Amar Bandhu Rashed',
    author: 'মুহম্মদ জাফর ইকবাল',
    authorEn: 'Muhammad Zafar Iqbal',
    publisher: 'প্রথমা প্রকাশন',
    category: 'Children',
    publicationYear: 2008,
    edition: '৫ম সংস্করণ',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    quantity: 8,
    availableCopies: 5,
    shelfNumber: 'CH-202',
    isbn: '978-984-888-001-2',
    barcode: 'SAJKS-CH-202',
    description: 'মুক্তিযুদ্ধের পটভূমিতে রচিত কিশোর উপযোগী এক অসামান্য হৃদয়স্পর্শী উপন্যাস।',
    featured: true,
    popular: true
  },
  {
    id: 'bk_3',
    title: 'পাইথন দিয়ে প্রোগ্রামিং শেখা',
    titleEn: 'Python Programming Basics',
    author: 'তামিম শাহরিয়ার সুবিন',
    authorEn: 'Tamim Shahriar Subeen',
    publisher: 'দ্বিমিক প্রকাশনী',
    category: 'Programming',
    publicationYear: 2021,
    edition: '৩য় সংস্করণ',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
    quantity: 12,
    availableCopies: 9,
    shelfNumber: 'CS-301',
    isbn: '978-984-342-109-8',
    barcode: 'SAJKS-CS-301',
    description: 'সহজ বাংলা ভাষায় পাইথন প্রোগ্রামিং শেখার বাস্তবসম্মত ও জনপ্রিয় নির্দেশিকা।',
    newArrival: true,
    featured: true
  },
  {
    id: 'bk_4',
    title: 'কৃত্রিম বুদ্ধিমত্তা ও ভবিষ্যৎ পৃথিবী',
    titleEn: 'Artificial Intelligence & Future World',
    author: 'ড. রাগিব হাসান',
    authorEn: 'Dr. Ragib Hasan',
    publisher: 'আদর্শ প্রকাশনী',
    category: 'AI',
    publicationYear: 2023,
    edition: '১ম সংস্করণ',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    quantity: 6,
    availableCopies: 4,
    shelfNumber: 'AI-401',
    isbn: '978-984-960-221-5',
    barcode: 'SAJKS-AI-401',
    description: 'আর্টিফিশিয়াল ইন্টেলিজেন্স বা এআই কীভাবে মানবসভ্যতাকে বদলে দিচ্ছে তার বিষদ বৈজ্ঞানিক পর্যালোচনা।',
    newArrival: true,
    popular: true
  },
  {
    id: 'bk_5',
    title: 'সঞ্চয়িতা',
    titleEn: 'Sanchayita',
    author: 'রবীন্দ্রনাথ ঠাকুর',
    authorEn: 'Rabindranath Tagore',
    publisher: 'বিশ্বভারতী',
    category: 'Poetry',
    publicationYear: 1931,
    edition: 'পুনর্মুদ্রণ',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1474939557522-f48b4b84e775?auto=format&fit=crop&q=80&w=400',
    quantity: 15,
    availableCopies: 12,
    shelfNumber: 'PO-105',
    isbn: '978-817-001-002-1',
    barcode: 'SAJKS-PO-105',
    description: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের নির্বাচিত কাব্যসংকলন। বাংলা সাহিত্যের অমর সৃষ্টি।',
    featured: true
  },
  {
    id: 'bk_6',
    title: 'পদ্মা নদীর মাঝি',
    titleEn: 'Padma Nadir Majhi',
    author: 'মানিক বন্দ্যোপাধ্যায়',
    authorEn: 'Manik Bandopadhyay',
    publisher: 'ডি কে প্রকাশনী',
    category: 'Novel',
    publicationYear: 1936,
    edition: 'স্মারক সংস্করণ',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    quantity: 7,
    availableCopies: 6,
    shelfNumber: 'NV-201',
    isbn: '978-984-411-098-1',
    barcode: 'SAJKS-NV-201',
    description: 'পদ্মা পারের জেলেদের জীবনসংগ্রাম ও বাস্তবতার নিখুঁত রূপায়ণ নির্ভর অমর উপন্যাস।',
    popular: true
  },
  {
    id: 'bk_7',
    title: 'কম্পিউটার নেটওয়ার্কিং পরিচিতি',
    titleEn: 'Introduction to Computer Networking',
    author: 'অধ্যক্ষ মশিউর রহমান',
    authorEn: 'Mashiur Rahman',
    publisher: 'লেকচার পাবলিকেশন্স',
    category: 'Computer Science',
    publicationYear: 2022,
    edition: '২য় সংস্করণ',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400',
    quantity: 9,
    availableCopies: 7,
    shelfNumber: 'CS-302',
    isbn: '978-984-700-112-9',
    barcode: 'SAJKS-CS-302',
    description: 'কম্পিউটার নেটওয়ার্ক, রাউটিং, প্রোটোকল ও সাইবার নিরাপত্তার মৌলিক ধারণা।',
    featured: false
  },
  {
    id: 'bk_8',
    title: 'বঙ্গবন্ধু ও বাংলাদেশ',
    titleEn: 'Bangabandhu and Bangladesh',
    author: 'ড. মোবাশ্বের আলী',
    authorEn: 'Dr. Mobaswer Ali',
    publisher: 'বাংলা একাডেমি',
    category: 'History',
    publicationYear: 2020,
    edition: 'বিশেষ প্রকাশনা',
    language: 'Bangla',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    quantity: 11,
    availableCopies: 10,
    shelfNumber: 'HIS-102',
    isbn: '978-984-075-890-4',
    barcode: 'SAJKS-HIS-102',
    description: 'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের জীবন, সংগ্রাম ও স্বাধীন বাংলাদেশ গঠনের গৌরবময় ইতিহাস।',
    featured: true,
    popular: true
  }
];

export const INITIAL_DIGITAL_BOOKS: DigitalBook[] = [
  {
    id: 'dig_1',
    title: 'ডিজিটাল বাংলাদেশ ও আধুনিক লাইব্রেরি বিজ্ঞান',
    titleEn: 'Digital Bangladesh and Modern Library Science',
    author: 'অধ্যাপক ড. মোঃ নাসিরউদ্দিন',
    category: 'Technology',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    fileSize: '4.2 MB',
    pageCount: 180,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'অনলাইন লাইব্রেরি ব্যবস্থাপনা, ক্যাটালগিং ও গ্রামীণ পর্যায়ে লাইব্রেরির ডিজিটাল রূপান্তরের নির্দেশিকা।',
    downloadCount: 342,
    readCount: 1250,
    sampleContentText: `অধ্যায় ১: ডিজিটাল লাইব্রেরির প্রয়োজনীয়তা
একুশ শতকে তথ্যপ্রযুক্তির অভাবনীয় বিকাশের ফলে বিশ্বজুড়ে জ্ঞানার্জনের প্রক্রিয়া পাল্টে গেছে। গ্রামীণ ও মফস্বল এলাকার তরুণ সমাজের হাতে বই পৌঁছে দেওয়ার অন্যতম শ্রেষ্ঠ মাধ্যমে পরিণত হয়েছে ডিজিটাল ই-বুক লাইব্রেরি।

Speaker Abdul Jabbar Khan Memorial Public Library ২০০১ সাল থেকে বাবুগঞ্জ উপজেলায় জ্ঞানের আলো ছড়িয়ে আসছে। আজ ডিজিটাল প্রযুক্তির সমন্বয়ে আমরা সাধারণ পাঠকদের হাতের মুঠোয় নিয়ে এসেছি হাজার হাজার সাহিত্য, প্রযুক্তি ও রেফারেন্স গ্রন্থ।`
  },
  {
    id: 'dig_2',
    title: 'কৃষি ও প্রাকৃতিক সম্পদ ব্যবস্থাপনা',
    titleEn: 'Agriculture & Natural Resources',
    author: 'কৃষিবিদ ড. এন কে খান',
    category: 'Agriculture',
    coverUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400',
    fileSize: '6.8 MB',
    pageCount: 210,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'বরিশাল ও উপকূলীয় অঞ্চলের আধুনিক জৈব কৃষি, ফল চাষ ও মৎস্য চাষের বাস্তবসম্মত ই-বুক।',
    downloadCount: 189,
    readCount: 620,
    sampleContentText: `সূচিপত্র:
১. ধান চাষে আধুনিক প্রযুক্তির ব্যবহার
২. দক্ষিণ অঞ্চলের লবণাক্ততা সহনশীল ফসল
৩. পারিবারিক সবজি বাগান ও পুষ্টি নিরাপত্তা
৪. সমন্বিত মাছ ও হাঁস-মুরগি পালন পদ্ধতি`
  },
  {
    id: 'dig_3',
    title: 'ওয়েব ডেভেলপমেন্ট উইথ রিয়্যাক্ট ও টাইপস্ক্রিপ্ট',
    titleEn: 'Web Development with React & TypeScript',
    author: 'ইঞ্জিনিয়ার সাব্বির হোসেন',
    category: 'Programming',
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    fileSize: '8.5 MB',
    pageCount: 320,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'আধুনিক ফুলস্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরির মৌলিক ও অগ্রসর ধারণা বাংলায় ব্যাখ্যা করা হয়েছে।',
    downloadCount: 512,
    readCount: 1890,
    sampleContentText: `রিয়্যাক্ট (React) ও টাইপস্ক্রিপ্ট (TypeScript) ব্যবহার করে অত্যন্ত সুসংগঠিত ও স্কেলেবল ওয়েব অ্যাপ নির্মাণের জন্য টাইপ সেফটি ও কম্পোনেন্ট আর্কিটেকচার বোঝা অত্যন্ত জরুরি...`
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not_1',
    title: 'বার্ষিক বই পড়া প্রতিযোগিতা ২০২৬ ও বই বিতরণ কর্মসূচি',
    titleEn: 'Annual Book Reading Competition 2026',
    content: "Speaker Abdul Jabbar Khan Memorial Public Library's উদ্যোগে বাবুগঞ্জ উপজেলার সকল স্কুল ও কলেজের শিক্ষার্থীদের জন্য বার্ষিক বই পড়া প্রতিযোগিতার রেজিস্ট্রেশন শুরু হয়েছে। আগামী ১৫ আগস্ট ২০২৬ তারিখে সমাপনী অনুষ্ঠান ও পুরস্কার বিতরণ করা হবে।",
    date: '২০২৬-০৭-১০',
    category: 'Event',
    pinned: true
  },
  {
    id: 'not_2',
    title: 'লাইব্রেরি ডিজিটাল ই-বুক সেবা উন্মুক্তকরণ',
    titleEn: 'Digital E-Book Service Launch',
    content: 'সুসংবাদ! আমাদের লাইব্রেরির ওয়েবসাইট থেকে এখন যেকোনো নিবন্ধিত সদস্য বিনামূল্যে ৫০টিরও বেশি তথ্যপ্রযুক্তি ও গবেষণামূলক ই-বুক পড়তে ও ডাউনলোড করতে পারবেন।',
    date: '২০২৬-০৬-২০',
    category: 'General',
    pinned: true
  },
  {
    id: 'not_3',
    title: 'পবিত্র ঈদুল আজহা উপলক্ষে লাইব্রেরি বন্ধের বিজ্ঞপ্তি',
    titleEn: 'Eid Holiday Announcement',
    content: 'পবিত্র ঈদুল আজহা উপলক্ষে আগামী ১৫ জুন হতে ১৮ জুন পর্যন্ত লাইব্রেরির পাঠ কক্ষ বন্ধ থাকিবে। ১৯ জুন যথারীতি সকাল ৯:০০ টায় পুনরায় খোলা হইবে।',
    date: '২০২৬-০৬-১২',
    category: 'Holiday',
    pinned: false
  }
];

export const INITIAL_EVENTS: LibraryEvent[] = [
  {
    id: 'evt_1',
    title: 'মহান বিজয় দিবস ও জাতীয় বইমেলা ২০২৬',
    titleEn: 'Victory Day Book Fair 2026',
    description: 'লাইব্রেরি প্রাঙ্গণে ৩ দিনব্যাপী বইমেলা, কবিতা আবৃত্তি প্রতিযোগিতা ও মুক্তিযুদ্ধভিত্তিক আলোকচিত্র প্রদর্শনী।',
    date: '২০২৬-১২-১৬',
    time: 'সকাল ১০:০০ - রাত ৮:০০',
    location: 'লাইব্রেরি মিলনায়তন ও উন্মুক্ত প্রাঙ্গণ, ভূতেরদিয়া, বাবুগঞ্জ',
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600',
    organizer: 'লাইব্রেরি ব্যবস্থাপনা কমিটি',
    featured: true
  },
  {
    id: 'evt_2',
    title: 'তরুণ উদ্যোক্তা ও আইসিটি দক্ষতা উন্নয়ন কর্মশালা',
    titleEn: 'ICT & Entrepreneurship Workshop',
    description: 'স্থানীয় তরুণ-তরুণীদের বিনামূল্যে ফ্রিল্যান্সিং, প্রাথমিক প্রোগ্রামিং ও তথ্যপ্রযুক্তি প্রশিক্ষণের বিশেষ একদিনের কর্মশালা।',
    date: '২০২৬-০৮-২৫',
    time: 'বিকাল ৩:০০ - ৬:০০',
    location: 'ডিজিটাল কম্পিউটার ল্যাব, Speaker Abdul Jabbar Khan লাইব্রেরি',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
    organizer: 'ডিজিটাল আইসিটি উইং',
    featured: true
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal_1',
    title: 'লাইব্রেরির আধুনিক পাঠ কক্ষ',
    titleEn: 'Modern Library Reading Hall',
    category: 'Library',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600',
    date: '২০২৬-০৫-১০',
    description: 'শান্ত ও নিরিবিলি পরিবেশে পাঠকদের জন্য সুসজ্জিত পাঠ কক্ষ।'
  },
  {
    id: 'gal_2',
    title: 'প্রতিষ্ঠাতা জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধার বই উদ্বোধন',
    titleEn: 'Book Inauguration by Founder',
    category: 'Guests',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600',
    date: '২০২৫-১২-০১',
    description: 'নতুন বই সংযোজন অনুষ্ঠানে বক্তব্য রাখছেন লাইব্রেরির সম্মানিত প্রতিষ্ঠাতা।'
  },
  {
    id: 'gal_3',
    title: 'কিশোর বই পাঠ প্রতিযোগিতা',
    titleEn: 'Children Reading Competition',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
    date: '২০২৫-০৩-২৬',
    description: 'বিজয়ী শিক্ষার্থীদের মাঝে সনদ ও উপহার সামগ্রী বিতরণ।'
  },
  {
    id: 'gal_4',
    title: 'লাইব্রেরির সমৃদ্ধ গ্রন্থগার সেলফ',
    titleEn: 'Rich Book Shelves',
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600',
    date: '২০২৪-১১-১৫',
    description: 'দুর্লভ ও আধুনিক সাহিত্যের সুবিন্যস্ত সংগ্রহ।'
  }
];

export const INITIAL_DONORS: DonorMember[] = [
  {
    id: 'dn_1',
    name: 'জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধা',
    designation: 'প্রতিষ্ঠাতা ও প্রধান পৃষ্ঠপোষক',
    donorCategory: 'Chief Sponsor',
    contribution: 'জমি দান, ভবন নির্মাণ ও প্রধান গ্রন্থ তহবিল',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    joinDate: '০১ জানুয়ারি ২০০১'
  },
  {
    id: 'dn_2',
    name: 'আলহাজ্ব গোলাম মোস্তফা খান',
    designation: 'বিশিষ্ট সমাজসেবক ও দানবীর',
    donorCategory: 'Patron',
    contribution: 'ডিজিটাল কম্পিউটার ল্যাব ও আসবাবপত্র',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    joinDate: '১৫ মার্চ ২০১০'
  },
  {
    id: 'dn_3',
    name: 'ড. রাশেদা বেগম',
    designation: 'সাবেক শিক্ষাবিদ, বরিশাল বিশ্ববিদ্যালয়',
    donorCategory: 'Life Member',
    contribution: '১,০০০+ বিরল রেফারেন্স গ্রন্থ ও মুক্তিযুদ্ধ লাইব্রেরি সেলফ',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    joinDate: '১০ নভেম্বর ২০১৫'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    question: "Speaker Abdul Jabbar Khan Memorial Public Library's সদস্য হওয়ার নিয়ম কী?",
    questionEn: 'How to become a member of the library?',
    answer: 'ওয়েবসাইটের "রেজিস্ট্রেশন" পাতায় গিয়ে আপনার নাম, ইমেইল, মোবাইল নম্বর ও ঠিকানা পূরণ করে সদস্য হিসেবে সাইন আপ করুন। সফল রেজিস্ট্রেশনের সাথে সাথে আপনি একটি ইউনিক ডিজিটাল মেম্বারশিপ কার্ড ও নম্বর পাবেন।',
    answerEn: 'Fill out your name, email, phone, and address on the Registration page. You will instantly get a unique digital membership ID card.',
    category: 'Membership'
  },
  {
    id: 'faq_2',
    question: 'একসাথে কয়টি বই কতদিনের জন্য ধার নেয়া যায়?',
    questionEn: 'How many books can I borrow and for how long?',
    answer: 'সাধারণ সদস্যরা একসাথে সর্ব্বোচ্চ ২টি বই ১৪ দিনের জন্য বাড়ি নিয়ে পড়ার উদ্দেশ্যে ধার নিতে পারবেন। নির্দিষ্ট সময়সীমার পূর্বে অনলাইনে পুনর্নবীকরণ (Renew) করার সুযোগ রয়েছে।',
    answerEn: 'General members can borrow up to 2 books for 14 days. Renewal is available before due date.',
    category: 'Borrowing'
  },
  {
    id: 'faq_3',
    question: 'বই বিলম্বে ফেরত দিলে বা বিলম্ব ফি (Fine) কীভাবে নির্ধারিত হয়?',
    questionEn: 'What is the late return fine policy?',
    answer: 'নির্ধারিত মেয়াদের পর প্রতিদিনের জন্য বই প্রতি ২ টাকা হারে বিলম্ব ফি ধার্য করা হয়। আপনার ড্যাশবোর্ড থেকে জমাকৃত ফি সংক্রান্ত তথ্য দেখা যাবে।',
    answerEn: 'A fine of 2 BDT per day per book is levied for late returns.',
    category: 'Fines'
  },
  {
    id: 'faq_4',
    question: 'ডিজিটাল ই-বুক কীভাবে পড়া বা ডাউনলোড করা যাবে?',
    questionEn: 'How to read or download Digital E-books?',
    answer: 'ওয়েবসাইটের "ডিজিটাল লাইব্রেরি" ট্যাবে গিয়ে আপনার পছন্দের ই-বুকের ওপর ক্লিক করুন। আপনি ব্রাউজারে সরাসরি পড়তে পারবেন অথবা ডাউনলোড করে সংরক্ষণ করতে পারবেন।',
    answerEn: 'Go to the Digital Library page and click on any book to read online or download.',
    category: 'Digital'
  }
];

export const INITIAL_BORROW_RECORDS: BorrowRecord[] = [
  {
    id: 'brw_1',
    bookId: 'bk_1',
    bookTitle: 'একাত্তরের দিনগুলি',
    userId: 'usr_member_1',
    userName: 'তানজিম আহমেদ',
    userEmail: 'member@sajkspla.org',
    userMemberId: 'SAJKS-M-1001',
    issueDate: '2026-07-01',
    dueDate: '2026-07-15',
    status: 'overdue',
    fineAmount: 12,
    finePaid: false,
    issuedBy: 'আব্দুর রহমান (গ্রন্থাগারিক)'
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res_1',
    bookId: 'bk_3',
    bookTitle: 'পাইথন দিয়ে প্রোগ্রামিং শেখা',
    bookCover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
    userId: 'usr_member_1',
    userName: 'তানজিম আহমেদ',
    userMemberId: 'SAJKS-M-1001',
    reservationDate: '2026-07-18',
    status: 'approved',
    notes: 'সংগ্রহের শেষ তারিখ: ২৪ জুলাই ২০২৬'
  }
];

export const INITIAL_FINES: FineRecord[] = [
  {
    id: 'fn_1',
    userId: 'usr_member_1',
    userName: 'তানজিম আহমেদ',
    borrowId: 'brw_1',
    bookTitle: 'একাত্তরের দিনগুলি',
    amount: 12,
    reason: '৬ দিন বিলম্বিত সমর্পণ ফি',
    date: '2026-07-16',
    status: 'unpaid'
  }
];

export const INITIAL_SITE_INFO: SiteInfo = {
  libraryName: 'Speaker Abdul Jabbar Khan Memorial Public Library',
  foundingDate: '০১ জানুয়ারি ২০০১',
  address: 'গ্রাম: ভূতেরদিয়া, ডাকঘর: ভূতেরদিয়া, উপজেলা: বাবুগঞ্জ, জেলা: বরিশাল, বাংলাদেশ।',
  email: 'sajkspla@gmail.com',
  phone: '+৮৮০ ১৭১১-০০০০০১',
  hours: 'শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - রাত ৮:০০ (শুক্রবার সাপ্তাহিক ছুটি)',
  aboutIntro: 'Speaker Abdul Jabbar Khan Memorial Public Library ২০০১ সালের ১ জানুয়ারি বরিশাল জেলার বাবুগঞ্জ উপজেলার ঐতিহ্যবাহী ভূতেরদিয়া গ্রামে প্রতিষ্ঠিত হয়। সমাজসেবক ও শিক্ষা অনুরাগী জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধার ব্যক্তিগত উদ্যোগ ও স্থানীয় শিক্ষাবিদদের নিরলস প্রচেষ্টায় এই লাইব্রেরি যাত্রা শুরু করে।',
  mission: 'প্রান্তিক জনগোষ্ঠী ও শিক্ষার্থীদের হাতের নাগালে আধুনিক ও মানসম্মত গ্রন্থ পৌঁছে দেওয়া, বই পড়ার সামাজিক চর্চা পুনরুজ্জীবিত করা এবং ডিজিটাল তথ্যপ্রযুক্তির সহায়তায় গ্রামীণ পর্যায়ে মুক্তবুদ্ধির চর্চা বিকাশ করা।',
  vision: 'একটি আধুনিক সমৃদ্ধ স্বয়ংসম্পূর্ণ ডিজিটাল স্মার্ট লাইব্রেরি হিসেবে আত্মপ্রকাশ করা, যা পুরো দক্ষিণ অঞ্চলে তথ্য ও গবেষণার ক্ষেত্রে এক অনন্য দৃষ্টান্ত স্থাপন করবে।',
  facilities: [
    '১০,০০০+ বৈচিত্র্যময় সাহিত্যের ক্যাটালগ',
    'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত আধুনিক পাঠ কক্ষ',
    'ই-বুক ও ডিজিটাল ফাইল আর্কাইভ',
    'বিনামূল্যে উচ্চগতির ওয়াইফাই ইন্টারনেট',
    'ডিজিটাল কম্পিউটার ট্রেনিং কর্নার',
    'বঙ্গবন্ধু ও মুক্তিযুদ্ধ বিশেষ কর্নার'
  ],
  mapInfo: 'বাবুগঞ্জ উপজেলা সদর হতে মাত্র ৩ কি.মি. উত্তর-পূর্বে ভূতেরদিয়া বাসস্ট্যান্ড সংলগ্ন।',
  founder: {
    name: 'জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধা',
    designation: 'প্রতিষ্ঠাতা ও প্রধান উপদেষ্টা',
    address: 'গ্রাম: ভূতেরদিয়া, বাবুগঞ্জ, বরিশাল',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    quote: 'জ্ঞানের চেয়ে বড় সম্পদ মানুষের জীবনে দ্বিতীয়টি নেই। একটি ভালো বই একটি মানুষের চিন্তা-চেতনা ও সমগ্র ভবিষ্যৎ বদলে দিতে পারে। ভূতেরদিয়া গ্রামে এই পাবলিক লাইব্রেরি কেবল ইট-পাথরের কোনো ঘর নয়, এটি আমাদের পরবর্তী প্রজন্মের স্বপ্ন বুুননের বাতিঘর।',
    bio1: 'জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধা বরিশাল জেলার বাবুগঞ্জ উপজেলার এক সম্ভ্রান্ত ও শিক্ষানুরাগী পরিবারে জন্মগ্রহণ করেন। প্রথম জীবন থেকেই তিনি সামাজিক ও শিক্ষামূলক অগ্রগতির কাজে নিজেকে নিয়োজিত রাখেন।',
    bio2: '২০০১ সালে নিজের জমিতে তিনি নিজ অর্থায়নে "Speaker Abdul Jabbar Khan Memorial Public Library" গড়ে তোলেন। পরবর্তীতে তিনি একক প্রচেষ্টায় বহু বই সংগ্রহ, লাইব্রেরির আসবাবপত্র তৈরি ও গ্রামীণ শিক্ষার্থীদের বিনামূল্যে পাঠদানের সুযোগ সৃষ্টি করেন।'
  }
};

export const INITIAL_MILESTONES: MilestoneItem[] = [
  {
    id: 'ms_1',
    year: '০১ জানুয়ারি ২০০১',
    title: 'লাইব্রেরির শুভ সুচনা',
    desc: 'জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধার নিজস্ব অর্থায়ন ও ভূমিতে একটি সাধারণ মাটির পাঠাগার ঘর হিসেবে পথচলা শুরু।'
  },
  {
    id: 'ms_2',
    year: '২০০৫ - ২০০৮',
    title: 'গ্রন্থাগার ভবন উন্নয়ন ও বই সংগ্রহ',
    desc: 'স্থানীয় দাতা সদস্য ও এলাকাবাসীর সহায়তায় পাকার অবকাঠামো তৈরি এবং ৩,০০০-এর বেশি বই সংগ্রহ করা হয়।'
  },
  {
    id: 'ms_3',
    year: '২০১৫',
    title: 'কম্পিউটার ও ডিজিটাল শিক্ষা সংযোজন',
    desc: 'পাঠকদের সুবিধার জন্য লাইব্রেরিতে প্রাথমিক ইন্টারনেট ও ৫টি কম্পিউটারের ট্রেনিং ল্যাব চালু হয়।'
  },
  {
    id: 'ms_4',
    year: '২০২১',
    title: 'মুক্তিযুদ্ধ ও বঙ্গবন্ধু কর্নার প্রতিষ্ঠা',
    desc: 'স্বাধীনতার সুবর্ণজয়ন্তীতে ১,০০০-এর বেশি মুক্তিযুদ্ধবিষয়ক গবেষণামূলক দুর্লভ বই সমৃদ্ধ সুনির্দিষ্ট কর্নার তৈরি।'
  },
  {
    id: 'ms_5',
    year: '২০২৬',
    title: 'ডিজিটাল লাইব্রেরি ম্যানেজমেন্ট সিস্টেম চালুকরণ',
    desc: 'সম্পূর্ণ অটোমেটেড ওয়েব ভিত্তিক ডিজিটাল ক্যাটালগ, অনলাইন ই-বুক রিডার ও কিউআর মেম্বারশিপ সার্ভিস চালু।'
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-09-01T08:30:15.000Z',
    action: 'SYSTEM_BOOT',
    category: 'SYSTEM',
    severity: 'SUCCESS',
    actor: {
      name: 'System Core Engine',
      email: 'system@sajkspla.org',
      role: 'SYSTEM',
      ip: '127.0.0.1 (Local Server)',
      userAgent: 'SAJKSPLA Library Engine v2.4'
    },
    details: 'লাইব্রেরি ডাটাবেজ সার্ভিস ও অডিট লগিং সফলভাবে চালু হয়েছে। মোট ক্যাশ ও মিডিয়া ভেরিফাইড।'
  },
  {
    id: 'log_002',
    timestamp: '2026-09-01T09:12:44.000Z',
    action: 'USER_LOGIN',
    category: 'AUTH',
    severity: 'INFO',
    actor: {
      id: 'usr_admin_01',
      name: 'মোঃ কামরুল হাসান',
      email: 'admin@sajkspla.org',
      role: 'ADMIN',
      ip: '103.145.112.45 (Dhaka, Bangladesh)',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0'
    },
    details: 'অ্যাডমিন ড্যাশবোর্ডে সফলভাবে লগইন সম্পন্ন করেছেন।'
  },
  {
    id: 'log_003',
    timestamp: '2026-09-01T10:05:20.000Z',
    action: 'BOOK_ISSUED',
    category: 'CIRCULATION',
    severity: 'SUCCESS',
    actor: {
      id: 'usr_admin_01',
      name: 'মোঃ কামরুল হাসান',
      email: 'admin@sajkspla.org',
      role: 'ADMIN',
      ip: '103.145.112.45 (Dhaka, Bangladesh)',
      userAgent: 'Chrome 128.0 (Windows)'
    },
    target: 'বই: একাত্তরের দিনগুলি | গ্রহীতা: মোঃ তানজিম আহমেদ (SAJKS-M-1001)',
    details: 'সদস্য মোঃ তানজিম আহমেদ-কে "একাত্তরের দিনগুলি" বইটি ১৪ দিনের জন্য ইস্যু করা হয়েছে।'
  },
  {
    id: 'log_004',
    timestamp: '2026-09-01T11:22:10.000Z',
    action: 'PASSWORD_CHANGED',
    category: 'AUTH',
    severity: 'INFO',
    actor: {
      id: 'usr_member_01',
      name: 'মোঃ তানজিম আহমেদ',
      email: 'member@sajkspla.org',
      role: 'MEMBER',
      ip: '103.205.71.18 (Barisal, Bangladesh)',
      userAgent: 'Mobile Safari / iOS 17.5'
    },
    details: 'সদস্য মোঃ তানজিম আহমেদ নিজের অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করেছেন।'
  },
  {
    id: 'log_005',
    timestamp: '2026-09-01T12:40:00.000Z',
    action: 'CATALOG_BOOK_ADDED',
    category: 'CATALOG',
    severity: 'SUCCESS',
    actor: {
      id: 'usr_admin_01',
      name: 'মোঃ কামরুল হাসান',
      email: 'admin@sajkspla.org',
      role: 'ADMIN',
      ip: '103.145.112.45 (Dhaka, Bangladesh)'
    },
    target: 'বই: Artificial Intelligence & Future (AI)',
    details: 'নতুন বই ক্যাটালগে যুক্ত হয়েছে। শেলফ নম্বর: SL-TECH-04, কপি: ৫টি।'
  },
  {
    id: 'log_006',
    timestamp: '2026-09-01T14:15:30.000Z',
    action: 'BACKUP_EXPORTED',
    category: 'SYSTEM',
    severity: 'INFO',
    actor: {
      id: 'usr_admin_01',
      name: 'মোঃ কামরুল হাসান',
      email: 'admin@sajkspla.org',
      role: 'ADMIN',
      ip: '103.145.112.45 (Dhaka, Bangladesh)'
    },
    details: 'সম্পূর্ণ লাইব্রেরি ডাটাবেজ ব্যাকআপ (JSON) সফলভাবে ডাউনলোড ও আর্কাইভ করা হয়েছে।'
  }
];



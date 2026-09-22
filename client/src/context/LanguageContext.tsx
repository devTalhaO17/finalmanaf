import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  libraryName: {
    bn: 'Speaker Abdul Jabbar Khan Memorial Public Library',
    en: 'Speaker A. Jabbar Khan Smriti Public Library'
  },
  established: {
    bn: 'স্থাপিত: ০১ জানুয়ারি ২০০১',
    en: 'Established: 01 January 2001'
  },
  address: {
    bn: 'গ্রাম: ভূতেরদিয়া, ডাকঘর: ভূতেরদিয়া, উপজেলা: বাবুগঞ্জ, জেলা: বরিশাল, বাংলাদেশ',
    en: 'Village: Bhuterdia, Post: Bhuterdia, Upazila: Babuganj, District: Barishal, Bangladesh'
  },
  motto: {
    bn: 'জ্ঞানই শক্তি — বই হোক সকলের বন্ধু',
    en: 'Knowledge is Power — Let Books be Everyone\'s Friend'
  },
  founder: {
    bn: 'জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধা',
    en: 'Mr. Md. Nurul Islam (Manik) Mridha'
  },
  home: { bn: 'হোম', en: 'Home' },
  about: { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
  history: { bn: 'ইতিহাস', en: 'History' },
  founderNav: { bn: 'প্রতিষ্ঠাতা', en: 'Founder' },
  donorsNav: { bn: 'দাতা সদস্যবৃন্দ', en: 'Donors' },
  booksNav: { bn: 'বইয়ের তালিকা', en: 'Books Catalog' },
  digitalLibraryNav: { bn: 'ডিজিটাল লাইব্রেরি', en: 'Digital E-Library' },
  noticesNav: { bn: 'নোটিশ বোর্ড', en: 'Notices' },
  eventsNav: { bn: 'ইভেন্ট ও কার্যক্রম', en: 'Events' },
  galleryNav: { bn: 'গ্যালারি', en: 'Gallery' },
  contactNav: { bn: 'যোগাযোগ', en: 'Contact' },
  faqNav: { bn: 'প্রশ্নোত্তর', en: 'FAQ' },
  login: { bn: 'লগইন', en: 'Login' },
  register: { bn: 'রেজিস্ট্রেশন', en: 'Register' },
  logout: { bn: 'লগআউট', en: 'Logout' },
  dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },

  superAdmin: { bn: 'সুপার এডমিন', en: 'Super Admin' },
  libraryAdmin: { bn: 'লাইব্রেরি পরিচালক', en: 'Library Admin' },
  librarian: { bn: 'গ্রন্থাগারিক', en: 'Librarian' },
  member: { bn: 'সাধারণ সদস্য', en: 'Member' },

  searchPlaceholder: { bn: 'বইয়ের নাম, লেখক বা বিষয় দিয়ে খুঁজুন...', en: 'Search by book title, author, or subject...' },
  allCategories: { bn: 'সকল ক্যাটাগরি', en: 'All Categories' },
  filter: { bn: 'ফিল্টার', en: 'Filter' },
  clearFilter: { bn: 'রিসেট', en: 'Reset' },

  reserveBook: { bn: 'বই বুকিং করুন', en: 'Reserve Book' },
  readPdf: { bn: 'ই-বুক পড়ুন', en: 'Read E-Book' },
  downloadPdf: { bn: 'ডাউনলোড করুন', en: 'Download PDF' },
  viewDetails: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
  favorite: { bn: 'পছন্দের তালিকায় রাখুন', en: 'Add to Favorites' },
  available: { bn: 'প্রাপ্য কপি', en: 'Available Copies' },

  totalBooks: { bn: 'মোট সংগৃহীত বই', en: 'Total Books' },
  activeMembers: { bn: 'নিবন্ধিত সদস্য', en: 'Active Members' },
  digitalBooksCount: { bn: 'ডিজিটাল ই-বুক', en: 'Digital E-Books' },
  dailyReaders: { bn: 'দৈনিক পাঠক', en: 'Daily Visitors' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sajks_lang') as Language) || 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sajks_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

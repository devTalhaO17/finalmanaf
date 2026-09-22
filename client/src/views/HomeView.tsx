import React, { useState } from 'react';
import { ViewName, Book, Notice, LibraryEvent, GalleryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { storage } from '../lib/storage';
import { SafeImage } from '../components/common/SafeImage';
import { 
  BookOpen, 
  Search, 
  ArrowRight, 
  Calendar, 
  FileText, 
  Sparkles,
  Award,
  Layers
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewName) => void;
  onSelectBook: (book: Book) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectBook }) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const siteInfo = storage.getSiteInfo();
  const books = storage.getBooks();
  const digitalBooks = storage.getDigitalBooks();
  const users = storage.getUsers();
  const notices = storage.getNotices();
  const events = storage.getEvents();
  const gallery = storage.getGallery();

  const totalCopiesCount = books.reduce((acc, b) => acc + (b.quantity || 1), 0) || 78;
  const activeMembersCount = users.filter(u => u.status === 'active').length || 6;
  const digitalCount = digitalBooks.length || 3;

  const toBnNumber = (num: number, padZero = false) => {
    if (language === 'en') return String(padZero && num < 10 && num >= 0 ? `0${num}` : num);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    let str = String(num);
    if (padZero && num < 10 && num >= 0) {
      str = '0' + str;
    }
    return str.split('').map(char => bnDigits[Number(char)] ?? char).join('');
  };

  const featuredBooks: Book[] = books.length >= 4 ? books.slice(0, 4) : [
    {
      id: 'book-101',
      title: 'একাত্তরের দিনগুলি',
      titleEn: 'Ekattorer Dinguli',
      author: 'জাহানারা ইমাম',
      publisher: 'সন্ধানী প্রকাশনী',
      category: 'Liberation War',
      publicationYear: 1986,
      edition: '১ম সংস্করণ',
      language: 'Bangla',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=350',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=350',
      quantity: 5,
      availableCopies: 3,
      shelfNumber: 'LW-101',
      isbn: '978-984-465-101-2',
      barcode: 'BK-101'
    },
    {
      id: 'book-202',
      title: 'আমি তপু',
      titleEn: 'Ami Topu',
      author: 'মুহম্মদ জাফর ইকবাল',
      publisher: 'সময় প্রকাশন',
      category: 'Children',
      publicationYear: 2005,
      edition: '২য় সংস্করণ',
      language: 'Bangla',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=350',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=350',
      quantity: 4,
      availableCopies: 2,
      shelfNumber: 'CH-202',
      isbn: '978-984-465-202-9',
      barcode: 'BK-202'
    },
    {
      id: 'book-303',
      title: 'পদ্মা নদীর মাঝি',
      titleEn: 'Padma Nadir Majhi',
      author: 'মানিক বন্দ্যোপাধ্যায়',
      publisher: 'অনুপম প্রকাশনী',
      category: 'Novel',
      publicationYear: 1936,
      edition: 'ক্লাসিক',
      language: 'Bangla',
      coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=350',
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=350',
      quantity: 3,
      availableCopies: 2,
      shelfNumber: 'CL-303',
      isbn: '978-984-465-303-6',
      barcode: 'BK-303'
    },
    {
      id: 'book-404',
      title: 'দৃষ্টিপাত',
      titleEn: 'Drishtipat',
      author: 'যাযাবর',
      publisher: 'মিত্র ও ঘোষ',
      category: 'Literature',
      publicationYear: 1946,
      edition: 'বিশেষ মুদ্রণ',
      language: 'Bangla',
      coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd8?auto=format&fit=crop&q=80&w=350',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd8?auto=format&fit=crop&q=80&w=350',
      quantity: 4,
      availableCopies: 3,
      shelfNumber: 'TR-404',
      isbn: '978-984-465-404-3',
      barcode: 'BK-404'
    }
  ];

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('books');
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="hero-card p-6 sm:p-10 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
          <div className="lg:col-span-7 hero-content">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 dark:bg-black/20 backdrop-blur-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E85D75] animate-pulse"></span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent)' }} className="text-xs sm:text-sm">
                স্থাপিত: ২০০১ • ভূতেরদিয়া, বাবুগঞ্জ, বরিশাল
              </span>
            </div>

            <h2 className="font-gaegu text-6xl sm:text-7xl lg:text-8xl text-[#2D2424] dark:text-[#FFF9F0] leading-none mb-2 select-none">
              জ্ঞানই শক্তি।
            </h2>

            <p className="font-serif text-lg sm:text-2xl text-[#2D2424]/85 dark:text-[#FFF9F0]/85 mb-4 font-semibold italic">
              "জ্ঞানই শক্তি — বই হোক সকলের বন্ধু"
            </p>

            <p className="text-sm sm:text-base text-[#2D2424]/75 dark:text-[#FFF9F0]/75 max-w-xl mb-6 leading-relaxed">
              গ্রামীণ জনপদে আলোর দিশারী হিসেবে গত ২৫ বছর যাবত নিরবচ্ছিন্ন জ্ঞান চর্চা, গবেষণা ও পাঠাভ্যাস প্রসারের এক অনন্য বাতিঘর।
            </p>

            <form onSubmit={handleHeroSearchSubmit} className="search-pill max-w-md mb-5">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? "বই খুঁজুন (নাম, লেখক বা বিষয়)..." : "Search books..."}
                className="text-xs sm:text-sm text-[#2D2424] dark:text-white placeholder:text-slate-400 font-medium"
              />
              <button type="submit" className="text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => onNavigate('books')} 
                className="btn btn-accent text-xs sm:text-sm py-2.5 px-5 rounded-full"
              >
                <BookOpen className="w-4 h-4" />
                <span>বইয়ের তালিকা ব্রাউজ</span>
              </button>
              <button 
                onClick={() => onNavigate('digital-library')} 
                className="btn btn-outline text-xs sm:text-sm py-2.5 px-5 rounded-full bg-white/60 dark:bg-black/30 border-[#2D2424] dark:border-white/30 text-[#2D2424] dark:text-white"
              >
                <span>ডিজিটাল ই-বুক ({toBnNumber(digitalCount)})</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600" 
                alt="Library Interior" 
                className="w-full max-w-[380px] rounded-[30px] shadow-2xl border-4 border-white/90 dark:border-[#261E20] -rotate-3 lg:-rotate-5 group-hover:rotate-0 transition-transform duration-500 object-cover aspect-4/3"
              />
              <div className="absolute -bottom-3 -right-3 bg-white dark:bg-[#261E20] px-4 py-2 rounded-2xl shadow-lg border border-black/5 dark:border-white/10 text-xs font-bold text-[#E85D75] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ঐতিহ্যের ২৫ বছর</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-floating -mt-8 sm:-mt-12 mb-12 relative z-10 flex flex-wrap gap-4 sm:gap-6 justify-center px-4">
        <div 
          onClick={() => onNavigate('books')}
          className="stat-bubble min-w-[130px] sm:min-w-[170px] cursor-pointer"
        >
          <b>{toBnNumber(totalCopiesCount)}</b>
          <div className="text-xs sm:text-sm font-bold text-[#2D2424] dark:text-[#FFF9F0] mt-1">
            {language === 'bn' ? 'বই' : 'Books'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">লাইব্রেরি সংগ্রহ</div>
        </div>

        <div 
          onClick={() => onNavigate('donors')}
          className="stat-bubble min-w-[130px] sm:min-w-[170px] cursor-pointer"
        >
          <b>{toBnNumber(activeMembersCount, true)}</b>
          <div className="text-xs sm:text-sm font-bold text-[#2D2424] dark:text-[#FFF9F0] mt-1">
            {language === 'bn' ? 'সদস্য' : 'Members'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">নিবন্ধিত পাঠক</div>
        </div>

        <div 
          onClick={() => onNavigate('digital-library')}
          className="stat-bubble min-w-[130px] sm:min-w-[170px] cursor-pointer"
        >
          <b>{toBnNumber(digitalCount, true)}</b>
          <div className="text-xs sm:text-sm font-bold text-[#2D2424] dark:text-[#FFF9F0] mt-1">
            {language === 'bn' ? 'ই-বুক' : 'E-Books'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">অনলাইন পাঠাগার</div>
        </div>

        <div 
          onClick={() => onNavigate('history')}
          className="stat-bubble min-w-[130px] sm:min-w-[170px] cursor-pointer"
        >
          <b>{toBnNumber(25)}+</b>
          <div className="text-xs sm:text-sm font-bold text-[#2D2424] dark:text-[#FFF9F0] mt-1">
            {language === 'bn' ? 'বছর' : 'Years'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">সেবা ও ঐতিহ্য</div>
        </div>
      </div>

      <div className="books-section mt-12 mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-bold text-[#E85D75] uppercase tracking-wider">
              Featured Books / নির্বাচিত বইসমূহ
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2424] dark:text-[#FFF9F0] mt-1">
              পাঠকদের পছন্দের বইয়ের তালিকা
            </h3>
          </div>
          <button 
            onClick={() => onNavigate('books')} 
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E85D75] hover:underline"
          >
            <span>সব বই দেখুন ({toBnNumber(books.length)})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="book-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book, idx) => (
            <div 
              key={book.id || idx}
              onClick={() => onSelectBook(book)}
              className="book-card cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-3/4 rounded-[16px] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative">
                  <SafeImage
                    src={book.coverImage || book.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=350"}
                    alt={book.title}
                    category="book"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E85D75] text-white shadow-xs">
                    {book.shelfNumber || `BK-${100 + idx}`}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {book.category}
                  </span>
                  <h4 className="font-bold text-base text-[#2D2424] dark:text-white line-clamp-1 group-hover:text-[#E85D75] transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {book.author}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  সহজলভ্য: {toBnNumber(book.availableCopies || 2)} কপি
                </span>
                <span className="text-[#E85D75] group-hover:translate-x-1 transition-transform">
                  বিস্তারিত →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="founder-strip mt-12 mb-14">
        <img 
          src={siteInfo.founder?.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250"} 
          alt={siteInfo.founder?.name || 'প্রতিষ্ঠাতা'} 
          className="founder-img"
        />
        <div className="space-y-2 flex-1 text-center sm:text-left">
          <span className="text-xs font-bold text-[#F4D35E] uppercase tracking-wider">
            Founder & Patron / প্রতিষ্ঠাতা ও পৃষ্ঠপোষক
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
            {siteInfo.founder?.name || 'জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধা'}
          </h3>
          <p className="text-sm sm:text-base text-white/80 italic font-serif leading-relaxed max-w-2xl pt-1">
            "বইয়ের আলো পৌঁছে যাক প্রতিটি ঘরে, জ্ঞানভিত্তিক সমাজ গঠনে আমরা অঙ্গিকারাবদ্ধ"
          </p>
          <div className="pt-3">
            <button
              onClick={() => onNavigate('founder')}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#E85D75] text-white hover:opacity-90 transition-all inline-flex items-center gap-1.5"
            >
              <span>প্রতিষ্ঠাতার জীবনী ও দর্শন পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
              নোটিশ বোর্ড
            </h4>
            <button onClick={() => onNavigate('notices')} className="text-xs font-bold text-[#E85D75] hover:underline">
              সকল নোটিশ →
            </button>
          </div>

          <div onClick={() => onNavigate('notices')} className="notice-item cursor-pointer hover:border-[#E85D75] transition-all">
            <div className="text-[10px] font-bold text-[#E85D75] uppercase tracking-wider">২০২৬-০৭-১০ / প্রতিযোগিতা</div>
            <div className="font-bold text-sm text-[#2D2424] dark:text-white mt-1">
              বার্ষিক বই পড়া প্রতিযোগিতা ২০২৬
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 mt-1">উপজেলা পর্যায়ের সকল শিক্ষার্থী ও সাধারণ পাঠকদের আমন্ত্রণ জানানো হচ্ছে।</p>
          </div>

          <div onClick={() => onNavigate('notices')} className="notice-item cursor-pointer hover:border-[#E85D75] transition-all">
            <div className="text-[10px] font-bold text-[#E85D75] uppercase tracking-wider">২০২৬-০৬-২০ / আপডেট</div>
            <div className="font-bold text-sm text-[#2D2424] dark:text-white mt-1">
              লাইব্রেরি ডিজিটাল ই-বুক সেবা উন্মুক্তকরণ
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 mt-1">এখন থেকে ঘরে বসেই পাঠকরা যেকোনো ই-বুক পড়তে ও বিবরণ দেখতে পারবেন।</p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
              আসন্ন ইভেন্ট
            </h4>
            <button onClick={() => onNavigate('events')} className="text-xs font-bold text-[#E85D75] hover:underline">
              সকল ইভেন্ট →
            </button>
          </div>

          <div onClick={() => onNavigate('events')} className="event-card cursor-pointer hover:shadow-md transition-all">
            <div className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F4D35E]/40 text-[#2D2424] dark:text-amber-200">
              ১৬ ডিসেম্বর ২০২৬
            </div>
            <div className="font-bold text-sm text-[#2D2424] dark:text-white mt-2">
              মহান বিজয় দিবস ও বার্ষিক জাতীয় বইমেলা
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#E85D75]" />
              <span>লাইব্রেরি প্রাঙ্গণ, ভূতেরদিয়া</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
              ফটোগ্যালারি
            </h4>
            <button onClick={() => onNavigate('gallery')} className="text-xs font-bold text-[#E85D75] hover:underline">
              গ্যালারি দেখুন →
            </button>
          </div>

          <div className="gallery-strip">
            <div onClick={() => onNavigate('gallery')} className="gallery-item cursor-pointer group">
              <img 
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=300" 
                alt="Library 1" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div onClick={() => onNavigate('gallery')} className="gallery-item cursor-pointer group">
              <img 
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=300" 
                alt="Library 2" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div onClick={() => onNavigate('gallery')} className="gallery-item cursor-pointer group">
              <img 
                src="https://images.unsplash.com/photo-1507842229452-7b172a153d61?auto=format&fit=crop&q=80&w=300" 
                alt="Library 3" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

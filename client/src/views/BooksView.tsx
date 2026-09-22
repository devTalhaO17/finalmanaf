import React, { useState, useMemo } from 'react';
import { Book, BookCategory, ViewName } from '../types';
import { storage } from '../lib/storage';
import { BookCard } from '../components/common/BookCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Search, Filter, RefreshCw, LayoutGrid, List, Check, BookOpen } from 'lucide-react';

interface BooksViewProps {
  onSelectBook: (book: Book) => void;
  onNavigate: (view: ViewName) => void;
}

const CATEGORIES: { id: BookCategory | 'All'; labelBn: string; labelEn: string }[] = [
  { id: 'All', labelBn: 'সকল ক্যাটাগরি', labelEn: 'All Categories' },
  { id: 'Novel', labelBn: 'উপন্যাস', labelEn: 'Novel' },
  { id: 'Story', labelBn: 'গল্প', labelEn: 'Story' },
  { id: 'Science', labelBn: 'বিজ্ঞান', labelEn: 'Science' },
  { id: 'Technology', labelBn: 'প্রযুক্তি', labelEn: 'Technology' },
  { id: 'History', labelBn: 'ইতিহাস', labelEn: 'History' },
  { id: 'Liberation War', labelBn: 'মুক্তিযুদ্ধ', labelEn: 'Liberation War' },
  { id: 'Religion', labelBn: 'ধর্মীয়', labelEn: 'Religion' },
  { id: 'Children', labelBn: 'শিশু-কিশোর', labelEn: 'Children' },
  { id: 'Literature', labelBn: 'সাহিত্য', labelEn: 'Literature' },
  { id: 'Poetry', labelBn: 'কবিতা', labelEn: 'Poetry' },
  { id: 'Reference', labelBn: 'রেফারেন্স', labelEn: 'Reference' },
  { id: 'Biography', labelBn: 'জীবনী', labelEn: 'Biography' },
  { id: 'Education', labelBn: 'শিক্ষা', labelEn: 'Education' },
  { id: 'Health', labelBn: 'স্বাস্থ্য', labelEn: 'Health' },
  { id: 'Agriculture', labelBn: 'কৃষি', labelEn: 'Agriculture' },
  { id: 'Computer Science', labelBn: 'কম্পিউটার সায়েন্স', labelEn: 'Computer Science' },
  { id: 'Programming', labelBn: 'প্রোগ্রামিং', labelEn: 'Programming' },
  { id: 'AI', labelBn: 'কৃত্রিম বুদ্ধিমত্তা', labelEn: 'AI' }
];

export const BooksView: React.FC<BooksViewProps> = ({ onSelectBook, onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'All'>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('All');
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  const [favorites, setFavorites] = useState<string[]>(() => 
    user ? storage.getFavorites(user.id) : []
  );

  const books = storage.getBooks();

  const publishers = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => set.add(b.publisher));
    return Array.from(set);
  }, [books]);

  const handleToggleFavorite = (bookId: string) => {
    if (!user) {
      showToast('পছন্দের তালিকায় রাখতে লগইন করুন', 'info');
      return;
    }
    const updated = storage.toggleFavorite(user.id, bookId);
    setFavorites(updated);
    showToast('পছন্দের তালিকা আপডেট হয়েছে', 'success');
  };

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        b.title.toLowerCase().includes(q) ||
        (b.titleEn && b.titleEn.toLowerCase().includes(q)) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.shelfNumber.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;

      const matchesLanguage = selectedLanguage === 'All' || b.language === selectedLanguage;

      const matchesPublisher = selectedPublisher === 'All' || b.publisher === selectedPublisher;

      const matchesAvailability = !availabilityOnly || b.availableCopies > 0;

      return matchesSearch && matchesCategory && matchesLanguage && matchesPublisher && matchesAvailability;
    });
  }, [books, searchQuery, selectedCategory, selectedLanguage, selectedPublisher, availabilityOnly]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setSelectedPublisher('All');
    setAvailabilityOnly(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>লাইব্রেরি পুস্তক সংগ্রহ ও ক্যাটালগ</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#E85D75]" />
              <span>বইয়ের তালিকা ও ক্যাটালগ</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Speaker Abdul Jabbar Khan Memorial Public Library's সকল বিষয়ভিত্তিক সমৃদ্ধ বই সংগ্রহ
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-xl font-extrabold text-[#F4D35E] block">{books.length}</span>
              <span className="text-[11px] font-medium text-white/75">মোট বই</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated p-5 sm:p-6 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বইয়ের নাম, লেখক, আইএসবিএন বা বিষয় দিয়ে খুঁজুন..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
            >
              <option value="All">সকল ভাষা (All Languages)</option>
              <option value="Bangla">বাংলা (Bangla)</option>
              <option value="English">ইংরেজি (English)</option>
            </select>
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
            >
              <option value="All">সকল প্রকাশক (All Publishers)</option>
              {publishers.map(pub => (
                <option key={pub} value={pub}>{pub}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 border-t border-black/5 dark:border-white/5 pt-3.5">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#E85D75] text-white shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-[#2D2424]/75 dark:text-white/75 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {cat.labelBn}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-black/5 dark:border-white/5">
          <label className="flex items-center gap-2 text-[#2D2424]/80 dark:text-[#FFF9F0]/80 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => setAvailabilityOnly(e.target.checked)}
              className="rounded text-[#E85D75] focus:ring-[#E85D75] w-4 h-4 accent-[#E85D75]"
            />
            <span>কেবলমাত্র প্রাপ্য বইসমূহ (Available Copies Only)</span>
          </label>

          <div className="flex items-center gap-4">
            <button
              onClick={resetFilters}
              className="text-slate-500 hover:text-[#E85D75] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট</span>
            </button>

            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${displayMode === 'grid' ? 'bg-[#E85D75] text-white shadow-xs' : 'text-slate-400'}`}
                title="গ্রিড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${displayMode === 'list' ? 'bg-[#E85D75] text-white shadow-xs' : 'text-slate-400'}`}
                title="লিস্ট ভিউ"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {filteredBooks.length === 0 ? (
        <div className="card-elevated p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
            কোনো বই পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500">

            আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন বই পাওয়া যায়নি। ফিল্টার রিসেট করে আবার চেষ্টা করুন।
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : displayMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={onSelectBook}
              isFavorite={favorites.includes(book.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
          {filteredBooks.map(book => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="p-4 hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded-md border shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    লেখক: {book.author} | ক্যাটাগরি: {book.category}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    প্রকাশক: {book.publisher} | সেলফ: {book.shelfNumber} | ISBN: {book.isbn}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {book.availableCopies > 0 ? `প্রাপ্য: ${book.availableCopies} কপি` : 'স্টক নেই'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

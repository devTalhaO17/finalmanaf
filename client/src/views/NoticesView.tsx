import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { FileText, Pin, Download, Search, Bell, Sparkles } from 'lucide-react';
import { useToast } from '../components/common/Toast';

export const NoticesView: React.FC = () => {
  const { showToast } = useToast();
  const notices = storage.getNotices();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(notices.map(n => n.category || 'General')))];

  const filtered = notices.filter(n => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || n.title.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q));
    const matchCat = selectedCategory === 'All' || n.category === selectedCategory;
    return matchQuery && matchCat;
  });

  const handlePrint = (title: string) => {
    showToast(`"${title}" নোটিশটি প্রিন্ট ভিউতে লোড করা হচ্ছে`, 'info');
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <Bell className="w-3.5 h-3.5" />
              <span>জরুরি বিজ্ঞপ্তি ও তথ্যকেন্দ্র</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-[#E85D75]" />
              <span>অফিসিয়াল নোটিশ বোর্ড</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              লাইব্রেরি পরিচালনা, বিশেষ সময়সূচী, পাঠক সেবা ও গুরুত্বপূর্ণ অনুষ্ঠান সম্পর্কিত সকল আনুষ্ঠানিক ঘোষণা
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[100px]">
              <span className="text-xl font-extrabold text-[#F4D35E] block">{notices.length}</span>
              <span className="text-[11px] font-medium text-white/75">মোট নোটিশ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোটিশ খুঁজুন..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#E85D75] text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-[#2D2424]/75 dark:text-white/75 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {cat === 'All' ? 'সকল নোটিশ' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card-elevated p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">কোনো নোটিশ পাওয়া যায়নি</p>
            <p className="text-xs">ভিন্ন শব্দ লিখে আবার চেষ্টা করুন</p>
          </div>
        ) : (
          filtered.map(notice => (
            <div
              key={notice.id}
              className={`card-elevated p-6 sm:p-7 relative transition-all ${
                notice.pinned 
                  ? 'ring-2 ring-[#E85D75]/40 dark:ring-[#E85D75]/60 bg-gradient-to-r from-transparent via-[#E85D75]/5 to-transparent' 
                  : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {notice.pinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#F4D35E]/30 dark:bg-[#F4D35E]/20 text-[#926C00] dark:text-[#F4D35E] px-2.5 py-1 rounded-lg border border-[#F4D35E]/50">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>পিন করা</span>
                    </span>
                  )}
                  <span className="badge-rose text-xs font-bold px-3 py-1 rounded-lg">
                    {notice.category || 'সাধারণ'}
                  </span>
                </div>
                <span className="text-xs font-mono font-medium text-slate-400 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  {notice.date}
                </span>
              </div>

              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2424] dark:text-[#FFF9F0] mb-3 leading-snug">
                {notice.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#2D2424]/80 dark:text-[#FFF9F0]/80 leading-relaxed whitespace-pre-line mb-5">
                {notice.content}
              </p>

              <div className="pt-3.5 flex flex-wrap justify-between items-center text-xs text-slate-400 border-t border-black/5 dark:border-white/5 gap-2">
                <span className="font-medium">প্রকাশক: লাইব্রেরি কর্তৃপক্ষ</span>
                <button 
                  onClick={() => handlePrint(notice.title)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E85D75] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / ডাউনলোড</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


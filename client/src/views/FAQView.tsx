import React, { useState } from 'react';
import { INITIAL_FAQS } from '../data/initialData';
import { HelpCircle, ChevronDown, Search, MessageSquare, Sparkles } from 'lucide-react';

export const FAQView: React.FC<{ onNavigate?: (view: any) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq_1');

  const filtered = INITIAL_FAQS.filter(faq => {
    const q = searchQuery.toLowerCase().trim();
    return !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div className="page-header-banner text-center">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E] mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সহায়তা ও প্রশ্নোত্তর কেন্দ্র</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
            <HelpCircle className="w-7 h-7 text-[#E85D75]" />
            <span>সাধারণ জিজ্ঞাসাবলী (FAQ)</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
            লাইব্রেরির সদস্যপদ, বই ধার নেওয়া, ই-বুক পড়া ও নিয়মাবলী সংক্রান্ত সাধারণ প্রশ্নের সমাধান
          </p>
        </div>
      </div>

      <div className="card-elevated p-2 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="প্রশ্ন বা বিষয় লিখে উত্তর খুঁজুন (যেমন: সদস্যপদ, বই ধার, জরিমানা)..."
          className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-transparent bg-transparent text-[#2D2424] dark:text-white focus:outline-none placeholder:text-slate-400 font-medium"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card-elevated p-12 text-center text-slate-400 space-y-2">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">কোনো উত্তর পাওয়া যায়নি</p>
            <p className="text-xs">অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন</p>
          </div>
        ) : (
          filtered.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`card-elevated overflow-hidden transition-all duration-300 ${
                  isOpen ? 'ring-2 ring-[#E85D75]/30' : ''
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left font-bold text-xs sm:text-sm text-[#2D2424] dark:text-[#FFF9F0] flex items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="font-serif leading-snug">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-[#E85D75] text-white rotate-180' : 'bg-black/5 dark:bg-white/5 text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2D2424]/80 dark:text-[#FFF9F0]/80 border-t border-black/5 dark:border-white/5 leading-relaxed bg-black/2 dark:bg-white/2">
                    <p className="mt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="card-elevated p-6 text-center space-y-3 bg-gradient-to-br from-white via-white to-[#F4D35E]/10 dark:from-[#261E20] dark:via-[#261E20] dark:to-[#382E16]/30">
        <MessageSquare className="w-6 h-6 text-[#E85D75] mx-auto" />
        <h3 className="font-serif text-base font-bold text-[#2D2424] dark:text-[#FFF9F0]">
          আপনার কাঙ্ক্ষিত প্রশ্নের উত্তর পাননি?
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          আমাদের হেল্পডেস্কে বার্তা পাঠান অথবা সরাসরি লাইব্রেরি চলাকালীন সময়ে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { SafeImage } from '../components/common/SafeImage';
import { Calendar, Clock, MapPin, Users, Sparkles, Search, ArrowUpRight } from 'lucide-react';
import { useToast } from '../components/common/Toast';

export const EventsView: React.FC = () => {
  const { showToast } = useToast();
  const events = storage.getEvents();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = events.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    return !q || e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q)) || (e.location && e.location.toLowerCase().includes(q));
  });

  const handleRegisterInterest = (title: string) => {
    showToast(`"${title}" ইভেন্টে আপনার আগ্রহ সংরক্ষিত হয়েছে। ধন্যবাদ!`, 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সাংস্কৃতিক ও শিক্ষামূলক অনুষ্ঠান</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Calendar className="w-7 h-7 text-[#E85D75]" />
              <span>ইভেন্ট ও কার্যক্রম</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              বইমেলা, তথ্যপ্রযুক্তি কর্মশালা, পাঠচক্র, কুইজ প্রতিযোগিতা ও সামাজিক সাংস্কৃতিক আয়োজন
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[100px]">
              <span className="text-xl font-extrabold text-[#F4D35E] block">{events.length}</span>
              <span className="text-[11px] font-medium text-white/75">মোট ইভেন্ট</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated p-4 flex items-center justify-between">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ইভেন্ট বা স্থান খুঁজুন..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card-elevated p-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">কোনো ইভেন্ট পাওয়া যায়নি</p>
            <p className="text-xs">অনুসন্ধান পরিবর্তন করে দেখুন</p>
          </div>
        ) : (
          filtered.map(evt => (
            <div
              key={evt.id}
              className="card-elevated overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-16/9 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <SafeImage
                    src={evt.imageUrl}
                    alt={evt.title}
                    category="event"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="badge-rose text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md bg-white/90 dark:bg-[#261E20]/90">
                      {evt.date}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#E85D75]" />
                      <span>{evt.time}</span>
                    </span>
                    <span className="badge-gold text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                      আসন্ন আয়োজন
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0] leading-snug group-hover:text-[#E85D75] transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#2D2424]/75 dark:text-[#FFF9F0]/75 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#E85D75] shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#F4D35E] shrink-0" />
                    <span>আয়োজক: {evt.organizer}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRegisterInterest(evt.title)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[#E85D75] hover:text-white dark:hover:bg-[#E85D75] dark:hover:text-white text-xs font-bold text-[#2D2424] dark:text-white transition-all flex items-center justify-center gap-2"
                >
                  <span>অংশগ্রহণের আগ্রহ প্রকাশ করুন</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


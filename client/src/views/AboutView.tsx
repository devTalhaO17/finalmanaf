import React, { useState } from 'react';
import { ViewName, SiteInfo } from '../types';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { BookOpen, Award, CheckCircle2, Sparkles, Edit, X, Save, Building2, Target, Compass } from 'lucide-react';

export const AboutView: React.FC<{ onNavigate: (view: ViewName) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'LIBRARY_ADMIN' || user.role === 'LIBRARIAN');

  const [siteInfo, setSiteInfo] = useState<SiteInfo>(() => storage.getSiteInfo());
  const [showModal, setShowModal] = useState(false);

  const [aboutIntro, setAboutIntro] = useState(siteInfo.aboutIntro);
  const [mission, setMission] = useState(siteInfo.mission);
  const [vision, setVision] = useState(siteInfo.vision);
  const [facilitiesStr, setFacilitiesStr] = useState(siteInfo.facilities.join('\n'));

  const handleOpenEdit = () => {
    setAboutIntro(siteInfo.aboutIntro);
    setMission(siteInfo.mission);
    setVision(siteInfo.vision);
    setFacilitiesStr(siteInfo.facilities.join('\n'));
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFacilities = facilitiesStr.split('\n').map(s => s.trim()).filter(Boolean);
    const updated: SiteInfo = {
      ...siteInfo,
      aboutIntro,
      mission,
      vision,
      facilities: updatedFacilities
    };
    storage.saveSiteInfo(updated);
    setSiteInfo(updated);
    setShowModal(false);
    showToast('আমাদের সম্পর্কে তথ্য সফলভাবে আপডেট করা হয়েছে', 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <Building2 className="w-3.5 h-3.5" />
              <span>ঐতিহ্য ও পরিচিতি</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#E85D75]" />
              <span>আমাদের সম্পর্কে</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              {siteInfo.libraryName} — গ্রামীণ জনপদে আলোকিত সমাজ বিনির্মাণে নিবেদিত এক বাতিঘর
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenEdit}
              className="btn btn-accent text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Edit className="w-4 h-4" />
              <span>তথ্য সম্পাদনা</span>
            </button>
          )}
        </div>
      </div>

      <div className="card-elevated p-6 sm:p-9 space-y-8">
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-3">
            <div className="w-2 h-6 bg-[#E85D75] rounded-full"></div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2424] dark:text-[#FFF9F0]">
              লাইব্রেরির সংক্ষিপ্ত পরিচিতি
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2D2424]/85 dark:text-[#FFF9F0]/85 leading-relaxed whitespace-pre-line font-normal">
            {siteInfo.aboutIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E85D75]/10 via-[#E85D75]/5 to-transparent border border-[#E85D75]/20 space-y-3">
            <div className="flex items-center gap-2.5 text-[#E85D75]">
              <Target className="w-5 h-5" />
              <h3 className="font-serif text-base sm:text-lg font-bold">আমাদের লক্ষ্য (Our Mission)</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#2D2424]/80 dark:text-[#FFF9F0]/80 leading-relaxed">
              {siteInfo.mission}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F4D35E]/15 via-[#F4D35E]/5 to-transparent border border-[#F4D35E]/30 space-y-3">
            <div className="flex items-center gap-2.5 text-[#926C00] dark:text-[#F4D35E]">
              <Compass className="w-5 h-5" />
              <h3 className="font-serif text-base sm:text-lg font-bold">আমাদের ভিশন (Our Vision)</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#2D2424]/80 dark:text-[#FFF9F0]/80 leading-relaxed">
              {siteInfo.vision}
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-3">
            <div className="w-2 h-6 bg-[#F4D35E] rounded-full"></div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2424] dark:text-[#FFF9F0]">
              লাইব্রেরির প্রধান সুবিধাসমূহ
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {siteInfo.facilities.map((fac, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl bg-black/3 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-3 text-xs font-medium text-[#2D2424]/85 dark:text-[#FFF9F0]/85"
              >
                <div className="w-6 h-6 rounded-full bg-[#E85D75]/15 text-[#E85D75] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-elevated max-w-lg w-full p-6 sm:p-7 relative my-8 shadow-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#261E20]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0] mb-5 border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#E85D75]" />
              <span>আমাদের সম্পর্কে তথ্য পরিবর্তন</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  লাইব্রেরির সংক্ষিপ্ত বিবরণ (About Intro)
                </label>
                <textarea
                  rows={4}
                  value={aboutIntro}
                  onChange={(e) => setAboutIntro(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  আমাদের লক্ষ্য (Our Mission)
                </label>
                <textarea
                  rows={3}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  আমাদের ভিশন (Our Vision)
                </label>
                <textarea
                  rows={3}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  প্রধান সুবিধাসমূহ (প্রতি লাইনে একটি করে সুবিধা লিখুন)
                </label>
                <textarea
                  rows={4}
                  value={facilitiesStr}
                  onChange={(e) => setFacilitiesStr(e.target.value)}
                  placeholder="১০,০০০+ বৈচিত্র্যময় সাহিত্যের ক্যাটালগ&#10;সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত আধুনিক পাঠ কক্ষ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 font-semibold rounded-xl text-slate-700 dark:text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="btn btn-accent text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Award, Quote, Edit, X, Save, Sparkles, User, Heart } from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ImageInputPicker } from '../components/common/ImageInputPicker';
import { SafeImage } from '../components/common/SafeImage';
import { FounderInfo } from '../types';

export const FounderView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'LIBRARY_ADMIN' || user.role === 'LIBRARIAN');

  const [siteInfo, setSiteInfo] = useState(() => storage.getSiteInfo());
  const [showEditModal, setShowEditModal] = useState(false);

  const [founderData, setFounderData] = useState<FounderInfo>(siteInfo.founder);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...siteInfo,
      founder: founderData
    };
    storage.saveSiteInfo(updated);
    setSiteInfo(updated);
    setShowEditModal(false);
    showToast('প্রতিষ্ঠাতার তথ্য ও ছবি সফলভাবে আপডেট করা হয়েছে', 'success');
  };

  const { founder } = siteInfo;

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>লাইব্রেরির স্বপ্নদ্রষ্টা ও প্রতিষ্ঠাতা</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Award className="w-7 h-7 text-[#E85D75]" />
              <span>প্রতিষ্ঠাতা জীবনী ও বাণী</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              {founder.name} — সমাজসেবক, শিক্ষানুরাগী ও জ্ঞানালোক প্রসারের মহান পথপ্রদর্শক
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setFounderData(siteInfo.founder);
                setShowEditModal(true);
              }}
              className="btn btn-accent text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Edit className="w-4 h-4" />
              <span>তথ্য ও ছবি সম্পাদনা</span>
            </button>
          )}
        </div>
      </div>

      <div className="card-elevated p-6 sm:p-10 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-[#E85D75] shadow-2xl mx-auto bg-slate-100 dark:bg-slate-800 ring-8 ring-[#E85D75]/10">
                <SafeImage
                  src={founder.photoUrl || 'img_founder_01'}
                  alt={founder.name}
                  category="founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 badge-gold text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                স্বপ্নদ্রষ্টা
              </div>
            </div>

            <div className="pt-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2424] dark:text-[#FFF9F0]">
                {founder.name}
              </h2>
              <p className="text-xs font-bold text-[#E85D75] mt-1">
                {founder.designation}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {founder.address}
              </p>
            </div>
          </div>

          <div className="md:col-span-8 space-y-5">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F4D35E]/15 via-[#F4D35E]/5 to-transparent border border-[#F4D35E]/30 relative">
              <Quote className="w-8 h-8 text-[#926C00] dark:text-[#F4D35E] opacity-40 absolute top-4 right-4" />
              <p className="font-serif text-sm sm:text-base font-medium italic text-[#2D2424] dark:text-[#FFF9F0] leading-relaxed relative z-10">
                "{founder.quote}"
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#2D2424]/85 dark:text-[#FFF9F0]/85 leading-relaxed">
              <div className="flex items-center gap-2.5 pb-1">
                <div className="w-2 h-5 bg-[#E85D75] rounded-full"></div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
                  জীবনসংগ্রাম ও সমাজসেবামূলক অবদান:
                </h3>
              </div>
              <p className="whitespace-pre-line">{founder.bio1}</p>
              <p className="whitespace-pre-line">{founder.bio2}</p>
            </div>
          </div>
        </div>

      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-elevated max-w-xl w-full p-6 sm:p-7 relative my-8 shadow-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#261E20]">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0] mb-5 border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#E85D75]" />
              <span>প্রতিষ্ঠাতার তথ্য ও ছবি পরিবর্তন</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <ImageInputPicker
                value={founderData.photoUrl}
                onChange={(url) => setFounderData({ ...founderData, photoUrl: url })}
                label="প্রতিষ্ঠাতার ছবি (Photo Upload / URL)"
                helpText="সরাসরি ডিভাইস থেকে ছবি ফাইল আপলোড করুন অথবা ছবি লিংক পেস্ট করুন"
                aspectRatio="square"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    প্রতিষ্ঠাতার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={founderData.name}
                    onChange={(e) => setFounderData({ ...founderData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    পদবি *
                  </label>
                  <input
                    type="text"
                    required
                    value={founderData.designation}
                    onChange={(e) => setFounderData({ ...founderData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  ঠিকানা
                </label>
                <input
                  type="text"
                  value={founderData.address}
                  onChange={(e) => setFounderData({ ...founderData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  প্রতিষ্ঠাতার বাণী / উদ্ধৃতি (Quote)
                </label>
                <textarea
                  rows={3}
                  value={founderData.quote}
                  onChange={(e) => setFounderData({ ...founderData, quote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  জীবনী (অনুচ্ছেদ ১)
                </label>
                <textarea
                  rows={3}
                  value={founderData.bio1}
                  onChange={(e) => setFounderData({ ...founderData, bio1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  অবদান (অনুচ্ছেদ ২)
                </label>
                <textarea
                  rows={3}
                  value={founderData.bio2}
                  onChange={(e) => setFounderData({ ...founderData, bio2: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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


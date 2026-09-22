import React, { useState } from 'react';
import { Mail, MapPin, Phone, Clock, Send, CheckCircle2, Edit, X, Save, Sparkles, MessageSquare, ExternalLink } from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { SiteInfo } from '../types';

export const ContactView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'LIBRARY_ADMIN' || user.role === 'LIBRARIAN');

  const [siteInfo, setSiteInfo] = useState<SiteInfo>(() => storage.getSiteInfo());
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [address, setAddress] = useState(siteInfo.address);
  const [email, setEmail] = useState(siteInfo.email);
  const [phone, setPhone] = useState(siteInfo.phone);
  const [hours, setHours] = useState(siteInfo.hours);
  const [mapInfo, setMapInfo] = useState(siteInfo.mapInfo);

  const handleOpenEdit = () => {
    setAddress(siteInfo.address);
    setEmail(siteInfo.email);
    setPhone(siteInfo.phone);
    setHours(siteInfo.hours);
    setMapInfo(siteInfo.mapInfo);
    setShowModal(true);
  };

  const handleSaveSiteInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteInfo = {
      ...siteInfo,
      address,
      email,
      phone,
      hours,
      mapInfo
    };
    storage.saveSiteInfo(updated);
    setSiteInfo(updated);
    setShowModal(false);
    showToast('যোগাযোগের তথ্য আপডেট করা হয়েছে', 'success');
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('আপনার বার্তা সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!', 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সরাসরি যোগাযোগ ও দিকনির্দেশনা</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Mail className="w-7 h-7 text-[#E85D75]" />
              <span>যোগাযোগ ও অবস্থান</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              লাইব্রেরি সংক্রান্ত যেকোনো পরামর্শ, প্রশ্ন, বই অনুদান বা সদস্যপদ সংক্রান্ত তথ্যের জন্য যোগাযোগ করুন
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenEdit}
              className="btn btn-accent text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Edit className="w-4 h-4" />
              <span>যোগাযোগ তথ্য সম্পাদনা</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 card-elevated p-6 sm:p-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-black/5 dark:border-white/5 pb-3">
              <div className="w-2 h-5 bg-[#E85D75] rounded-full"></div>
              <h2 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
                অফিসিয়াল যোগাযোগের তথ্য
              </h2>
            </div>

            <div className="space-y-5 text-xs text-[#2D2424]/80 dark:text-[#FFF9F0]/80">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E85D75]/15 text-[#E85D75] flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-xs font-bold text-[#2D2424] dark:text-[#FFF9F0] mb-0.5">লাইব্রেরি ঠিকানা:</strong>
                  <span className="leading-relaxed">{siteInfo.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E85D75]/15 text-[#E85D75] flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-xs font-bold text-[#2D2424] dark:text-[#FFF9F0] mb-0.5">অফিসিয়াল ইমেইল:</strong>
                  <a href={`mailto:${siteInfo.email}`} className="text-[#E85D75] font-semibold hover:underline">
                    {siteInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E85D75]/15 text-[#E85D75] flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-xs font-bold text-[#2D2424] dark:text-[#FFF9F0] mb-0.5">জরুরি হটলাইন:</strong>
                  <span className="font-mono font-medium">{siteInfo.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 bg-black/3 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                <Clock className="w-5 h-5 text-[#F4D35E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-xs font-bold text-[#2D2424] dark:text-[#FFF9F0]">খোলা থাকার সময়সূচী:</strong>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{siteInfo.hours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2D2424] to-[#1E1718] text-white space-y-2 border border-[#E85D75]/20 shadow-md">
            <h4 className="text-xs font-bold flex items-center gap-2 text-[#F4D35E]">
              <MapPin className="w-4 h-4 text-[#E85D75]" />
              <span>অবস্থান ও যাতায়াত নির্দেশিকা</span>
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              {siteInfo.mapInfo}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 card-elevated p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-black/5 dark:border-white/5 pb-3">
            <div className="w-2 h-5 bg-[#F4D35E] rounded-full"></div>
            <h2 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
              আমাদের বার্তা পাঠান (Feedback & Inquiry)
            </h2>
          </div>

          {submitted ? (
            <div className="p-10 text-center bg-gradient-to-br from-[#E85D75]/10 to-transparent border border-[#E85D75]/30 rounded-2xl space-y-4">
              <CheckCircle2 className="w-14 h-14 text-[#E85D75] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
                আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!
              </h3>
              <p className="text-xs sm:text-sm text-[#2D2424]/75 dark:text-[#FFF9F0]/75 max-w-md mx-auto leading-relaxed">
                আমাদের লাইব্রেরি প্রশাসন অতিসত্বর আপনার প্রদত্ত ইমেইল বা নম্বরে উত্তর প্রদান করবে।
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-accent text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
              >
                আরেকটি বার্তা পাঠান
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  বিষয় (Subject) *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="যেমন: বই অনুদান বা বই অনুসন্ধান"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  আপনার বার্তা / মতামত *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="বিস্তারিত বার্তা এখানে লিখুন..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl btn-accent text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>বার্তা পাঠান (Send Message)</span>
              </button>
            </form>
          )}

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
              <Edit className="w-5 h-5 text-[#E85D75]" />
              <span>যোগাযোগ তথ্য পরিবর্তন</span>
            </h2>

            <form onSubmit={handleSaveSiteInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  লাইব্রেরি পূর্ণ ঠিকানা *
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    অফিসিয়াল ইমেইল *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    হটলাইন / মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  খোলা থাকার সময়সূচী *
                </label>
                <input
                  type="text"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  ম্যাপ ও যাতায়াত তথ্য
                </label>
                <textarea
                  rows={2}
                  value={mapInfo}
                  onChange={(e) => setMapInfo(e.target.value)}
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


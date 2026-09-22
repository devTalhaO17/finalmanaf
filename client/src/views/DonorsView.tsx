import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ImageInputPicker } from '../components/common/ImageInputPicker';
import { SafeImage } from '../components/common/SafeImage';
import { DonorMember } from '../types';
import { Award, Heart, Plus, Edit, Trash2, X, Save, Sparkles, Mail, Phone, Calendar } from 'lucide-react';

export const DonorsView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'LIBRARY_ADMIN' || user.role === 'LIBRARIAN');

  const [donors, setDonors] = useState<DonorMember[]>(() => storage.getDonors());
  const [showModal, setShowModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonorMember | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [donorCategory, setDonorCategory] = useState<DonorMember['donorCategory']>('Donor Member');
  const [contribution, setContribution] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [joinDate, setJoinDate] = useState('২০২৬');

  const categories = ['All', 'Chief Sponsor', 'Patron', 'Life Member', 'Donor Member'];

  const filtered = donors.filter(d => selectedCategory === 'All' || d.donorCategory === selectedCategory);

  const resetForm = () => {
    setEditingDonor(null);
    setName('');
    setDesignation('');
    setDonorCategory('Donor Member');
    setContribution('');
    setPhotoUrl('');
    setJoinDate('২০২৬');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (donor: DonorMember) => {
    setEditingDonor(donor);
    setName(donor.name);
    setDesignation(donor.designation);
    setDonorCategory(donor.donorCategory);
    setContribution(donor.contribution);
    setPhotoUrl(donor.photoUrl);
    setJoinDate(donor.joinDate);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation) {
      showToast('দাতা সদস্যের নাম ও পদবি প্রদান করুন', 'error');
      return;
    }

    const defaultPhoto = photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300';

    if (editingDonor) {
      const updated: DonorMember = {
        ...editingDonor,
        name,
        designation,
        donorCategory,
        contribution,
        photoUrl: defaultPhoto,
        joinDate
      };
      storage.updateDonor(updated);
      showToast('দাতা সদস্যের তথ্য আপডেট করা হয়েছে', 'success');
    } else {
      const newDonor: DonorMember = {
        id: `dn_${Date.now()}`,
        name,
        designation,
        donorCategory,
        contribution,
        photoUrl: defaultPhoto,
        joinDate
      };
      storage.addDonor(newDonor);
      showToast('নতুন দাতা সদস্য যুক্ত করা হয়েছে', 'success');
    }

    setDonors(storage.getDonors());
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই দাতা সদস্যের তথ্য মুছে ফেলতে চান?')) {
      storage.deleteDonor(id);
      setDonors(storage.getDonors());
      showToast('দাতা সদস্য মুছে ফেলা হয়েছে', 'info');
    }
  };

  const getCategoryBadgeLabel = (cat: DonorMember['donorCategory']) => {
    switch (cat) {
      case 'Chief Sponsor': return 'প্রধান পৃষ্ঠপোষক';
      case 'Patron': return 'পৃষ্ঠপোষক';
      case 'Life Member': return 'আজীবন সদস্য';
      case 'Donor Member': return 'দাতা সদস্য';
      default: return cat;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সম্মানিত শুভানুধ্যায়ী ও পৃষ্ঠপোষক</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Award className="w-7 h-7 text-[#F4D35E]" />
              <span>দাতা সদস্যবৃন্দ</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              যাঁদের উদার আর্থিক, জমি ও বই অনুদানে আলোকিত সমাজ বিনির্মাণের এই বাতিঘর উত্তরোত্তর সমৃদ্ধ হচ্ছে
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn btn-accent text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন দাতা সদস্য যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      <div className="card-elevated p-3 sm:p-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#E85D75] text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-[#2D2424]/75 dark:text-white/75 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {cat === 'All' ? 'সকল দাতা সদস্য' : getCategoryBadgeLabel(cat as any)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card-elevated p-12 text-center text-slate-400 space-y-2">
            <Award className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">কোনো দাতা সদস্য পাওয়া যায়নি</p>
          </div>
        ) : (
          filtered.map(donor => (
            <div
              key={donor.id}
              className="card-elevated p-6 text-center space-y-4 relative group flex flex-col justify-between"
            >
              {isAdmin && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(donor)}
                    className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-slate-500 hover:text-[#E85D75] transition-colors"
                    title="সম্পাদনা"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(donor.id)}
                    className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-rose-500 hover:text-rose-700 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div className="relative inline-block mx-auto">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#E85D75] mx-auto shadow-md ring-4 ring-[#E85D75]/10">
                    <SafeImage
                      src={donor.photoUrl}
                      alt={donor.name}
                      category="member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold badge-gold">
                    {getCategoryBadgeLabel(donor.donorCategory)}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0] mt-1.5">
                    {donor.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#E85D75]">
                    {donor.designation}
                  </p>
                </div>

                <div className="p-3.5 bg-black/3 dark:bg-white/5 rounded-xl text-xs text-[#2D2424]/80 dark:text-[#FFF9F0]/80 border border-black/5 dark:border-white/5 space-y-1 text-left">
                  <p className="font-bold text-[#2D2424] dark:text-[#FFF9F0] text-[11px] uppercase tracking-wider text-[#E85D75]">বিশেষ অবদান:</p>
                  <p className="line-clamp-2 leading-relaxed">{donor.contribution}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>যোগদান: {donor.joinDate}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card-elevated p-8 text-center space-y-4 bg-gradient-to-br from-[#2D2424] via-[#3A2D2E] to-[#201718] text-white border border-[#E85D75]/20 shadow-xl relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-[#E85D75]/20 text-[#E85D75] flex items-center justify-center mx-auto shadow-md">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold">আপনিও লাইব্রেরির দাতা সদস্য হতে চান?</h2>
        <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
          বই অনুদান, ফার্নিচার, প্রযুক্তিগত সরঞ্জাম অথবা লাইব্রেরি কল্যাণ তহবিলে সহযোগিতা দিয়ে আমাদের জ্ঞান প্রসারের অগ্রযাত্রায় শরিক হোন।
        </p>
        <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#F4D35E] bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/15">
          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> sajkspla@gmail.com</span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +৮৮০ ১৭১১-০০০০০১</span>
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
              <Award className="w-5 h-5 text-[#F4D35E]" />
              <span>{editingDonor ? 'দাতা সদস্যের তথ্য সম্পাদনা' : 'নতুন দাতা সদস্য সংযোজন'}</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <ImageInputPicker
                value={photoUrl}
                onChange={setPhotoUrl}
                label="দাতা সদস্যের ছবি (Photo Upload / URL)"
                helpText="ডিভাইস থেকে সরাসরি ফটো আপলোড করুন অথবা ছবি লিংক পেস্ট করুন"
                aspectRatio="avatar"
              />

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: জনাব আলহাজ্ব মোঃ মোস্তফা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  পদবি / পরিচিতি *
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="যেমন: বিশিষ্ট সমাজসেবক ও শিক্ষানুরাগী"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    দাতা ক্যাটাগরি *
                  </label>
                  <select
                    value={donorCategory}
                    onChange={(e) => setDonorCategory(e.target.value as DonorMember['donorCategory'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  >
                    <option value="Chief Sponsor">প্রধান পৃষ্ঠপোষক (Chief Sponsor)</option>
                    <option value="Patron">পৃষ্ঠপোষক (Patron)</option>
                    <option value="Life Member">আজীবন সদস্য (Life Member)</option>
                    <option value="Donor Member">দাতা সদস্য (Donor Member)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                    যোগদানের বছর / তারিখ
                  </label>
                  <input
                    type="text"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    placeholder="যেমন: ১৫ মার্চ ২০১০"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  বিশেষ অবদান / অনুদান বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="যেমন: ভবন নির্মাণে আর্থিক সহায়তা ও ৫০টি নতুন বই অনুদান"
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


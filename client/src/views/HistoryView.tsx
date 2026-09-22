import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { MilestoneItem } from '../types';
import { Clock, Plus, Edit, Trash2, X, Save, Sparkles, History as HistoryIcon, Calendar } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'LIBRARY_ADMIN' || user.role === 'LIBRARIAN');

  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => storage.getMilestones());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MilestoneItem | null>(null);

  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const resetForm = () => {
    setEditingItem(null);
    setYear('');
    setTitle('');
    setDesc('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (m: MilestoneItem) => {
    setEditingItem(m);
    setYear(m.year);
    setTitle(m.title);
    setDesc(m.desc);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !title) {
      showToast('সাল ও শিরোনাম প্রদান করুন', 'error');
      return;
    }

    if (editingItem) {
      const updated: MilestoneItem = {
        ...editingItem,
        year,
        title,
        desc
      };
      storage.updateMilestone(updated);
      showToast('ইতিহাসের মাইলফলক আপডেট করা হয়েছে', 'success');
    } else {
      const newItem: MilestoneItem = {
        id: `ms_${Date.now()}`,
        year,
        title,
        desc
      };
      storage.addMilestone(newItem);
      showToast('নতুন মাইলফলক যুক্ত করা হয়েছে', 'success');
    }

    setMilestones(storage.getMilestones());
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ইতিহাসের তথ্যটি মুছে ফেলতে চান?')) {
      storage.deleteMilestone(id);
      setMilestones(storage.getMilestones());
      showToast('তথ্য মুছে ফেলা হয়েছে', 'info');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>ঐতিহ্যের পথচলা ও অর্জন</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Clock className="w-7 h-7 text-[#E85D75]" />
              <span>লাইব্রেরির ইতিহাস ও মাইলফলক</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              ২০০১ সাল থেকে আজ পর্যন্ত — নিরবচ্ছিন্ন জ্ঞান চর্চা ও শিক্ষা বিস্তারের গৌরবময় দিনলিপি
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn btn-accent text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন মাইলফলক যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      <div className="card-elevated p-6 sm:p-9 relative">
        <div className="absolute left-9 sm:left-12 top-14 bottom-14 w-0.5 bg-gradient-to-b from-[#E85D75] via-[#F4D35E] to-[#E85D75]/20 hidden sm:block"></div>

        <div className="space-y-8 relative z-10">
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold">কোনো মাইলফলক পাওয়া যায়নি</p>
            </div>
          ) : (
            milestones.map((m, idx) => (
              <div key={m.id} className="relative flex flex-col sm:flex-row gap-4 sm:gap-8 items-start group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E85D75] to-[#D64560] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg ring-4 ring-white dark:ring-[#261E20] sm:ml-2">
                  {idx + 1}
                </div>

                <div className="flex-1 p-6 rounded-2xl bg-black/3 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3 relative group-hover:border-[#E85D75]/30 transition-colors">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-slate-500 hover:text-[#E85D75] transition-colors"
                        title="সম্পাদনা"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-rose-500 hover:text-rose-700 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg badge-rose text-xs font-bold font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{m.year}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0] pr-16 leading-snug">
                    {m.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#2D2424]/80 dark:text-[#FFF9F0]/80 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))
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
              <Clock className="w-5 h-5 text-[#E85D75]" />
              <span>{editingItem ? 'ইতিহাসের তথ্য সম্পাদনা' : 'নতুন ইতিহাস মাইলফলক সংযোজন'}</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  বছর / সময়কাল *
                </label>
                <input
                  type="text"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="যেমন: ০১ জানুয়ারি ২০০১"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  ঘটনার বিষয় / শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: লাইব্রেরির শুভ সুচনা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:ring-2 focus:ring-[#E85D75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2424] dark:text-[#FFF9F0] mb-1.5">
                  বিস্তারিত বিবরণ
                </label>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="ইতিহাসের বিস্তারিত সংক্ষিপ্ত বিবরণ লিখুন..."
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


import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { MediaItem, ImageCategory } from '../../types';
import { useToast } from '../common/Toast';
import { ImageInputPicker } from '../common/ImageInputPicker';
import { ImageCropperModal } from '../common/ImageCropperModal';
import { SafeImage } from '../common/SafeImage';
import { 
  Database, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  Tag, 
  Copy, 
  Check, 
  Crop, 
  Upload, 
  Layers, 
  ImageIcon,
  AlertTriangle,
  Info
} from 'lucide-react';

export const CentralMediaManager: React.FC = () => {
  const { showToast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => storage.getMediaLibrary());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ImageCategory>('general');
  const [newImageUrl, setNewImageUrl] = useState('');

  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [replaceUrl, setReplaceUrl] = useState('');
  const [replaceTitle, setReplaceTitle] = useState('');

  const [cropperItem, setCropperItem] = useState<MediaItem | null>(null);

  const reloadMedia = () => {
    setMediaItems(storage.getMediaLibrary());
  };

  useEffect(() => {
    const handleMediaUpdated = () => reloadMedia();
    window.addEventListener('sajks_media_updated', handleMediaUpdated);
    return () => window.removeEventListener('sajks_media_updated', handleMediaUpdated);
  }, []);

  const handleAddNewImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) {
      showToast('অনুগ্রহ করে একটি ছবি নির্বাচন করুন', 'error');
      return;
    }
    const saved = storage.saveMediaItem({
      title: newTitle || 'নতুন ছবি',
      category: newCategory,
      url: newImageUrl
    });
    reloadMedia();
    setShowAddModal(false);
    setNewTitle('');
    setNewImageUrl('');
    showToast(`ছবি সফলতা সহকারে কেন্দ্রীয় ডাটাবেজে যুক্ত হয়েছে (ID: ${saved.id})`, 'success');
  };

  const handleUpdateReplaceImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !replaceUrl) return;

    storage.updateMediaItem(editingItem.id, replaceUrl, replaceTitle);
    storage.clearImageCache();
    reloadMedia();
    setEditingItem(null);
    showToast('ছবিটি সফলভাবে প্রতিস্থাপন করা হয়েছে! সকল পেজে স্বয়ংক্রিয়ভাবে আপডেট হয়ে গেছে।', 'success');
  };

  const handleDeleteImage = (item: MediaItem) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে '${item.title}' ছবিটি ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      storage.deleteMediaItem(item.id);
      storage.clearImageCache();
      reloadMedia();
      showToast('ছবি সফলভাবে মুছে ফেলা হয়েছে', 'info');
    }
  };

  const handleCropSave = (croppedDataUrl: string) => {
    if (cropperItem) {
      storage.updateMediaItem(cropperItem.id, croppedDataUrl);
      storage.clearImageCache();
      reloadMedia();
      setCropperItem(null);
      showToast('ক্রপকৃত ছবি সফলভাবে সংরক্ষণ করা হয়েছে', 'success');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`ইমেজ আইডি (${text}) কপি করা হয়েছে`, 'info');
  };

  const handleClearAllCaches = () => {
    storage.clearImageCache();
    reloadMedia();
    showToast('সকল পেজ ও ক্যাশ রিফ্রেশ ও সিংক্রোনাইজ করা হয়েছে', 'success');
  };

  const filtered = mediaItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoriesList: { key: string; label: string }[] = [
    { key: 'all', label: 'সকল ছবি' },
    { key: 'founder', label: 'প্রতিষ্ঠাতা ছবি' },
    { key: 'logo', label: 'লাইব্রেরি লোগো' },
    { key: 'hero_banner', label: 'হিরো ব্যানার' },
    { key: 'book_cover', label: 'বইয়ের প্রচ্ছদ' },
    { key: 'gallery', label: 'গ্যালারি ছবি' },
    { key: 'member_photo', label: 'সদস্য ফটো' },
    { key: 'event', label: 'ইভেন্ট ছবি' },
    { key: 'notice', label: 'নোটিশ ছবি' },
    { key: 'general', label: 'সাধারণ' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <Database className="w-4 h-4" />
            <span>কেন্দ্রীয় ছবি ডাটাবেজ ও মিডিয়া ব্যাংক (Central Image Database)</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            লাইব্রেরির সমস্ত পেজের ইমেজ ডায়নামিক ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            এখান থেকে যেকোনো ছবি পরিবর্তন বা প্রতিস্থাপন করলে পুরো ওয়েবসাইট ও সকল পেজে স্বয়ংক্রিয়ভাবে রিয়েল-টাইমে আপডেট হয়ে যাবে।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAllCaches}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>ক্যাশ রিফ্রেশ</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ছবি যুক্ত করুন</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ছবি আইডি বা শিরোনাম লিখে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            মোট সংরক্ষিত মিডিয়া: <strong className="text-emerald-600 dark:text-emerald-400">{filtered.length}</strong> টি
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categoriesList.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-[11px] ${
                selectedCategory === cat.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500 transition-all group"
          >
            <div>
              <div className="relative aspect-video sm:aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                <SafeImage
                  src={item.url}
                  alt={item.title}
                  category={item.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-700/60 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{item.category}</span>
                </div>

                <button
                  onClick={() => copyToClipboard(item.id)}
                  title="ইমেজ আইডি কপি করুন"
                  className="absolute top-2 right-2 bg-slate-900/90 text-slate-200 hover:text-white px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border border-slate-700 flex items-center gap-1"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{item.id}</span>
                </button>
              </div>

              <div className="p-3.5 space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1" title={item.title}>
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>সাইজ: {item.dimensions || '400x400'}</span>
                  <span>আপডেট: {item.updatedAt}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
              <button
                onClick={() => {
                  setEditingItem(item);
                  setReplaceUrl(item.url);
                  setReplaceTitle(item.title);
                }}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>প্রতিস্থাপন</span>
              </button>

              <button
                onClick={() => setCropperItem(item)}
                className="py-1.5 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1"
                title="ক্রপ ও এডিট"
              >
                <Crop className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleDeleteImage(item)}
                className="py-1.5 px-2 rounded-lg bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1"
                title="ছবি মুছুন"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            কোনো সংরক্ষিত মিডিয়া ফাইল খুঁজে পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-500">
            নতুন ছবি যুক্ত করতে উপরে 'নতুন ছবি যুক্ত করুন' বাটনে ক্লিক করুন।
          </p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base border-b pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>কেন্দ্রীয় মিডিয়া ডাটাবেজে নতুন ছবি আপলোড</span>
            </h3>

            <form onSubmit={handleAddNewImage} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">ছবি শিরোনাম (Title)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: লাইব্রেরি ফ্রন্ট ভিউ বা বই প্রচ্ছদ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ক্যাটাগরি (Category)</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ImageCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="general">সাধারণ (General)</option>
                  <option value="founder">প্রতিষ্ঠাতা ছবি (Founder)</option>
                  <option value="logo">লাইব্রেরি লোগো (Logo)</option>
                  <option value="hero_banner">হিরো ব্যানার (Hero Banner)</option>
                  <option value="book_cover">বইয়ের প্রচ্ছদ (Book Cover)</option>
                  <option value="gallery">গ্যালারি ছবি (Gallery)</option>
                  <option value="event">ইভেন্ট ফটো (Event)</option>
                  <option value="notice">নোটিশ ব্যানার (Notice)</option>
                  <option value="member_photo">সদস্য ছবি (Member)</option>
                </select>
              </div>

              <ImageInputPicker
                value={newImageUrl}
                onChange={(url) => setNewImageUrl(url)}
                label="ছবি ফাইল বা লিঙ্ক নির্বাচন (Image Input)"
                category={newCategory}
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  ডাটাবেজে সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                <span>ছবি প্রতিস্থাপন করুন (Replace Central Image)</span>
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                ইমেজ আইডি: {editingItem.id}
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300 text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                সতর্কতা: এই ছবিটি পরিবর্তন করলে ওয়েবসাইটে যে যে স্থানে এই ইমেজ আইডি বা লিংক ব্যবহার করা হয়েছে, তা সাথে সাথে রিয়েল-টাইমে আপডেট হয়ে যাবে।
              </span>
            </div>

            <form onSubmit={handleUpdateReplaceImage} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">শিরোনাম</label>
                <input
                  type="text"
                  value={replaceTitle}
                  onChange={(e) => setReplaceTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <ImageInputPicker
                value={replaceUrl}
                onChange={(url) => setReplaceUrl(url)}
                label="নতুন প্রতিস্থাপিত ছবি সিলেক্ট করুন"
                category={editingItem.category}
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>প্রতিস্থাপন নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cropperItem && (
        <ImageCropperModal
          isOpen={!!cropperItem}
          onClose={() => setCropperItem(null)}
          imageSrc={cropperItem.url}
          onCropComplete={handleCropSave}
        />
      )}
    </div>
  );
};

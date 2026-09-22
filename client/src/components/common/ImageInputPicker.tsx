import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Crop, AlertCircle, Database, Search } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';
import { storage } from '../../lib/storage';
import { ImageCategory, MediaItem } from '../../types';

interface ImageInputPickerProps {
  value: string;
  onChange: (urlOrId: string) => void;
  label?: string;
  helpText?: string;
  aspectRatio?: 'square' | 'cover' | 'avatar' | 'banner';
  category?: ImageCategory | string;
  className?: string;
}

export const ImageInputPicker: React.FC<ImageInputPickerProps> = ({
  value,
  onChange,
  label = 'ছবি নির্বাচন (Image Option)',
  helpText,
  aspectRatio = 'square',
  category = 'general',
  className = ''
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'bank'>(
    value && value.startsWith('data:') ? 'upload' : 'url'
  );
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && !value.startsWith('data:')) {
      setUrlInput(value);
    }
  }, [value]);

  const resolvedImageUrl = storage.resolveImageUrl(value, category);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('অনুগহ করে একটি সঠিক ছবি ফাইল (PNG, JPG, WEBP) নির্বাচন করুন।');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('ফাইল সাইজ ১০ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট ছবি নির্বাচন করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        setFileName(file.name);
        const savedMedia = storage.saveMediaItem({
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: category as ImageCategory,
          url: result
        });
        onChange(savedMedia.id);
      }
    };
    reader.onerror = () => {
      setUploadError('ছবি পড়ার সময়ে ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন।');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrlInput(newUrl);
    setUploadError(null);
    const clean = newUrl.trim();
    if (clean) {
      const savedMedia = storage.saveMediaItem({
        title: `ইমেজ লিংক (${category})`,
        category: category as ImageCategory,
        url: clean
      });
      onChange(savedMedia.id);
    } else {
      onChange('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setActiveMode('upload');
      processFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setFileName(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
    const savedMedia = storage.saveMediaItem({
      title: `ক্রপকৃত ছবি (${category})`,
      category: category as ImageCategory,
      url: croppedBase64
    });
    onChange(savedMedia.id);
  };

  const getAspectStyle = () => {
    switch (aspectRatio) {
      case 'avatar':
        return 'w-24 h-24 rounded-full';
      case 'cover':
        return 'w-24 h-32 rounded-lg';
      case 'banner':
        return 'w-full h-36 rounded-xl';
      case 'square':
      default:
        return 'w-28 h-28 rounded-xl';
    }
  };

  const mediaList = storage.getMediaLibrary();
  const filteredMedia = mediaList.filter(
    (m) =>
      m.title.toLowerCase().includes(bankSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(bankSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{label}</span>
          </label>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>ছবি মুছুন</span>
            </button>
          )}
        </div>
      )}

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 text-[11px] transition-all ${
            activeMode === 'upload'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>ডিভাইস আপলোড</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('bank')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 text-[11px] transition-all ${
            activeMode === 'bank'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>মিডিয়া ব্যাংক</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 text-[11px] transition-all ${
            activeMode === 'url'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>ইমেজ ইউআরএল</span>
        </button>
      </div>

      {activeMode === 'upload' && (
        <div className="space-y-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1 animate-bounce" />
            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              ডিভাইস থেকে ফাইল সিলেক্ট করুন
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              ড্র্যাগ ও ড্রপ করে যুক্ত করুন (PNG, JPG, WEBP)
            </p>
            {fileName && (
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded inline-block">
                {fileName}
              </p>
            )}
          </div>
        </div>
      )}

      {activeMode === 'bank' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="মিডিয়া ব্যাংকে ছবি খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
            {filteredMedia.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange(m.id)}
                className={`relative group rounded-lg overflow-hidden border aspect-square ${
                  value === m.id || value === m.url
                    ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/50'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex items-end">
                  <span className="text-[9px] text-white truncate font-semibold">{m.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeMode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://... ইমেজ লিংক পেস্ট করুন"
              className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => handleUrlChange('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px]">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {value && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`relative overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 shrink-0 ${getAspectStyle()}`}>
              <img
                src={resolvedImageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = storage.resolveImageUrl(null);
                }}
              />
            </div>
            <div className="flex-1 space-y-1 overflow-hidden">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                <Check className="w-3 h-3" />
                <span>ছবি সংযুক্ত রয়েছে</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                ID/URL: {value}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCropper(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-xs"
          >
            <Crop className="w-3.5 h-3.5" />
            <span>ক্রপ ও এডিট</span>
          </button>
        </div>
      )}

      {helpText && (
        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
          {helpText}
        </p>
      )}

      {showCropper && resolvedImageUrl && (
        <ImageCropperModal
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          imageSrc={resolvedImageUrl}
          onCropComplete={handleCropComplete}
          aspectRatioPreset={aspectRatio}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { GalleryItem } from '../types';
import { SafeImage } from '../components/common/SafeImage';
import { Image, X, Sparkles, ZoomIn, Calendar } from 'lucide-react';

export const GalleryView: React.FC = () => {
  const gallery = storage.getGallery();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Library', 'Events', 'Inauguration', 'Guests', 'Books'];

  const filtered = gallery.filter(g => selectedCat === 'All' || g.category === selectedCat);

  return (
    <div className="space-y-8 pb-16">
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্মৃতি ও আলোকচিত্র প্রদর্শনী</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Image className="w-7 h-7 text-[#E85D75]" />
              <span>ফটোগ্যালারি</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Speaker Abdul Jabbar Khan Memorial Public Library's ঐতিহাসিক মুহূর্ত, মেলা, সেমিনার ও স্মৃতি চিত্র
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[100px]">
              <span className="text-xl font-extrabold text-[#F4D35E] block">{gallery.length}</span>
              <span className="text-[11px] font-medium text-white/75">মোট ছবি</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated p-3 sm:p-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === cat
                ? 'bg-[#E85D75] text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-[#2D2424]/75 dark:text-white/75 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {cat === 'All' ? 'সবগুলো' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full card-elevated p-12 text-center text-slate-400 space-y-2">
            <Image className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">এই ক্যাটাগরিতে কোনো ছবি নেই</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="card-elevated group relative aspect-4/3 overflow-hidden cursor-pointer p-0"
            >
              <SafeImage
                src={item.imageUrl}
                alt={item.title}
                category="gallery"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-4 flex flex-col justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="self-end">
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#F4D35E] font-mono block font-semibold mb-0.5">{item.date}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-[#F4D35E] transition-colors">{item.title}</h4>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-elevated max-w-2xl w-full p-5 relative shadow-2xl space-y-4 bg-white dark:bg-[#261E20] border border-black/10 dark:border-white/10">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-[#E85D75] hover:text-white text-slate-600 dark:text-slate-200 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <SafeImage
                src={activeItem.imageUrl}
                alt={activeItem.title}
                category="gallery"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge-rose text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {activeItem.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeItem.date}</span>
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2D2424] dark:text-[#FFF9F0]">
                {activeItem.title}
              </h3>
              {activeItem.description && (
                <p className="text-xs sm:text-sm text-[#2D2424]/75 dark:text-[#FFF9F0]/75 leading-relaxed">
                  {activeItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Book } from '../../types';
import { SafeImage } from './SafeImage';
import { Badge } from './Badge';
import { BookOpen, Bookmark, Eye, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onReserve?: (book: Book) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  onSelect, 
  onReserve,
  isFavorite,
  onToggleFavorite 
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('পছন্দের তালিকায় যুক্ত করতে লগইন করুন', 'info');
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(book.id);
    }
  };

  return (
    <div 
      onClick={() => onSelect(book)}
      className="group bg-white dark:bg-[#181816] border border-black/10 dark:border-white/10 shadow-xs hover:border-[#B8860B] transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      <div className="relative aspect-3/4 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <SafeImage
          src={book.coverImage || book.coverUrl}
          alt={book.title}
          category="book_cover"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 p-2 transition-all ${
            isFavorite 
              ? 'bg-[#B8860B] text-white' 
              : 'bg-black/60 text-white/90 hover:bg-black hover:text-white'
          }`}
          title={isFavorite ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় যুক্ত করুন'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1.5">
          <span className="bg-[#1A1A1A]/90 text-white text-[10px] font-medium px-2 py-0.5 truncate">
            {book.category}
          </span>
          <span className="bg-white/95 dark:bg-[#1A1A1A]/95 text-[#1A1A1A] dark:text-white text-[10px] mono px-2 py-0.5 shrink-0 border border-black/10">
            {book.shelfNumber}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-serif-bn font-bold text-[#1A1A1A] dark:text-[#F8F7F4] text-base line-clamp-1 group-hover:text-[#B8860B] transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium line-clamp-1 mt-0.5">
            {book.author}
          </p>
          <p className="text-[11px] mono text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-1">
            {book.publisher} • {book.publicationYear}
          </p>
        </div>

        <div className="pt-2.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            {book.availableCopies > 0 ? (
              <span className="mono flex items-center gap-1 text-[#B8860B] font-bold text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>প্রাপ্য: {book.availableCopies}</span>
              </span>
            ) : (
              <span className="mono flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>স্টক শেষ</span>
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(book);
            }}
            className="mono text-xs font-bold text-[#1A1A1A] dark:text-[#F8F7F4] hover:text-[#B8860B] flex items-center gap-1 uppercase"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>দেখুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

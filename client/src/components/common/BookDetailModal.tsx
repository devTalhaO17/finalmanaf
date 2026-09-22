import React, { useState } from 'react';
import { Book } from '../../types';
import { X, Bookmark, BookOpen, CheckCircle, AlertCircle, Share2, Layers, MapPin, Hash, BarChart3 } from 'lucide-react';
import { BarcodeGenerator, QRCodeVisual } from './QRCodeCanvas';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { storage } from '../../lib/storage';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onReserveSuccess?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onReserveSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reserving, setReserving] = useState(false);
  const [reserveNotes, setReserveNotes] = useState('');

  if (!book) return null;

  const handleReservation = () => {
    if (!user) {
      showToast('বই রিজার্ভ করতে প্রথমে আপনার একাউন্টে লগইন করুন', 'info');
      return;
    }

    if (book.availableCopies <= 0) {
      showToast('দুঃখিত, এই বইটির কোনো কপি বর্তমানে খালি নেই', 'error');
      return;
    }

    setReserving(true);

    try {
      storage.addReservation({
        id: `res_${Date.now()}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverUrl,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        userMemberId: user.memberId,
        reservationDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: reserveNotes || 'সদস্য কর্তৃক অনলাইনে লাইব্রেরি রিজার্ভেশন অনুরোধ'
      });

      showToast(`"${book.title}" সফলভাবে রিজার্ভেশনের আবেদন করা হয়েছে!`, 'success');
      setReserving(false);
      if (onReserveSuccess) onReserveSuccess();
      onClose();
    } catch (err) {
      showToast('রিজার্ভেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
      setReserving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 text-center">
            <div className="aspect-3/4 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">লাইব্রেরি বারকোড</p>
              <BarcodeGenerator code={book.barcode} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
                {book.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {book.title}
              </h2>
              {book.titleEn && (
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {book.titleEn}
                </p>
              )}
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                লেখক: {book.author}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-slate-600 dark:text-slate-400 block">প্রকাশক:</span>
                <strong className="text-slate-800 dark:text-slate-200">{book.publisher}</strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block">প্রকাশকাল ও সংস্করণ:</span>
                <strong className="text-slate-800 dark:text-slate-200">{book.publicationYear} ({book.edition})</strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block">ভাষা:</span>
                <strong className="text-slate-800 dark:text-slate-200">{book.language}</strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block">ISBN:</span>
                <strong className="text-slate-800 dark:text-slate-200 font-mono">{book.isbn}</strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block">সেলফ নম্বর:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{book.shelfNumber}</strong>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block">মোট কপি / খালি কপি:</span>
                <strong className="text-slate-800 dark:text-slate-200">{book.quantity} / {book.availableCopies} কপি</strong>
              </div>
            </div>

            {book.description && (
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">বই পরিচিতি:</p>
                <p>{book.description}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {book.availableCopies > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>এই বইটি লাইব্রেরিতে প্রাপ্তিযোগ্য। অনলাইন বুকিং করতে পারেন।</span>
                  </div>
                  <input
                    type="text"
                    value={reserveNotes}
                    onChange={(e) => setReserveNotes(e.target.value)}
                    placeholder="নোট (ঐচ্ছিক, যেমন: আগামীকাল বই সংগ্রহ করব)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleReservation}
                    disabled={reserving}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{reserving ? 'প্রসেসিং হচ্ছে...' : 'বইটি রিজার্ভ করুন (Reserve Book)'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>বর্তমানে এই বইটির সকল কপি ধার দেওয়া হয়েছে। নতুন কপি ফেরত এলে রিজার্ভেশন সম্ভব।</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { DigitalBook, BookCategory } from '../types';
import { storage } from '../lib/storage';
import { Search, Download, BookOpen, Eye, X, ZoomIn, ZoomOut, Bookmark, FileText, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useToast } from '../components/common/Toast';

export const DigitalLibraryView: React.FC = () => {
  const { showToast } = useToast();
  const digitalBooks = storage.getDigitalBooks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readingBook, setReadingBook] = useState<DigitalBook | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [readerDark, setReaderDark] = useState(false);

  const filtered = digitalBooks.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const handleStartRead = (book: DigitalBook) => {
    setReadingBook(book);
    setCurrentPage(1);
    setZoomLevel(100);

    const updated = storage.getDigitalBooks().map(d => d.id === book.id ? { ...d, readCount: d.readCount + 1 } : d);
    storage.saveDigitalBooks(updated);
  };

  const handleDownload = (book: DigitalBook) => {
    const pdf = book.pdfUrl || book.fileUrl;
    if (!pdf) {
      showToast(`"${book.title}" বইটির পিডিএফ ফাইল এখনও লাইব্রেরিতে আপলোড করা হয়নি। বইটি লাইব্রেরি ক্যাটালগে সংরক্ষিত রয়েছে।`, 'info');
      return;
    }
    const updated = storage.getDigitalBooks().map(d => d.id === book.id ? { ...d, downloadCount: d.downloadCount + 1 } : d);
    storage.saveDigitalBooks(updated);

    if (pdf.startsWith('data:') || pdf.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = pdf;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(pdf, '_blank');
    }
    showToast(`"${book.title}" ই-বুকটি ডাউনলোড শুরু হয়েছে`, 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      
      <div className="page-header-banner">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F4D35E]">
              <FileText className="w-3.5 h-3.5" />
              <span>অনলাইন ডিজিটাল আর্কাইভ ও ই-বুক</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-[#E85D75]" />
              <span>ডিজিটাল ই-বুক লাইব্রেরি</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              অনলাইনে বিনামূল্যে ই-বুক পড়ুন ও ডাউনলোড করুন। জ্ঞান বিকাশে সার্বক্ষণিক ডিজিটাল পাঠাগার।
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-xl font-extrabold text-[#F4D35E] block">{digitalBooks.length}</span>
              <span className="text-[11px] font-medium text-white/75">মোট ই-বুক</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ই-বুকের নাম বা লেখক দিয়ে খুঁজুন..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[#2D2424] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75] shrink-0"
        >
          <option value="All">সকল ক্যাটাগরি</option>
          <option value="Technology">প্রযুক্তি</option>
          <option value="Agriculture">কৃষি</option>
          <option value="Programming">প্রোগ্রামিং</option>
          <option value="Science">বিজ্ঞান</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card-elevated p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">কোনো ই-বুক পাওয়া যায়নি</p>
          </div>
        ) : (
          filtered.map(book => (
            <div
              key={book.id}
              className="card-elevated p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex gap-4">
                <div className="w-20 h-28 rounded-xl overflow-hidden shadow-md shrink-0 border border-black/5 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="badge-rose text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                      {book.category}
                    </span>
                    {!book.pdfUrl && !book.fileUrl && (
                      <span className="badge-gold text-[9px] font-semibold px-2 py-0.5 rounded-md">
                        ক্যাটালগে সংরক্ষিত
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-sm font-bold text-[#2D2424] dark:text-[#FFF9F0] line-clamp-2 leading-snug group-hover:text-[#E85D75] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{book.author}</p>
                  <div className="text-[11px] text-slate-400 font-mono pt-0.5">
                    {book.fileUrl || book.pdfUrl ? book.fileSize : 'ডিজিটাল কপি'} • {book.pageCount} পৃষ্ঠা
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#2D2424]/75 dark:text-[#FFF9F0]/75 line-clamp-2 leading-relaxed">
                {book.description}
              </p>

              <div className="pt-3.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => handleStartRead(book)}
                  className="btn btn-accent flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{!book.pdfUrl && !book.fileUrl ? 'সারাংশ পড়ুন' : 'অনলাইনে পড়ুন'}</span>
                </button>

                <button
                  onClick={() => handleDownload(book)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    !book.pdfUrl && !book.fileUrl
                      ? 'bg-black/5 dark:bg-white/5 text-slate-400 hover:bg-black/10'
                      : 'bg-[#F4D35E]/20 text-[#926C00] dark:text-[#F4D35E] hover:bg-[#F4D35E]/30'
                  }`}
                  title={!book.pdfUrl && !book.fileUrl ? 'পিডিএফ এখনও সংযুক্ত নেই' : 'পিডিএফ ডাউনলোড করুন'}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>


      {readingBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col p-2 sm:p-6 overflow-hidden">
          <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xl mb-3 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {readingBook.title}
                </h3>
                <p className="text-[10px] text-emerald-300">লেখক: {readingBook.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReaderDark(!readerDark)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                title="ডার্ক মোড টগল"
              >
                {readerDark ? 'Light' : 'Dark'}
              </button>

              <button
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 hidden sm:inline">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDownload(readingBook)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 ml-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ডাউনলোড</span>
              </button>

              <button
                onClick={() => setReadingBook(null)}
                className="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex justify-center p-4">
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className={`max-w-2xl w-full p-8 rounded-2xl shadow-2xl transition-all border ${
                readerDark 
                  ? 'bg-slate-900 text-slate-100 border-slate-800' 
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <div className="border-b pb-4 mb-6 flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Speaker Abdul Jabbar Khan Public Library ই-আর্কাইভ</span>
                <span>পৃষ্ঠা: {currentPage} / {readingBook.pageCount}</span>
              </div>

              <h2 className="text-xl font-bold mb-1">{readingBook.title}</h2>
              <p className="text-xs text-emerald-600 font-semibold mb-4">লেখক: {readingBook.author}</p>

              {!readingBook.pdfUrl && !readingBook.fileUrl && (
                <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                  <span className="font-bold">ক্যাটালগ নোট: </span>
                  <span>বইটি লাইব্রেরির ডিজিটাল ক্যাটালগে সংরক্ষিত রয়েছে। সরাসরি পূর্ণাঙ্গ পিডিএফ ফাইল শীঘ্রই লাইব্রেরিয়ান কর্তৃক আপলোড করা হবে।</span>
                </div>
              )}

              {readingBook.description && (
                <div className="mb-4 text-xs italic text-slate-600 dark:text-slate-400 border-l-2 border-emerald-500 pl-3 py-1">
                  {readingBook.description}
                </div>
              )}

              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-xs sm:text-sm leading-relaxed font-serif">
                {readingBook.sampleContentText || 'বইটির বিস্তারিত তথ্য ও ক্যাটালগ লাইব্রেরিতে সংরক্ষিত রয়েছে। পূর্ণাঙ্গ পড়ার জন্য লাইব্রেরি শাখায় যোগাযোগ করুন।'}
              </div>

              <div className="mt-12 pt-6 border-t flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-lg disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী পৃষ্ঠা</span>
                </button>

                <span className="text-xs font-mono">পৃষ্ঠা {currentPage}</span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(readingBook.pageCount, prev + 1))}
                  disabled={currentPage === readingBook.pageCount}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-lg disabled:opacity-40 flex items-center gap-1"
                >
                  <span>পরবর্তী পৃষ্ঠা</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

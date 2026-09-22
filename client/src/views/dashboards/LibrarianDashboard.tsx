import React, { useState } from 'react';
import { BorrowRecord, Reservation, FineRecord, Book, User } from '../../types';
import { storage, logActivity } from '../../lib/storage';
import { useToast } from '../../components/common/Toast';
import { ChangePasswordModal } from '../../components/common/ChangePasswordModal';
import { 
  BookOpen, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  PlusCircle, 
  RotateCcw, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound
} from 'lucide-react';

export const LibrarianDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'issue' | 'return' | 'reservations' | 'fines'>('issue');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const books = storage.getBooks();
  const users = storage.getUsers();
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>(() => storage.getBorrowRecords());
  const [reservations, setReservations] = useState<Reservation[]>(() => storage.getReservations());
  const [fines, setFines] = useState<FineRecord[]>(() => storage.getFines());

  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dueDateDays, setDueDateDays] = useState(14);

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedUserId) {
      showToast('বই এবং সদস্য নির্বাচন করুন', 'error');
      return;
    }

    const targetBook = books.find(b => b.id === selectedBookId);
    const targetUser = users.find(u => u.id === selectedUserId);

    if (!targetBook || targetBook.availableCopies <= 0) {
      showToast('নির্বাচনকৃত বইটির কোনো কপি বর্তমানে খালি নেই', 'error');
      return;
    }

    if (!targetUser) {
      showToast('সদস্য পাওয়া যায়নি', 'error');
      return;
    }

    const today = new Date();
    const issueDateStr = today.toISOString().split('T')[0];
    
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + dueDateDays);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const newRecord: BorrowRecord = {
      id: `brw_${Date.now()}`,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      userId: targetUser.id,
      userName: targetUser.fullName,
      userEmail: targetUser.email,
      userMemberId: targetUser.memberId,
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      status: 'issued',
      fineAmount: 0,
      finePaid: true,
      issuedBy: 'আব্দুর রহমান (গ্রন্থাগারিক)'
    };

    storage.addBorrowRecord(newRecord);
    setBorrowRecords(storage.getBorrowRecords());
    
    logActivity(
      'BOOK_ISSUED',
      'CIRCULATION',
      'SUCCESS',
      `বই ইস্যু: "${targetBook.title}" সদস্য ${targetUser.fullName} (ID: ${targetUser.memberId}) কে ${dueDateStr} তারিখ পর্যন্ত ইস্যু করা হয়েছে।`,
      undefined,
      undefined,
      { bookId: targetBook.id, userId: targetUser.id, dueDate: dueDateStr }
    );

    showToast(`"${targetBook.title}" বইটি ${targetUser.fullName}-এর নামে সফলভাবে ইস্যু করা হয়েছে`, 'success');
    
    setSelectedBookId('');
    setSelectedUserId('');
  };

  const handleReturnBook = (record: BorrowRecord) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let lateDays = 0;
    const due = new Date(record.dueDate);
    const now = new Date();
    if (now > due) {
      const diffTime = Math.abs(now.getTime() - due.getTime());
      lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    const fineAmount = lateDays * 2;

    storage.returnBookRecord(record.id, todayStr, fineAmount);

    logActivity(
      'BOOK_RETURNED',
      'CIRCULATION',
      fineAmount > 0 ? 'WARNING' : 'SUCCESS',
      `বই ফেরত গ্রহণ: "${record.bookTitle}" সদস্য ${record.userName}-এর থেকে জমা নেওয়া হয়েছে। ${fineAmount > 0 ? `(বিলম্ব ফি: ৳${fineAmount})` : ''}`,
      undefined,
      undefined,
      { recordId: record.id, fineAmount, lateDays }
    );

    if (fineAmount > 0) {
      const newFine: FineRecord = {
        id: `fn_${Date.now()}`,
        userId: record.userId,
        userName: record.userName,
        userEmail: record.userEmail,
        borrowId: record.id,
        bookTitle: record.bookTitle,
        amount: fineAmount,
        reason: `${lateDays} দিন বিলম্বিত সমর্পণ ফি`,
        date: todayStr,
        status: 'unpaid'
      };
      const existingFines = storage.getFines();
      existingFines.unshift(newFine);
      storage.saveFines(existingFines);
      setFines(existingFines);
      showToast(`বই ফেরত নেওয়া হয়েছে। বিলম্ব ফি: ৳${fineAmount}`, 'info');
    } else {
      showToast('বই সফলভাবে লাইব্রেরিতে ফেরত জমা নেওয়া হয়েছে', 'success');
    }

    setBorrowRecords(storage.getBorrowRecords());
  };

  const handleUpdateReservation = (id: string, status: Reservation['status']) => {
    storage.updateReservationStatus(id, status);
    setReservations(storage.getReservations());

    logActivity(
      'RESERVATION_STATUS_CHANGED',
      'CIRCULATION',
      'INFO',
      `রিজার্ভেশন স্ট্যাটাস পরিবর্তন: ID ${id} কে "${status}" করা হয়েছে।`
    );

    showToast(`রিজার্ভেশন স্ট্যাটাস "${status}" করা হয়েছে`, 'success');
  };

  const handlePayFine = (fineId: string) => {
    storage.payFine(fineId);
    setFines(storage.getFines());

    logActivity(
      'FINE_PAID',
      'FINANCIAL',
      'SUCCESS',
      `জরিমানা পরিশোধ: ফাইন রেকর্ড ${fineId} পরিশোধ সম্পন্ন হিসেবে মার্ক করা হয়েছে।`
    );

    showToast('জরিমানা ফি পরিশোধিত মার্ক করা হয়েছে', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-amber-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-amber-300" />
              <span>গ্রন্থাগারিক কাউন্টার ড্যাশবোর্ড (Circulation Desk)</span>
            </h1>
            <p className="text-xs sm:text-sm text-amber-200 mt-1">
              বই ইস্যু, সমর্পণ ফেরত, বুকিং রিজার্ভেশন ও বিলম্ব ফি সংগ্রহ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-800/80 hover:bg-amber-700 text-amber-100 text-xs font-bold border border-amber-600 flex items-center gap-1.5 shadow-xs transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>পাসওয়ার্ড পরিবর্তন</span>
            </button>
            <span className="bg-amber-950 text-amber-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-amber-700">
              রোল: LIBRARIAN
            </span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('issue')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'issue' ? 'border-amber-600 text-amber-700 dark:text-amber-400' : 'border-transparent text-slate-500'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>বই ইস্যু করুন (Issue Book)</span>
        </button>

        <button
          onClick={() => setActiveTab('return')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'return' ? 'border-amber-600 text-amber-700 dark:text-amber-400' : 'border-transparent text-slate-500'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>বই ফেরত জমা ({borrowRecords.filter(r => r.status === 'issued' || r.status === 'overdue').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'reservations' ? 'border-amber-600 text-amber-700 dark:text-amber-400' : 'border-transparent text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>অনলাইন রিজার্ভেশনসমূহ ({reservations.filter(r => r.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fines')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'fines' ? 'border-amber-600 text-amber-700 dark:text-amber-400' : 'border-transparent text-slate-500'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>বিলম্ব ফি হিসাব</span>
        </button>
      </div>

      {activeTab === 'issue' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-600" />
            <span>সদস্যকে বই ইস্যু ফরম</span>
          </h2>

          <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">ইস্যুকৃত বই নির্বাচন করুন *</label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="">-- বই সিলেক্ট করুন --</option>
                {books.map(b => (
                  <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                    {b.title} ({b.author}) — প্রাপ্য: {b.availableCopies} কপি | সেলফ: {b.shelfNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">গ্রাহক সদস্য নির্বাচন করুন *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="">-- সদস্য সিলেক্ট করুন --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.memberId}) — {u.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">মেয়াদকাল (দিনের সংখ্যা)</label>
              <select
                value={dueDateDays}
                onChange={(e) => setDueDateDays(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={7}>৭ দিন (১ সপ্তাহ)</option>
                <option value={14}>১৪ দিন (২ সপ্তাহ - স্ট্যান্ডার্ড)</option>
                <option value={30}>৩০ দিন (১ মাস)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>বই ইস্যু কনফার্ম করুন</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'return' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            বর্তমানে ধৃত বইয়ের তালিকা ও ফেরত
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-3">বই ও সদস্য</th>
                  <th className="p-3">ইস্যু ও শেষ তারিখ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {borrowRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <strong className="block text-slate-900 dark:text-white">{rec.bookTitle}</strong>
                      <span className="text-[11px] text-slate-500">{rec.userName} ({rec.userMemberId})</span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div>ইস্যু: {rec.issueDate}</div>
                      <div className="text-rose-500 font-bold">মেয়াদ শেষ: {rec.dueDate}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'returned'
                          ? 'bg-slate-100 text-slate-700'
                          : rec.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rec.status === 'returned' ? 'ফেরত জমা' : rec.status === 'overdue' ? 'বিলম্বিত (Overdue)' : 'ইস্যুকৃত'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {rec.status !== 'returned' && (
                        <button
                          onClick={() => handleReturnBook(rec)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                        >
                          ফেরত জমা নিন
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            সদস্যদের অনলাইন বুকিং ও রিজার্ভেশন
          </h2>

          <div className="space-y-3">
            {reservations.map(res => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{res.bookTitle}</h4>
                  <p className="text-slate-500">অনুরোধকারী সদস্য: {res.userName} ({res.userMemberId})</p>
                  <p className="text-slate-400 font-mono mt-1">তারিখ: {res.reservationDate} | নোট: {res.notes}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    res.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {res.status}
                  </span>

                  {res.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateReservation(res.id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                    >
                      অনুমোদন করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            বিলম্ব ফি ও জরিমানা রেকর্ড
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase">
                <tr>
                  <th className="p-3">সদস্য ও বই</th>
                  <th className="p-3">কারণ</th>
                  <th className="p-3">পরিমাণ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fines.map(fn => (
                  <tr key={fn.id}>
                    <td className="p-3">
                      <strong>{fn.userName}</strong>
                      <span className="block text-[11px] text-slate-400">{fn.bookTitle}</span>
                    </td>
                    <td className="p-3">{fn.reason}</td>
                    <td className="p-3 font-bold text-rose-600">৳{fn.amount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fn.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fn.status === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {fn.status === 'unpaid' && (
                        <button
                          onClick={() => handlePayFine(fn.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                        >
                          পরিশোধ মার্ক করুন
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

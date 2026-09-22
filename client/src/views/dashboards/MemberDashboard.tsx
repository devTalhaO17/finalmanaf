import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../lib/storage';
import { BarcodeGenerator, QRCodeVisual } from '../../components/common/QRCodeCanvas';
import { BookCard } from '../../components/common/BookCard';
import { ChangePasswordModal } from '../../components/common/ChangePasswordModal';
import { useToast } from '../../components/common/Toast';
import { Book, ViewName, SystemLog } from '../../types';
import { 
  User as UserIcon, 
  CreditCard, 
  BookOpen, 
  Clock, 
  Bookmark, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  QrCode,
  KeyRound,
  ShieldCheck,
  Edit3,
  Save,
  Phone,
  Mail,
  MapPin,
  History,
  Lock,
  Camera,
  CheckCircle2
} from 'lucide-react';

interface MemberDashboardProps {
  onSelectBook: (book: Book) => void;
  onNavigate: (view: ViewName) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ onSelectBook, onNavigate }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'card' | 'borrowed' | 'reservations' | 'favorites' | 'fines' | 'profile'>('card');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  if (!user) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold">অনুগ্রহ করে ড্যাশবোর্ড দেখতে লগইন করুন</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
        >
          লগইন পাতা
        </button>
      </div>
    );
  }

  const allBorrows = storage.getBorrowRecords().filter(r => r.userId === user.id);
  const activeBorrows = allBorrows.filter(r => r.status === 'issued' || r.status === 'overdue');
  const reservations = storage.getReservations().filter(r => r.userId === user.id);
  const fines = storage.getFines().filter(f => f.userId === user.id);
  
  const favoriteIds = storage.getFavorites(user.id);
  const favoriteBooks = storage.getBooks().filter(b => favoriteIds.includes(b.id));

  const memberLogs = storage.getSystemLogs()
    .filter(l => l.actor.id === user.id || l.actor.email.toLowerCase() === user.email.toLowerCase())
    .slice(0, 10);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) {
      showToast('নাম এবং মোবাইল নম্বর দেওয়া আবশ্যক', 'error');
      return;
    }

    updateProfile({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl
    });

    setIsEditingProfile(false);
    showToast('আপনার প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে', 'success');
  };

  const handleInTabPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      showToast('সকল পাসওয়ার্ড ঘর পূরণ করুন', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না', 'error');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(currentPass, newPass);
    setIsChangingPass(false);

    if (res.success) {
      showToast(res.message, 'success');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-700/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <QrCode className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-emerald-950" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center font-bold text-2xl text-amber-300 shrink-0 shadow-md">
                  {user.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  স্বাগতম, {user.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  সক্রিয় সদস্য
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 flex items-center gap-2">
                <span>আইডি: <strong className="font-mono font-bold text-amber-300">{user.memberId}</strong></span>
                <span>•</span>
                <span>মোবাইল: {user.mobile || 'যুক্ত নেই'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-semibold text-xs rounded-xl border border-emerald-600 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <UserIcon className="w-4 h-4 text-emerald-300" />
              <span>প্রোফাইল ও নিরাপত্তা</span>
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-semibold text-xs rounded-xl border border-emerald-600 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>পাসওয়ার্ড পরিবর্তন</span>
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>মেম্বার আইডি কার্ড</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('card')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'card' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>মেম্বারশিপ কার্ড</span>
        </button>

        <button
          onClick={() => setActiveTab('borrowed')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'borrowed' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ধৃত বইসমূহ ({activeBorrows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'reservations' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>আমার রিজার্ভেশন ({reservations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'favorites' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>পছন্দের তালিকা ({favoriteBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fines')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'fines' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>বিলম্ব ফি রেকর্ড</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>প্রোফাইল ও নিরাপত্তা</span>
        </button>
      </div>

      {activeTab === 'card' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-600 relative overflow-hidden space-y-6">
            
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
              <div>
                <h3 className="text-sm font-bold text-emerald-200">
                  Speaker Abdul Jabbar Khan Memorial Public Library
                </h3>
                <p className="text-[10px] text-emerald-400">ডিজিটাল মেম্বারশিপ স্মার্ট কার্ড</p>
              </div>
              <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-600">
                MEMBER
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-8 space-y-2 text-xs">
                <div>
                  <span className="text-emerald-400 block text-[10px] font-bold">সদস্যের নাম:</span>
                  <strong className="text-base font-bold text-white">{user.fullName}</strong>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[10px] font-bold">সদস্য আইডি নম্বর:</span>
                  <strong className="text-sm font-mono tracking-wider text-amber-300">{user.memberId}</strong>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[10px] font-bold">ইমেইল ও মোবাইল:</span>
                  <span className="text-slate-300">{user.email} | {user.mobile}</span>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[10px] font-bold">ঠিকানা:</span>
                  <span className="text-slate-300">{user.address || 'তথ্য দেওয়া হয়নি'}</span>
                </div>
              </div>

              <div className="sm:col-span-4 flex flex-col items-center justify-center space-y-2">
                <QRCodeVisual value={user.memberId} size={90} />
                <span className="text-[10px] font-mono text-emerald-300">স্ক্যান আইডি</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-800/80">
              <BarcodeGenerator code={user.memberId} />
            </div>

          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">আমার ব্যক্তিগত প্রোফাইল</h3>
                  <p className="text-xs text-slate-500">আপনার নাম, মোবাইল নম্বর এবং ঠিকানা সম্পাদনা করুন</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isEditingProfile) {
                    setIsEditingProfile(false);
                    setFullName(user.fullName);
                    setMobile(user.mobile);
                    setAddress(user.address);
                  } else {
                    setIsEditingProfile(true);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  isEditingProfile 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'বাতিল' : 'সম্পাদনা করুন'}</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পুরো নাম (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditingProfile}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সদস্য আইডি (Member ID)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.memberId}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-amber-600 dark:text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইমেইল ঠিকানা (Email)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর (Mobile) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditingProfile}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="০১৭xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ঠিকানা (Address)
                </label>
                <textarea
                  rows={2}
                  disabled={!isEditingProfile}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  প্রোফাইল ছবি URL (Avatar Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    disabled={!isEditingProfile}
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500 text-xs"
                  />
                  {isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || user.fullName)}`)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs whitespace-nowrap"
                    >
                      স্বয়ংক্রিয় ছবি
                    </button>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">পাসওয়ার্ড পরিবর্তন করুন</h3>
                  <p className="text-[11px] text-slate-500">নিয়মিত পাসওয়ার্ড আপডেট রেখে অ্যাকাউন্ট নিরাপদ রাখুন</p>
                </div>
              </div>

              <form onSubmit={handleInTabPasswordChange} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বর্তমান পাসওয়ার্ড *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    নতুন পাসওয়ার্ড (৬+ অক্ষর) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    নতুন পাসওয়ার্ড নিশ্চিত করুন *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড পুনরায় লিখুন"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>পাসওয়ার্ড আপডেট সম্পন্ন করুন</span>
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                <History className="w-4 h-4 text-emerald-600" />
                <span>আমার সাম্প্রতিক নিরাপত্তা ও লগইন রেকর্ড</span>
              </div>

              {memberLogs.length === 0 ? (
                <p className="text-slate-500 py-3 text-center">কোনো লগ রেকর্ড সংরক্ষিত নেই।</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
                  {memberLogs.map(l => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{l.details}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(l.timestamp).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        l.severity === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        l.severity === 'WARNING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {l.action}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {activeTab === 'borrowed' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            আমার বর্তমানে ধৃত বই ও ইতিহাস
          </h2>

          <div className="space-y-3">
            {allBorrows.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">আপনি এখনও কোনো বই ধার নেননি।</p>
            ) : (
              allBorrows.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rec.bookTitle}</h4>
                    <p className="text-slate-500 font-mono mt-1">
                      ইস্যু তারিখ: {rec.issueDate} • সমর্পণ শেষ তারিখ: <strong className="text-rose-500">{rec.dueDate}</strong>
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rec.status === 'returned'
                      ? 'bg-slate-200 text-slate-700'
                      : rec.status === 'overdue'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {rec.status === 'returned' ? 'ফেরত দেওয়া হয়েছে' : rec.status === 'overdue' ? 'মেয়াদ উত্তীর্ণ (Overdue)' : 'সক্রিয় ইস্যু'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            আমার অনলাইন রিজার্ভেশনসমূহ
          </h2>

          <div className="space-y-3">
            {reservations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">আপনার কোনো অনলাইন রিজার্ভেশন অনুরোধ নেই।</p>
            ) : (
              reservations.map(res => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={res.bookCover} alt={res.bookTitle} className="w-10 h-14 object-cover rounded-md" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{res.bookTitle}</h4>
                      <p className="text-slate-400 font-mono">আবেদনের তারিখ: {res.reservationDate}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {res.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            আমার সংরক্ষিত পছন্দের বইয়ের তালিকা
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={onSelectBook}
                isFavorite={true}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            বিলম্ব ফি সংক্রান্ত তথ্য
          </h2>
          {fines.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">আপনার কোনো বকেয়া বা বিলম্ব ফি নেই।</p>
          ) : (
            <div className="space-y-3">
              {fines.map(f => (
                <div key={f.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{f.bookTitle}</h4>
                    <p className="text-slate-500">{f.reason} • তারিখ: {f.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-rose-600 block">৳ {f.amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {f.status === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

    </div>
  );
};

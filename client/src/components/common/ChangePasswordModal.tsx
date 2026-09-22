import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { KeyRound, Lock, X, CheckCircle2, Eye, EyeOff, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const { user, changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);

  const strengthScore = [hasLength, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: '', color: 'bg-slate-200' };
    if (strengthScore <= 1) return { label: 'দুর্বল (Weak)', color: 'bg-rose-500', text: 'text-rose-600' };
    if (strengthScore <= 3) return { label: 'মাঝারি (Moderate)', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'মজবুত ও সুরক্ষিত (Strong)', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('সকল তথ্য পূরণ করুন', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      showToast(res.message, 'success');
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">পাসওয়ার্ড পরিবর্তন করুন</h3>
              <p className="text-[11px] text-slate-500 font-normal">অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নিয়মিত পাসওয়ার্ড আপডেট রাখুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              বর্তমান পাসওয়ার্ড (Current Password) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="আপনার বর্তমান পাসওয়ার্ড লিখুন"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              নতুন পাসওয়ার্ড (New Password) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর লিখুন"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">পাসওয়ার্ড শক্তি:</span>
                  <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  <div className={`rounded-full ${strengthScore >= 1 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`rounded-full ${strengthScore >= 2 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`rounded-full ${strengthScore >= 3 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`rounded-full ${strengthScore >= 4 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                  <span className={`flex items-center gap-1 ${hasLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    {hasLength ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />} ৬+ অক্ষর
                  </span>
                  <span className={`flex items-center gap-1 ${hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    {hasLetter ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />} বর্ণমালা (A-Z, a-z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    {hasNumber ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />} সংখ্যা (0-9)
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    {hasSpecial ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />} বিশেষ চিহ্ন (@, #, $)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              নতুন পাসওয়ার্ড নিশ্চিতকরণ (Confirm Password) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড পুনঃরায় লিখুন"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3" /> পাসওয়ার্ড দুটি মিলছে না
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> পাসওয়ার্ড মিলেছে
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>পাসওয়ার্ড আপডেট করুন</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};


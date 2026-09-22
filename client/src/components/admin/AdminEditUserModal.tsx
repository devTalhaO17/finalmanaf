import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { storage, mockHashPassword, logActivity } from '../../lib/storage';
import { useToast } from '../common/Toast';
import { 
  X, 
  UserCheck, 
  Shield, 
  KeyRound, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface AdminEditUserModalProps {
  user: User;
  onClose: () => void;
  onSaved: (updatedUser: User) => void;
}

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ user, onClose, onSaved }) => {
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [mobile, setMobile] = useState(user.mobile || '');
  const [address, setAddress] = useState(user.address || '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<'active' | 'suspended' | 'pending'>(user.status || 'active');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mustChangeOnLogin, setMustChangeOnLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      showToast('নাম এবং ইমেইল প্রদান আবশ্যক', 'error');
      return;
    }

    if (isChangingPassword && newPassword.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error');
      return;
    }

    const updatedUser: User = {
      ...user,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      address: address.trim(),
      role: role,
      status: status,
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
      ...(isChangingPassword && newPassword ? {
        passwordHash: mockHashPassword(newPassword),
        mustChangePassword: mustChangeOnLogin
      } : {})
    };

    storage.updateUser(updatedUser);

    logActivity(
      'ADMIN_EDIT_USER',
      'USER_MANAGEMENT',
      'SUCCESS',
      `অ্যাডমিন কর্তৃক ইউজার "${updatedUser.fullName}" (${updatedUser.email}, রোল: ${updatedUser.role}, স্ট্যাটাস: ${updatedUser.status}) এর প্রোফাইল${isChangingPassword ? ' ও পাসওয়ার্ড' : ''} আপডেট করা হয়েছে।`,
      undefined,
      undefined,
      {
        targetUserId: updatedUser.id,
        targetEmail: updatedUser.email,
        updatedRole: updatedUser.role,
        updatedStatus: updatedUser.status,
        passwordChanged: isChangingPassword
      }
    );

    showToast(`ব্যবহারকারী "${updatedUser.fullName}" এর তথ্য সফলভাবে আপডেট হয়েছে!`, 'success');
    onSaved(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-300 dark:border-emerald-800">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.fullName.charAt(0)
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                ব্যবহারকারী প্রোফাইল ও পাসওয়ার্ড সম্পাদনা
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                আইডি: <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.memberId || user.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                পূর্ণ নাম (Full Name) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ইমেইল এড্রেস (Email) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মোবাইল নম্বর (Mobile)
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="০১xxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                সদস্যের ভূমিকা (Role) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="MEMBER">MEMBER (সাধারণ সদস্য)</option>
                <option value="LIBRARIAN">LIBRARIAN (সহকারী লাইব্রেরিয়ান)</option>
                <option value="LIBRARY_ADMIN">LIBRARY_ADMIN (লাইব্রেরি অ্যাডমিন)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (সুপার অ্যাডমিন)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                অ্যাকাউন্ট স্ট্যাটাস (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="active">Active (সক্রিয়)</option>
                <option value="suspended">Suspended (স্থগিত / সাময়িক বন্ধ)</option>
                <option value="pending">Pending (অনুমোদনের অপেক্ষায়)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                প্রোফাইল ছবি URL (Avatar)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ঠিকানা (Address)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="গ্রাম/রোড, বাবুগঞ্জ, বরিশাল"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>পাসওয়ার্ড পরিবর্তন / রিসেট (Admin Password Reset)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="px-3 py-1 bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-100 rounded-lg text-[11px] font-bold hover:bg-amber-300 transition-colors"
              >
                {isChangingPassword ? 'বাতিল করুন' : 'নতুন পাসওয়ার্ড সেট করুন'}
              </button>
            </div>

            {isChangingPassword && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    ইউজারের নতুন পাসওয়ার্ড নির্ধারণ করুন (কমপক্ষে ৬ অক্ষর) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="যেমন: Member@123 বা Admin@123"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mustChange"
                    checked={mustChangeOnLogin}
                    onChange={(e) => setMustChangeOnLogin(e.target.checked)}
                    className="rounded-md border-amber-400 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="mustChange" className="text-[11px] text-slate-700 dark:text-slate-300">
                    পরবর্তী লগইনে ব্যবহারকারীকে নিজ পাসওয়ার্ড পরিবর্তনের জন্য নির্দেশ দিন
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

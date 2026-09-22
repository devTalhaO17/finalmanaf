import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ViewName } from '../types';
import {
  User, Lock, Mail, ArrowRight, CheckCircle2, KeyRound, Eye, EyeOff,
  AlertCircle, Send, Loader2, MailCheck, Phone, MapPin, UserPlus, Info
} from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onNavigate: (view: ViewName) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

const inputClass =
  'w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors';

const labelClass =
  'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onNavigate }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { login, register, resendConfirmation, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');

  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (resendCount <= 0) return;
    const t = setTimeout(() => setResendCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCount]);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setFormError('');
    setFormSuccess('');
    setPending(false);
  };

  const clearError = () => {
    if (formError) setFormError('');
  };

  const redirectByRole = (role?: string) => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'LIBRARY_ADMIN' || role === 'LIBRARIAN') {
      onNavigate('admin');
    } else {
      onNavigate('member');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!loginEmail || !loginPassword) {
      setFormError('ইমেইল ও পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    setPending(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success && res.user) {
        showToast(res.message, 'success');
        redirectByRole(res.user.role);
      } else {
        setFormError(res.message || 'অনুমোদন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch {
      setFormError('সার্ভার ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।');
    } finally {
      setPending(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (password !== confirmPassword) {
      setFormError('পাসওয়ার্ড মিলছে না।');
      return;
    }
    if (password.length < 6) {
      setFormError('পাসওয়ার্ড নূন্যতম ৬ অক্ষরের হতে হবে।');
      return;
    }
    setPending(true);
    try {
      const res = await register({ fullName, email, mobile, address, password, confirmPassword });
      if (res.success) {
        if (res.user) {
          showToast(res.message, 'success');
          redirectByRole(res.user.role);
        } else {
          setRegisteredEmail(email.trim().toLowerCase());
          setFormSuccess(res.message);
        }
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError('সার্ভার ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।');
    } finally {
      setPending(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!forgotEmail) {
      setFormError('আপনার রেজিস্টার্ড ইমেইল দিন।');
      return;
    }
    setPending(true);
    try {
      const res = await resetPassword(forgotEmail);
      if (res.success) {
        setFormSuccess(res.message);
        showToast(res.message, 'success');
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError('সার্ভার ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।');
    } finally {
      setPending(false);
    }
  };

  const handleResend = async () => {
    if (resendCount > 0 || !registeredEmail) return;
    setFormError('');
    setFormSuccess('');
    setPending(true);
    try {
      const res = await resendConfirmation(registeredEmail);
      if (res.success) {
        setFormSuccess(res.message);
        setResendCount(60);
      } else {
        setFormError(res.message);
        setResendCount(60);
      }
    } catch {
      setFormError('সার্ভার ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।');
    } finally {
      setPending(false);
    }
  };

  const alertBox =
    formError || formSuccess ? (
      <div
        className={`mb-5 flex items-start gap-3 p-3.5 rounded-xl border text-sm leading-relaxed ${
          formError
            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
        }`}
        role="alert"
      >
        {formError ? (
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
        ) : (
          <MailCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        )}
        <span>{formError || formSuccess}</span>
      </div>
    ) : null;

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-3.5 text-sm font-bold text-center transition-colors ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            লগইন (Sign In)
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-3.5 text-sm font-bold text-center transition-colors ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            রেজিস্ট্রেশন (Register)
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {alertBox}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  লাইব্রেরি পোর্টালে লগইন করুন
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  Speaker Abdul Jabbar Khan Memorial Public Library
                </p>
              </div>

              <div>
                <label className={labelClass}>ইমেইল (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); clearError(); }}
                    placeholder="your@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>পাসওয়ার্ড (Password)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="পাসওয়ার্ড দেখুন"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span>আমাকে মনে রাখুন</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>প্রবেশ করুন (Login)</span>
                {!pending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : mode === 'forgot' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">পাসওয়ার্ড রিসেট করুন</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  রেজিস্টার্ড ইমেইল দিন — সেখানে রিসেট লিংক পাঠানো হবে।
                </p>
              </div>

              <div>
                <label className={labelClass}>ইমেইল (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); clearError(); }}
                    placeholder="your@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>রিসেট লিংক পাঠান</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
              >
                ← লগইনে ফিরে যান
              </button>
            </form>
          ) : !formSuccess ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  নতুন সদস্য হিসেবে যোগ দিন
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  এক নিমিষেই আপনার লাইব্রেরি সদস্যপদ তৈরি হয়ে যাবে।
                </p>
              </div>

              <div className="space-y-4">
                <div className="pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  <span>ব্যক্তিগত তথ্য</span>
                </div>

                <div>
                  <label className={labelClass}>পূর্ণ নাম (Full Name) *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); clearError(); }}
                      placeholder="যেমন: মোঃ সাকিব হোসেন"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>মোবাইল নম্বর *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => { setMobile(e.target.value); clearError(); }}
                        placeholder="01700000000"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>ইমেইল (Email) *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearError(); }}
                        placeholder="your@email.com"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>পূর্ণ ঠিকানা (Address) *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); clearError(); }}
                      placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>লগইন তথ্য</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>পাসওয়ার্ড *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError(); }}
                        placeholder="নূন্যতম ৬ অক্ষর"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>কনফার্ম পাসওয়ার্ড *</label>
                    <div className="relative">
                      <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                        placeholder="পুনরায় লিখুন"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {password.length > 0 && password.length < 6 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>সদস্য অ্যাকাউন্ট তৈরি করুন</span>
              </button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                রেজিস্ট্রেশনের মাধ্যমে আপনি লাইব্রেরির <strong>সাধারণ সদস্যপদ</strong> পেতে যাচ্ছেন।
              </p>
            </form>
          ) : (
            <div className="text-center py-4 space-y-5">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  ইমেইল চেক করুন
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-emerald-700 dark:text-emerald-400">{registeredEmail}</strong>{' '}
                  ঠিকানায় কনফার্মেশন লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করার পর লগইন করুন।
                  ইমেইল না পেলে স্প্যাম ফোল্ডার দেখুন।
                </p>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCount > 0 || pending}
                className="w-full py-3 rounded-2xl border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>
                  {resendCount > 0
                    ? `পুনরায় পাঠান (${resendCount} সে.)`
                    : 'কনফার্মেশন ইমেইল আবার পাঠান'}
                </span>
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setFormSuccess(''); setFormError(''); }}
                  className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
                >
                  ইমেইল বদলান
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
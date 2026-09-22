import React from 'react';
import { ViewName } from '../types';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';

interface AccessDeniedViewProps {
  onNavigate: (view: ViewName) => void;
  requiredRole?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ onNavigate, requiredRole }) => {
  const { user } = useAuth();

  const handleGoToDashboard = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    switch (user.role) {
      case 'SUPER_ADMIN':
        onNavigate('super-admin');
        break;
      case 'LIBRARY_ADMIN':
      case 'LIBRARIAN':
        onNavigate('admin');
        break;
      case 'MEMBER':
      default:
        onNavigate('member');
        break;
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px] font-bold rounded-full uppercase tracking-wider">
            403 — Restricted Area
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            You don't have permission to access this page.
          </p>
          {requiredRole && (
            <p className="text-xs text-rose-500 font-mono">
              (Requires role: {requiredRole})
            </p>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed border-t border-b border-slate-100 dark:border-slate-800 py-3">
          এই পৃষ্ঠাটি ব্যবহারের জন্য আপনার অ্যাকাউন্টের পর্যাপ্ত পারমিশন নেই। অনুগ্রহ করে আপনার নির্ধারিত ড্যাশবোর্ডে ফিরে যান অথবা অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরুন</span>
          </button>
        </div>

      </div>
    </div>
  );
};

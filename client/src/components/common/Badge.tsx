import React from 'react';
import { UserRole } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'emerald', size = 'md' }) => {
  const variantClasses = {
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50',
    gray: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return <Badge variant="rose">সুপার এডমিন</Badge>;
    case 'LIBRARY_ADMIN':
      return <Badge variant="indigo">লাইব্রেরি পরিচালক</Badge>;
    case 'LIBRARIAN':
      return <Badge variant="amber">গ্রন্থাগারিক</Badge>;
    case 'MEMBER':
    default:
      return <Badge variant="emerald">সদস্য</Badge>;
  }
};

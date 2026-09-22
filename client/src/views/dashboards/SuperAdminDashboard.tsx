import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { storage, mockHashPassword, logActivity } from '../../lib/storage';
import { pushAllLocal } from '../../lib/sync';
import { RoleBadge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { ChangePasswordModal } from '../../components/common/ChangePasswordModal';
import { AdminLogViewer } from '../../components/admin/AdminLogViewer';
import { AdminEditUserModal } from '../../components/admin/AdminEditUserModal';
import { LibraryAdminDashboard } from './LibraryAdminDashboard';
import { canManageUsers } from '../../lib/roles';
import { 
  Users, 
  Shield, 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  UserPlus, 
  BarChart3, 
  BookOpen, 
  KeyRound, 
  Database,
  RefreshCw,
  CheckCircle2,
  X,
  Activity,
  Edit,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CloudUpload
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { user: currentUser, changePassword } = useAuth();
  const { showToast } = useToast();
  const superAdmin = canManageUsers(currentUser?.role);

  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [activeTab, setActiveTab] = useState<'users' | 'library_mgmt' | 'logs' | 'reports' | 'backup' | 'password'>(
    () => (canManageUsers(currentUser?.role) ? 'users' : 'library_mgmt')
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [showAdminPassFields, setShowAdminPassFields] = useState(false);
  const [isUpdatingSelfPass, setIsUpdatingSelfPass] = useState(false);

  const [selectedUserForReset, setSelectedUserForReset] = useState<string>('');
  const [quickNewPassword, setQuickNewPassword] = useState('Library123');

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('LIBRARY_ADMIN');
  const [newPassword, setNewPassword] = useState('Library123');

  const books = storage.getBooks();
  const digitalBooks = storage.getDigitalBooks();
  const notices = storage.getNotices();
  const events = storage.getEvents();
  const borrows = storage.getBorrowRecords();

  const [isPushingCloud, setIsPushingCloud] = useState(false);

  const handlePushToCloud = async () => {
    setIsPushingCloud(true);
    const res = await pushAllLocal();
    setIsPushingCloud(false);
    showToast(res.message, res.ok ? 'success' : 'error');
  };

  const handleAdminChangeSelfPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!currentAdminPass || !newAdminPass || !confirmAdminPass) {
      showToast('সকল তথ্য পূরণ করুন', 'error');
      return;
    }
    if (newAdminPass.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      showToast('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না', 'error');
      return;
    }

    setIsUpdatingSelfPass(true);
    const res = await changePassword(currentAdminPass, newAdminPass);
    setIsUpdatingSelfPass(false);

    if (res.success) {
      showToast('আপনার অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!', 'success');
      setCurrentAdminPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleQuickResetUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) {
      showToast('একটি ব্যবহারকারী অ্যাকাউন্ট নির্বাচন করুন', 'error');
      return;
    }
    if (!quickNewPassword || quickNewPassword.length < 6) {
      showToast('পাসওয়ার্ড নূন্যতম ৬ অক্ষরের হতে হবে', 'error');
      return;
    }

    const targetUser = users.find(u => u.id === selectedUserForReset);
    if (!targetUser) {
      showToast('ব্যবহারকারী পাওয়া যায়নি', 'error');
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.id === selectedUserForReset) {
        return {
          ...u,
          passwordHash: mockHashPassword(quickNewPassword),
          mustChangePassword: false
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);

    logActivity(
      'USER_PASSWORD_CHANGED_BY_ADMIN',
      'SECURITY',
      'WARNING',
      `সুপার অ্যাডমিন কর্তৃক ${targetUser.fullName} (${targetUser.email}) এর পাসওয়ার্ড পরিবর্তন করা হয়েছে।`,
      undefined,
      undefined,
      { targetUserId: targetUser.id, targetEmail: targetUser.email }
    );

    showToast(`${targetUser.fullName}-এর পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে! নতুন পাসওয়ার্ড: ${quickNewPassword}`, 'success');
  };

  const handleRoleChange = (userId: string, targetRole: UserRole) => {
    const target = users.find(u => u.id === userId);
    const updated = users.map(u => u.id === userId ? { ...u, role: targetRole } : u);
    setUsers(updated);
    storage.saveUsers(updated);

    if (target) {
      logActivity(
        'USER_ROLE_CHANGED',
        'USER_MANAGEMENT',
        'WARNING',
        `সুপার এডমিন কর্তৃক ${target.fullName} (${target.email}) এর ভূমিকা ${target.role} থেকে পরিবর্তন করে ${targetRole} নির্ধারণ করা হয়েছে।`,
        undefined,
        undefined,
        { userId, previousRole: target.role, newRole: targetRole }
      );
    }

    showToast(`ব্যবহারকারীর রোল পরিবর্তন করে ${targetRole} করা হয়েছে`, 'success');
  };

  const handleStatusToggle = (userId: string) => {
    const target = users.find(u => u.id === userId);
    const nextStatus = target?.status === 'active' ? ('suspended' as const) : ('active' as const);
    
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    storage.saveUsers(updated);

    if (target) {
      logActivity(
        'USER_STATUS_TOGGLE',
        'USER_MANAGEMENT',
        nextStatus === 'suspended' ? 'WARNING' : 'SUCCESS',
        `সুপার এডমিন কর্তৃক ${target.fullName} (${target.email}) এর অ্যাকাউন্ট স্ট্যাটাস "${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'}" করা হয়েছে।`,
        undefined,
        undefined,
        { userId, newStatus: nextStatus }
      );
    }

    showToast(`ব্যবহারকারীর স্ট্যাটাস "${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'}" করা হয়েছে`, 'info');
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target?.role === 'SUPER_ADMIN' && users.filter(u => u.role === 'SUPER_ADMIN').length <= 1) {
      showToast('সিস্টেমে অন্তত একজন সুপার এডমিন থাকা বাধ্যতামূলক', 'error');
      return;
    }

    if (window.confirm(`আপনি কি নিশ্চিত যে "${target?.fullName}" ব্যবহারকারীকে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      storage.deleteUser(userId);
      setUsers(storage.getUsers());

      if (target) {
        logActivity(
          'USER_DELETED',
          'USER_MANAGEMENT',
          'DANGER',
          `সুপার এডমিন কর্তৃক ইউজার "${target.fullName}" (${target.email}, রোল: ${target.role}) ডাটাবেজ থেকে মুছে ফেলা হয়েছে।`,
          undefined,
          undefined,
          { deletedUserId: userId, deletedUserEmail: target.email }
        );
      }

      showToast('ব্যবহারকারী মুছে ফেলা হয়েছে', 'success');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newMobile) {
      showToast('সকল আবশ্যক তথ্য প্রদান করুন', 'error');
      return;
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    const duplicate = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      showToast('এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে', 'error');
      return;
    }

    const memberNum = 2000 + users.length + 1;
    const newMemberId = `SAJKS-${newRole.substring(0,2)}-${memberNum}`;

    const newUser: User = {
      id: `usr_adm_${Date.now()}`,
      fullName: newFullName.trim(),
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      mobile: newMobile.trim(),
      address: newAddress.trim() || 'বাবুগঞ্জ, বরিশাল',
      role: newRole,
      passwordHash: mockHashPassword(newPassword),
      mustChangePassword: true,
      isEmailVerified: true,
      memberId: newMemberId,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    storage.addUser(newUser);
    setUsers(storage.getUsers());

    logActivity(
      'USER_CREATED_BY_ADMIN',
      'USER_MANAGEMENT',
      'SUCCESS',
      `সুপার এডমিন কর্তৃক নতুন একাউন্ট তৈরি করা হয়েছে: ${newUser.fullName} (${newUser.email}, রোল: ${newUser.role}, আইডি: ${newMemberId})`,
      undefined,
      undefined,
      { createdUserId: newUser.id, role: newUser.role }
    );

    setShowAddModal(false);
    setNewFullName('');
    setNewEmail('');
    setNewMobile('');
    showToast(`নতুন ব্যবহারকারী সফলভাবে তৈরি হয়েছে! ID: ${newMemberId}`, 'success');
  };

  const handleExportBackup = () => {
    const backupData = {
      users: storage.getUsers(),
      books: storage.getBooks(),
      digitalBooks: storage.getDigitalBooks(),
      notices: storage.getNotices(),
      events: storage.getEvents(),
      gallery: storage.getGallery(),
      donors: storage.getDonors(),
      siteInfo: storage.getSiteInfo(),
      mediaLibrary: storage.getMediaLibrary(),
      systemLogs: storage.getSystemLogs(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sajks_library_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    logActivity(
      'DATABASE_BACKUP_EXPORTED',
      'SYSTEM',
      'SUCCESS',
      'সম্পূর্ণ সিস্টেম ডাটাবেজ (JSON ব্যাকআপ) ডাউনলোড করা হয়েছে।'
    );

    showToast('সিস্টেম ডাটাবেজ ব্যাকআপ (JSON) সফলভাবে ডাউনলোড হয়েছে!', 'success');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.books) storage.saveBooks(data.books);
        if (data.users) storage.saveUsers(data.users);
        if (data.digitalBooks) storage.saveDigitalBooks(data.digitalBooks);
        if (data.notices) storage.saveNotices(data.notices);
        if (data.events) storage.saveEvents(data.events);
        if (data.gallery) storage.saveGallery(data.gallery);
        if (data.donors) storage.saveDonors(data.donors);
        if (data.siteInfo) storage.saveSiteInfo(data.siteInfo);
        if (data.mediaLibrary) storage.saveMediaLibrary(data.mediaLibrary);
        if (data.systemLogs) storage.saveSystemLogs(data.systemLogs);

        logActivity(
          'DATABASE_BACKUP_RESTORED',
          'SYSTEM',
          'WARNING',
          'JSON ব্যাকআপ ফাইল থেকে সম্পূর্ণ ডাটাবেজ পুনরুদ্ধার (Restore) করা হয়েছে।'
        );

        showToast('ডাটাবেজ ব্যাকআপ ফাইল সফলভাবে রিস্টোর করা হয়েছে!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast('অকার্যকর ব্যাকআপ ফাইল। সঠিক JSON ফাইল সিলেক্ট করুন।', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
              <Shield className="w-6 h-6 text-rose-300" />
              <span>সুপার এডমিন কন্ট্রোল প্যানেল (Super Admin Panel)</span>
            </h1>
            <p className="text-xs sm:text-sm text-rose-200 mt-1">
              সম্পূর্ণ ওয়েবসাইট নিয়ন্ত্রণ, ইউজার প্রোফাইল ও পাসওয়ার্ড ম্যানেজমেন্ট, অডিট লগ ও ব্যাকআপ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-100 font-semibold text-xs rounded-xl border border-rose-700 transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-rose-300" />
              <span>পাসওয়ার্ড পরিবর্তন</span>
            </button>
            <span className="bg-rose-950 text-rose-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-rose-700">
              রোল: SUPER_ADMIN
            </span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-none">
        {superAdmin && (
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-rose-600 text-rose-700 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ব্যবহারকারী ও এডমিন কন্ট্রোল ({users.length})</span>
        </button>
        )}

        {superAdmin && (
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-rose-600 text-rose-700 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>সিস্টেম অডিট ও অ্যাক্টিভিটি লগ</span>
        </button>
        )}

        <button
          onClick={() => setActiveTab('library_mgmt')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'library_mgmt'
              ? 'border-rose-600 text-rose-700 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>লাইব্রেরি ও কনটেন্ট ম্যানেজমেন্ট</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-rose-600 text-rose-700 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>রিপোর্টস ও অ্যানালিটিক্স</span>
        </button>

        {superAdmin && (
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'backup'
              ? 'border-rose-600 text-rose-700 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ডাটাবেজ ব্যাকআপ ও রিস্টোর</span>
        </button>
        )}

        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'password'
              ? 'border-rose-600 text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4 text-rose-500" />
          <span>পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা</span>
        </button>
      </div>

      {superAdmin && activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                নিবন্ধিত ব্যবহারকারী ও এডমিনদের তালিকা
              </h2>
              <p className="text-xs text-slate-500">
                সুপার এডমিন হিসেবে যেকোনো ব্যবহারকারীর তথ্য, ভূমিকা (Role) ও পাসওয়ার্ড সরাসরি রিসেট/সম্পাদনা করুন
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন এডমিন / ইউজার তৈরি করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">আইডি ও নাম</th>
                  <th className="p-3.5">যোগাযোগ</th>
                  <th className="p-3.5">বর্তমান রোল</th>
                  <th className="p-3.5">রোল পরিবর্তন</th>
                  <th className="p-3.5">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            u.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <strong className="block text-slate-900 dark:text-white font-bold">{u.fullName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{u.memberId || u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{u.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.mobile || 'মোবাইল যুক্ত নেই'}</div>
                    </td>
                    <td className="p-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="LIBRARY_ADMIN">LIBRARY_ADMIN</option>
                        <option value="LIBRARIAN">LIBRARIAN</option>
                        <option value="MEMBER">MEMBER</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleStatusToggle(u.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 ${
                          u.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {u.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-[11px] flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-colors"
                          title="ইউজার সম্পাদনা ও পাসওয়ার্ড রিসেট"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>সম্পাদনা / পাসওয়ার্ড</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="ইউজার মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {superAdmin && activeTab === 'logs' && (
        <AdminLogViewer />
      )}

      {activeTab === 'library_mgmt' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 sm:p-4 shadow-xs">
          <LibraryAdminDashboard />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            লাইব্রেরি পরিসংখ্যান ও অ্যানালিটিক্স রিপোর্ট
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase">মোট ভৌত বই</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{books.length} টি</h3>
              <p className="text-[11px] text-slate-500">সংগৃহীত কপি: {books.reduce((acc, b) => acc + b.quantity, 0)} টি</p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1">
              <span className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase">ডিজিটাল ই-বুক</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{digitalBooks.length} টি</h3>
              <p className="text-[11px] text-slate-500">অনলাইন রিড/ডাউনলোড ক্যাটালগ</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">মোট সদস্য</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{users.length} জন</h3>
              <p className="text-[11px] text-slate-500">এডমিন ও সাধারণ পাঠক</p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-1">
              <span className="text-xs text-purple-700 dark:text-purple-400 font-bold uppercase">ইস্যু ও নোটিশ</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{borrows.length} / {notices.length}</h3>
              <p className="text-[11px] text-slate-500">বই বিতরণ ও প্রকাশিত নোটিশ</p>
            </div>
          </div>
        </div>
      )}

      {superAdmin && activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>ডাটাবেজ ব্যাকআপ ও রিস্টোর হাব (JSON Database Backup)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>সিস্টেম ডাটা ব্যাকআপ ডাউনলোড (Export)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                আপনার লাইব্রেরির সকল বই, ইউজার, ই-বুক, নোটিশ, ইভেন্ট, ছবি এবং সিস্টেম অডিট লগ এক ক্লিকে JSON ফাইলে ব্যাকআপ নিন।
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ডাউনলোড JSON ব্যাকআপ</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>ডাটাবেজ ফাইল রিস্টোর (Import JSON)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                পূর্বে সেভ করা JSON ব্যাকআপ ফাইল সিলেক্ট করে ডাটাবেজ ও লগ হিস্ট্রি পুনরায় আপডেট করুন।
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>JSON ব্যাকআপ ফাইল আপলোড করুন</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-indigo-600" />
                <span>সব ডাটা ক্লাউডে (Supabase) আপলোড</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ডিভাইসের সব বই, ইউজার, ইভেন্ট, নোটিশ, ছবি ও সাইট কনটেন্ট এক ক্লিকে Supabase ডাটাবেজে
                আপলোড করুন। এরপর সব ডিভাইসে একই ডাটা দেখা যাবে।
              </p>
              <button
                onClick={handlePushToCloud}
                disabled={isPushingCloud}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isPushingCloud ? 'আপলোড হচ্ছে...' : 'Supabase-এ আপলোড করুন'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-rose-600" />
                  <span>পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা নিয়ন্ত্রণ (Security & Password Hub)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  আপনার নিজের অ্যাডমিন অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন অথবা যেকোনো ইউজার/স্টাফের জন্য সরাসরি নতুন পাসওয়ার্ড সেট করুন
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-900">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">১. আপনার নিজস্ব অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h3>
                    <p className="text-[11px] text-slate-500">লগইনরত অ্যাকাউন্ট: <strong>{currentUser?.fullName || 'Super Admin'}</strong> ({currentUser?.email})</p>
                  </div>
                </div>

                <form onSubmit={handleAdminChangeSelfPassword} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      বর্তমান পাসওয়ার্ড (Current Password) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showAdminPassFields ? 'text' : 'password'}
                        required
                        value={currentAdminPass}
                        onChange={(e) => setCurrentAdminPass(e.target.value)}
                        placeholder="আপনার বর্তমান পাসওয়ার্ড দিন"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      নতুন পাসওয়ার্ড (New Password) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showAdminPassFields ? 'text' : 'password'}
                        required
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      পাসওয়ার্ড নিশ্চিতকরণ (Confirm Password) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showAdminPassFields ? 'text' : 'password'}
                        required
                        value={confirmAdminPass}
                        onChange={(e) => setConfirmAdminPass(e.target.value)}
                        placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdminPassFields(!showAdminPassFields)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1 text-[11px]"
                    >
                      {showAdminPassFields ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAdminPassFields ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isUpdatingSelfPass}
                      className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isUpdatingSelfPass ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড সেভ করুন'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {superAdmin && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-900">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">২. যেকোনো ইউজার বা স্টাফের পাসওয়ার্ড পরিবর্তন (Admin Reset)</h3>
                    <p className="text-[11px] text-slate-500">সদস্য বা স্টাফের পাসওয়ার্ড ভুলে গেলে এখান থেকে সরাসরি নতুন পাসওয়ার্ড সেট করুন</p>
                  </div>
                </div>

                <form onSubmit={handleQuickResetUserPassword} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ব্যবহারকারী বা অ্যাডমিন নির্বাচন করুন *
                    </label>
                    <select
                      value={selectedUserForReset}
                      onChange={(e) => setSelectedUserForReset(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">-- ব্যবহারকারী নির্বাচন করুন --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.role}) — {u.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      নতুন পাসওয়ার্ড নির্ধারণ করুন *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={quickNewPassword}
                        onChange={(e) => setQuickNewPassword(e.target.value)}
                        placeholder="যেমন: Library123 অথবা SecretPass@2025"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>অ্যাডমিন হিসেবে পাসওয়ার্ড পরিবর্তনের সাথে সাথে ব্যবহারকারী এই নতুন পাসওয়ার্ড দিয়ে সিস্টেমে প্রবেশ করতে পারবেন।</span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>ব্যবহারকারীর পাসওয়ার্ড আপডেট করুন</span>
                    </button>
                  </div>
                </form>
              </div>
              )}

            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <AdminEditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updatedUser) => {
            setUsers(storage.getUsers());
          }}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                নতুন ইউজার বা এডমিনিস্ট্রেটর যোগ করুন
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="ব্যবহারকারীর নাম"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ইমেইল এড্রেস *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="বাবুগঞ্জ, বরিশাল"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ব্যবহারকারীর রোল</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="LIBRARY_ADMIN">LIBRARY_ADMIN (লাইব্রেরি অ্যাডমিন)</option>
                  <option value="LIBRARIAN">LIBRARIAN (সহকারী লাইব্রেরিয়ান)</option>
                  <option value="MEMBER">MEMBER (সাধারণ সদস্য)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (সুপার অ্যাডমিন)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ডিফল্ট পাসওয়ার্ড</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

    </div>
  );
};

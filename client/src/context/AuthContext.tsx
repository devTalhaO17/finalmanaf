import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage, mockHashPassword } from '../lib/storage';
import { pullMyData } from '../lib/sync';
import { authErrorMessage } from '../lib/authErrors';

interface RegisterData {
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  authMode: 'supabase' | 'local';
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  resendConfirmation: (email: string) => Promise<AuthResponse>;
  logout: () => void;
  resetPassword: (email: string) => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>;
  updateProfile: (updatedData: Partial<User>) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProfileRow = Record<string, any>;

function profileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    fullName: row.full_name || row.fullName || '',
    email: row.email,
    mobile: row.mobile || '',
    address: row.address || '',
    role: row.role || 'MEMBER',
    passwordHash: '',
    memberId: row.member_id || row.memberId || '',
    username: row.username,
    createdAt: row.created_at || row.createdAt || '',
    status: row.status || 'active',
    avatarUrl: row.avatar_url || row.avatarUrl,
    mustChangePassword: row.must_change_password ?? row.mustChangePassword ?? false,
    isEmailVerified: row.is_email_verified ?? row.isEmailVerified ?? false,
    twoFactorEnabled: row.two_factor_enabled ?? row.twoFactorEnabled ?? false,
  };
}

function toProfileRow(u: User): ProfileRow {
  return {
    id: u.id,
    auth_uid: u.id,
    full_name: u.fullName,
    email: u.email.toLowerCase(),
    username: u.username,
    mobile: u.mobile,
    address: u.address,
    role: u.role,
    member_id: u.memberId,
    status: u.status,
    avatar_url: u.avatarUrl,
    must_change_password: u.mustChangePassword ?? false,
    two_factor_enabled: u.twoFactorEnabled ?? false,
  };
}

function persistSessionLocal(user: User | null) {
  if (user) {
    localStorage.setItem('user_data', JSON.stringify(user));
    storage.setCurrentUserSession(user);
  } else {
    localStorage.removeItem('user_data');
    storage.setCurrentUserSession(null);
  }
}

function profileFilter(uid: string, email: string): string {
  const parts = [`auth_uid.eq.${uid}`];
  if (email) parts.push(`email.ilike.${email}`);
  return parts.join(',');
}

function bindAuthUid(profile: ProfileRow | null, uid: string) {
  if (!profile || !uid) return;
  if (profile.auth_uid === uid) return;
  supabase
    ?.from('users')
    .update({ auth_uid: uid })
    .eq('id', profile.id)
    .then(
      () => {},
      () => {}
    );
}

async function localLogin(email: string, password: string): Promise<AuthResponse> {
  const users = storage.getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { success: false, message: 'ইনভ্যালিড ইমেইল বা পাসওয়ার্ড' };
  if (user.status === 'suspended') {
    return { success: false, message: 'এই অ্যাকাউন্টটি স্থগিত করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।' };
  }
  if (mockHashPassword(password) !== user.passwordHash) {
    return { success: false, message: 'ইনভ্যালিড ইমেইল বা পাসওয়ার্ড' };
  }
  persistSessionLocal(user);
  return { success: true, message: 'সফলভাবে লগইন হয়েছে!', user };
}

async function localRegister(data: RegisterData): Promise<AuthResponse> {
  const users = storage.getUsers();
  const email = data.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { success: false, message: 'এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে' };
  }
  const newUser: User = {
    id: `usr_${Date.now()}`,
    fullName: data.fullName.trim(),
    email,
    username: email.split('@')[0],
    mobile: data.mobile.trim(),
    address: data.address.trim() || 'বাবুগঞ্জ, বরিশাল',
    role: 'MEMBER',
    passwordHash: mockHashPassword(data.password),
    memberId: `SAJKS-MB-${2000 + users.length + 1}`,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active',
    isEmailVerified: true,
  };
  storage.addUser(newUser);
  persistSessionLocal(newUser);
  return { success: true, message: 'রেজিস্ট্রেশন সফল হয়েছে!', user: newUser };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const authMode: 'supabase' | 'local' = isSupabaseConfigured ? 'supabase' : 'local';

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        persistSessionLocal(null);
        return;
      }
      const uid = session.user.id;
      const email = session.user.email?.toLowerCase() || '';
      const { data } = await supabase
        .from('users')
        .select('*')
        .or(profileFilter(uid, email))
        .maybeSingle();
      let profile: ProfileRow;
      if (data) {
        profile = data;
        bindAuthUid(profile, uid);
      } else {
        const fallback = profileToUser({
          id: uid,
          full_name: session.user.user_metadata?.fullName || email.split('@')[0],
          email,
          role: 'MEMBER',
          status: 'active',
          member_id: '',
          created_at: new Date().toISOString(),
        });
        const { error: insErr } = await supabase.from('users').insert(toProfileRow(fallback));
        if (insErr && insErr.code !== '23505') {
          console.error('Profile insert failed', insErr.message);
        }
        profile = fallback as ProfileRow;
      }
      const u = profileToUser(profile);
      setUser(u);
      persistSessionLocal(u);
      pullMyData();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const uid = data.session.user.id;
        const email = data.session.user.email?.toLowerCase() || '';
        supabase
          .from('users')
          .select('*')
          .or(profileFilter(uid, email))
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile) {
              bindAuthUid(profile, uid);
              const u = profileToUser(profile);
              setUser(u);
              persistSessionLocal(u);
              pullMyData();
            }
          });
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    if (authMode === 'local') {
      const result = await localLogin(email, password);
      setUser(result.user || user);
      return result;
    }
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        const message = authErrorMessage(error) || 'ইনভ্যালিড ইমেইল বা পাসওয়ার্ড';
        return { success: false, message };
      }
      const uid = data.user.id;
      const userEmail = data.user.email?.toLowerCase() || '';
      const { data: profile } = await supabase!
        .from('users')
        .select('*')
        .or(profileFilter(uid, userEmail))
        .maybeSingle();
      let u: User;
      if (profile) {
        bindAuthUid(profile, uid);
        u = profileToUser(profile);
      } else {
        u = profileToUser({
          id: uid,
          full_name: data.user.user_metadata?.fullName || userEmail.split('@')[0],
          email: userEmail,
          role: 'MEMBER',
          status: 'active',
          member_id: '',
          created_at: new Date().toISOString(),
        });
        const { error: insErr } = await supabase!.from('users').insert(toProfileRow(u));
        if (insErr && insErr.code !== '23505') {
          return { success: false, message: `প্রোফাইল তৈরি ব্যর্থ হয়েছে: ${insErr.message}` };
        }
      }
      setUser(u);
      persistSessionLocal(u);
      pullMyData();
      return { success: true, message: 'সফলভাবে লগইন হয়েছে!', user: u };
    } catch (err: any) {
      return { success: false, message: authErrorMessage(err) };
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    if (authMode === 'local') {
      const result = await localRegister(data);
      setUser(result.user || user);
      return result;
    }
    try {
      const { data: signup, error } = await supabase!.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { fullName: data.fullName, mobile: data.mobile, address: data.address } },
      });
      if (error) return { success: false, message: authErrorMessage(error) };
      if (!signup.user) return { success: false, message: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' };

      if (!signup.session && Array.isArray(signup.user.identities) && signup.user.identities.length === 0) {
        return {
          success: false,
          message: 'এই ইমেইলে আগেই একটি অ্যাকাউন্ট তৈরি হয়েছে। সরাসরি লগইন করুন।',
        };
      }

      const newUser: User = {
        id: signup.user.id,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        username: data.email.split('@')[0],
        mobile: data.mobile.trim(),
        address: data.address.trim() || 'বাবুগঞ্জ, বরিশাল',
        role: 'MEMBER',
        passwordHash: '',
        memberId: `SAJKS-MB-${1000 + Math.floor(Math.random() * 9000)}`,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      };

      if (signup.session?.user) {
        await supabase!.from('users').upsert(toProfileRow(newUser), { onConflict: 'id' });
        setUser(newUser);
        persistSessionLocal(newUser);
        return { success: true, message: 'রেজিস্ট্রেশন সফল হয়েছে!', user: newUser };
      }
      await supabase!.from('users').upsert(toProfileRow(newUser), { onConflict: 'id' });
      return { success: true, message: 'রেজিস্ট্রেশন সফল! ইমেইলে পাঠানো কনফার্মেশন লিংকে ক্লিক করুন, তারপর লগইন করলে আপনার অ্যাকাউন্ট সক্রিয় হবে।' };
    } catch (err: any) {
      return { success: false, message: authErrorMessage(err) };
    }
  };

  const logout = () => {
    if (authMode === 'supabase' && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    persistSessionLocal(null);
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    if (authMode === 'supabase' && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, message: authErrorMessage(error) };
      return { success: true, message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' };
    }
    return { success: false, message: 'ডেমো মোডে পাসওয়ার্ড রিসেট নেই। অ্যাডমিনকে জিজ্ঞাসা করুন।' };
  };

  const resendConfirmation = async (email: string): Promise<AuthResponse> => {
    if (authMode === 'supabase' && supabase) {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) return { success: false, message: authErrorMessage(error) };
      return { success: true, message: 'কনফার্মেশন ইমেইল পুনরায় পাঠানো হয়েছে। ইনবক্স চেক করুন।' };
    }
    return { success: false, message: 'কনফার্মেশন ইমেইল পাঠানো যাচ্ছে না।' };
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    if (authMode === 'supabase' && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, message: authErrorMessage(error) };
      return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' };
    }
    if (!user) return { success: false, message: 'লগইন করা নেই' };
    if (mockHashPassword(currentPassword) !== user.passwordHash) {
      return { success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়' };
    }
    const updated = { ...user, passwordHash: mockHashPassword(newPassword) };
    storage.updateUser(updated);
    setUser(updated);
    persistSessionLocal(updated);
    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' };
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<AuthResponse> => {
    if (!user) return { success: false, message: 'লগইন করা নেই' };
    const updated = { ...user, ...updatedData };
    if (authMode === 'supabase' && supabase) {
      const { error } = await supabase.from('users').update(toProfileRow(updated)).eq('id', user.id);
      if (error) return { success: false, message: error.message };
    } else {
      storage.updateUser(updated);
    }
    setUser(updated);
    persistSessionLocal(updated);
    return { success: true, message: 'প্রোফাইল আপডেট হয়েছে!' };
  };

  return (
    <AuthContext.Provider
      value={{ user, authMode, login, register, resendConfirmation, logout, resetPassword, changePassword, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
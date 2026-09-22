import React, { useState, useRef, useEffect } from 'react';
import { ViewName, UserRole, isAdminRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Moon, 
  Sun, 
  Globe, 
  User as UserIcon, 
  LogOut, 
  LogIn,
  Menu, 
  X, 
  LayoutDashboard,
  Sparkles,
  ChevronDown,
  Info,
  History as HistoryIcon,
  Award,
  HeartHandshake,
  Library,
  BookMarked,
  Bell,
  Calendar,
  Image as ImageIcon,
  HelpCircle,
  Phone,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [libraryDropdownOpen, setLibraryDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const aboutRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (aboutRef.current && !aboutRef.current.contains(target)) {
        setAboutDropdownOpen(false);
      }
      if (libraryRef.current && !libraryRef.current.contains(target)) {
        setLibraryDropdownOpen(false);
      }
      if (activityRef.current && !activityRef.current.contains(target)) {
        setActivityDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (view: ViewName) => {
    if (typeof onNavigate === 'function') {
      onNavigate(view);
    }
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setLibraryDropdownOpen(false);
    setActivityDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const getUserDashboardView = (role?: UserRole): ViewName => {
    if (!role) return 'dashboard';
    if (isAdminRole(role)) return 'admin';
    return 'member';
  };

  const isAboutActive = ['about', 'history', 'founder', 'donors'].includes(currentView);
  const isLibraryActive = ['books', 'digital-library'].includes(currentView);
  const isActivityActive = ['notices', 'events', 'gallery', 'faq'].includes(currentView);

  const isBn = language === 'bn';

  return (
    <div className="relative sticky top-0 z-50 w-full px-3 sm:px-6 pt-2.5 sm:pt-3 pb-2 transition-colors">
      <header className="max-w-7xl mx-auto bg-white/90 dark:bg-[#20181A]/90 backdrop-blur-xl rounded-2xl sm:rounded-[24px] px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-[0_10px_35px_rgba(45,36,36,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] border border-black/5 dark:border-white/10 transition-colors">
        
        <button 
          onClick={() => handleNavClick('home')} 
          className="flex items-center gap-2.5 sm:gap-3.5 text-left group focus:outline-hidden shrink-0"
        >
          <div 
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#E85D75] to-[#c9455c] flex items-center justify-center text-white shadow-md shadow-rose-500/20 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-2 shrink-0"
          >
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="font-serif text-sm sm:text-base lg:text-lg font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors leading-tight line-clamp-1">
              {isBn ? 'স্পিকার আব্দুল জব্বার খান মেমোরিয়াল লাইব্রেরি' : 'Speaker Abdul Jabbar Khan Memorial Library'}
            </h1>
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'স্থাপিত: ২০০১ • ভূতেরদিয়া, বাবুগঞ্জ, বরিশাল' : 'Est. 2001 • Bhuterdia, Babuganj, Barishal'}
            </div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-[#E85D75] text-white shadow-xs'
                : 'text-[var(--ink)] opacity-80 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? 'হোম' : 'Home'}
          </button>

          <div className="relative" ref={aboutRef}>
            <button
              onClick={() => {
                setAboutDropdownOpen(!aboutDropdownOpen);
                setLibraryDropdownOpen(false);
                setActivityDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold flex items-center gap-1 transition-all ${
                isAboutActive
                  ? 'bg-[#E85D75] text-white shadow-xs'
                  : 'text-[var(--ink)] opacity-80 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{isBn ? 'পরিচিতি' : 'About'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {aboutDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#261E20] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleNavClick('about')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'about' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Info className="w-4 h-4 text-[#E85D75]" />
                  <div>
                    <p className="font-bold">{isBn ? 'আমাদের সম্পর্কে' : 'About Library'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'লক্ষ্য, উদ্দেশ্য ও সুবিধাসমূহ' : 'Mission, vision & facilities'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('history')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'history' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <HistoryIcon className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'ইতিহাস ও ঐতিহ্য' : 'History & Heritage'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'প্রতিষ্ঠার ক্রমবিকাশ ও মাইলফলক' : 'Foundation & milestones'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('founder')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'founder' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Award className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'প্রতিষ্ঠাতা পরিচিতি' : 'About Founder'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'স্পিকার আব্দুল জব্বার খান' : 'Speaker Abdul Jabbar Khan'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('donors')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'donors' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'দাতা ও পৃষ্ঠপোষক' : 'Donors & Patrons'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'সম্মানিত আজীবন ও দাতা সদস্য' : 'Life members & sponsors'}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={libraryRef}>
            <button
              onClick={() => {
                setLibraryDropdownOpen(!libraryDropdownOpen);
                setAboutDropdownOpen(false);
                setActivityDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold flex items-center gap-1 transition-all ${
                isLibraryActive
                  ? 'bg-[#E85D75] text-white shadow-xs'
                  : 'text-[var(--ink)] opacity-80 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{isBn ? 'বই ও সংগ্রহ' : 'Library'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${libraryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {libraryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#261E20] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleNavClick('books')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'books' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Library className="w-4 h-4 text-[#E85D75]" />
                  <div>
                    <p className="font-bold">{isBn ? 'বইয়ের ক্যাটালগ' : 'Book Catalog'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'সকল ফিজিক্যাল বই অনুসন্ধান' : 'Browse physical library'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('digital-library')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'digital-library' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <BookMarked className="w-4 h-4 text-sky-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'ডিজিটাল ই-লাইব্রেরি' : 'Digital E-Library'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'অনলাইন রিডার ও পিডিএফ' : 'Read & download PDFs'}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={activityRef}>
            <button
              onClick={() => {
                setActivityDropdownOpen(!activityDropdownOpen);
                setAboutDropdownOpen(false);
                setLibraryDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold flex items-center gap-1 transition-all ${
                isActivityActive
                  ? 'bg-[#E85D75] text-white shadow-xs'
                  : 'text-[var(--ink)] opacity-80 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{isBn ? 'কার্যক্রম' : 'Activities'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {activityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#261E20] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleNavClick('notices')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'notices' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Bell className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'নোটিশ বোর্ড' : 'Notice Board'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'জরুরি বিজ্ঞপ্তি ও ঘোষণা' : 'Announcements & circulars'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('events')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'events' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'লাইব্রেরি ইভেন্ট' : 'Events & Programs'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'আসন্ন প্রতিযোগিতা ও কর্মশালা' : 'Upcoming workshops'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('gallery')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'gallery' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'ফটোগ্যালারি' : 'Photo Gallery'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'স্মরণীয় মুহূর্ত ও আলোকচিত্র' : 'Library photo collection'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('faq')}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'faq' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="font-bold">{isBn ? 'সাধারণ প্রশ্নোত্তর' : 'FAQ'}</p>
                    <p className="text-[10px] text-slate-400">{isBn ? 'নিয়মাবলি ও সাধারণ প্রশ্ন' : 'Questions & Help'}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('contact')}
            className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all ${
              currentView === 'contact'
                ? 'bg-[#E85D75] text-white shadow-xs'
                : 'text-[var(--ink)] opacity-80 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? 'যোগাযোগ' : 'Contact'}
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700/80 text-[var(--ink)] hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all shrink-0"
            title="ভাষা পরিবর্তন / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 opacity-70" />
            <span>{language === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-full border border-slate-200 dark:border-slate-700/80 text-[var(--ink)] hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all shrink-0"
            title={theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F4D35E]" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setAboutDropdownOpen(false);
                  setLibraryDropdownOpen(false);
                  setActivityDropdownOpen(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all border border-slate-200 dark:border-slate-700"
              >
                <div className="w-6 h-6 rounded-full bg-[#E85D75] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[var(--ink)] leading-tight line-clamp-1 max-w-[90px]">
                    {user.fullName?.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">
                    {isAdminRole(user.role) ? 'ADMIN' : 'MEMBER'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#261E20] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-[var(--ink)] truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email || user.mobile}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                      {isAdminRole(user.role) ? '🛡️ অ্যাডমিনিস্ট্রেটর' : '👤 লাইব্রেরি সদস্য'}
                    </span>
                  </div>

                  {isAdminRole(user.role) && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                        currentView === 'admin' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#E85D75]" />
                      <span>{isBn ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavClick(user.role === 'MEMBER' ? 'member' : 'dashboard')}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                      currentView === 'member' || currentView === 'dashboard' ? 'text-[#E85D75] bg-rose-50 dark:bg-rose-950/30' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                    <span>{isBn ? 'সদস্য প্যানেল' : 'Member Portal'}</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isBn ? 'লগআউট' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => handleNavClick('login')}
              className="btn-ink px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              title="লগইন / প্রবেশ করুন"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগইন' : 'Login'}</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[#2D2424] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="মেনু খুলুন"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-white/95 dark:bg-[#20181A]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
              {isBn ? 'প্রধান সেকশন' : 'Main Sections'}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleNavClick('home')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'home' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isBn ? 'হোম' : 'Home'}</span>
              </button>
              <button
                onClick={() => handleNavClick('books')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'books' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>{isBn ? 'বইয়ের তালিকা' : 'Books'}</span>
              </button>
              <button
                onClick={() => handleNavClick('digital-library')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'digital-library' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>{isBn ? 'ডিজিটাল ই-বুক' : 'E-Library'}</span>
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'contact' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isBn ? 'যোগাযোগ' : 'Contact'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
              {isBn ? 'পরিচিতি ও ইতিহাস' : 'About & History'}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleNavClick('about')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'about' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>{isBn ? 'আমাদের কথা' : 'About Us'}</span>
              </button>
              <button
                onClick={() => handleNavClick('history')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'history' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইতিহাস' : 'History'}</span>
              </button>
              <button
                onClick={() => handleNavClick('founder')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'founder' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isBn ? 'প্রতিষ্ঠাতা' : 'Founder'}</span>
              </button>
              <button
                onClick={() => handleNavClick('donors')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'donors' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>{isBn ? 'দাতা সদস্য' : 'Donors'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
              {isBn ? 'কার্যক্রম ও সহায়তা' : 'Activities & Help'}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleNavClick('notices')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'notices' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isBn ? 'নোটিশ' : 'Notices'}</span>
              </button>
              <button
                onClick={() => handleNavClick('events')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'events' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইভেন্ট' : 'Events'}</span>
              </button>
              <button
                onClick={() => handleNavClick('gallery')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'gallery' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isBn ? 'গ্যালারি' : 'Gallery'}</span>
              </button>
              <button
                onClick={() => handleNavClick('faq')}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                  currentView === 'faq' ? 'bg-[#E85D75] text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isBn ? 'প্রশ্নোত্তর' : 'FAQ'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#E85D75] text-white flex items-center justify-center text-xs font-bold">
                      {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--ink)]">{user.fullName}</p>
                      <p className="text-[10px] text-slate-500">{isAdminRole(user.role) ? 'অ্যাডমিন' : 'সদস্য'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লগআউট' : 'Logout'}</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  {isAdminRole(user.role) && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="btn-ink flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isBn ? 'এডমিন প্যানেল' : 'Admin'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick(user.role === 'MEMBER' ? 'member' : 'dashboard')}
                    className="btn flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="btn-ink w-full py-2.5 text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>{isBn ? 'লগইন / নিবন্ধন' : 'Login / Register'}</span>
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

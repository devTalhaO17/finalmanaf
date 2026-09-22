import React from 'react';
import { ViewName } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Mail, Phone, Clock, BookOpen, Heart, Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewName) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-[#2D2424] dark:bg-[#151011] text-white/80 border-t border-black/10 dark:border-white/5 transition-colors mt-12">
      <div className="top-hairline opacity-80" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                style={{ background: 'var(--accent)', borderRadius: '10px' }}
                className="w-10 h-10 flex items-center justify-center shrink-0 shadow-xs"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-serif text-white leading-tight">
                  {language === 'bn' ? 'Speaker Abdul Jabbar Khan Memorial Library' : 'Speaker A. Jabbar Khan Smriti Library'}
                </h3>
                <p className="text-[11px] text-[#F4D35E] font-medium mt-0.5">ESTD. 2001 • BABUGANJ</p>
              </div>
            </div>
            <p className="text-xs text-white/85 bg-black/20 p-3.5 rounded-2xl border border-white/10 font-serif italic">
              "{language === 'bn' ? 'জ্ঞানই শক্তি — বই হোক সকলের বন্ধু' : 'Knowledge is Power — Let Books be Everyone\'s Friend'}"
            </p>
            <div className="text-xs text-white/70 space-y-1">
              <p><strong className="text-white">প্রতিষ্ঠাতা:</strong> জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধা</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#F4D35E] uppercase tracking-wider mb-4">
              {language === 'bn' ? 'নেভিগেশন ও তালিকা' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'লাইব্রেরির ইতিহাস' : 'History'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('founder')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'প্রতিষ্ঠাতা জীবনী' : 'Founder Biography'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('donors')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'দাতা সদস্যবৃন্দ' : 'Donor Members'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('books')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'বইয়ের তালিকা ও ক্যাটালগ' : 'Books Catalog'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('digital-library')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'ডিজিটাল ই-বুক সংগ্রহ' : 'Digital E-Library'}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#F4D35E] uppercase tracking-wider mb-4">
              {language === 'bn' ? 'তথ্য ও সেবা' : 'Info & Help'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('notices')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'অফিসিয়াল নোটিশ বোর্ড' : 'Notice Board'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'ইভেন্ট ও সময়সূচী' : 'Events Calendar'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'ফটোগ্যালারি' : 'Photo Gallery'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'সাধারণ জিজ্ঞাসাবলী (FAQ)' : 'Frequently Asked Questions'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#E85D75] transition-colors">
                  {language === 'bn' ? 'যোগাযোগ ও মতামত' : 'Contact & Feedback'}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F4D35E] uppercase tracking-wider mb-4">
              {language === 'bn' ? 'ঠিকানা ও যোগাযোগ' : 'Contact Details'}
            </h4>
            
            <div className="flex items-start gap-2.5 text-xs text-white/80">
              <MapPin className="w-4 h-4 text-[#E85D75] shrink-0 mt-0.5" />
              <span>গ্রাম ও ডাকঘর: ভূতেরদিয়া, উপজেলা: বাবুগঞ্জ, জেলা: বরিশাল</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <Mail className="w-4 h-4 text-[#E85D75] shrink-0" />
              <a href="mailto:sajkspla@gmail.com" className="hover:underline text-white">
                sajkspla@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <Phone className="w-4 h-4 text-[#E85D75] shrink-0" />
              <span>+৮৮০ ১৭১১-০০০০০১</span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-white/85 bg-black/20 p-3 rounded-2xl border border-white/10">
              <Clock className="w-4 h-4 text-[#F4D35E] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">খোলা থাকার সময়সূচী:</p>
                <p>শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - রাত ৮:০০</p>
                <p className="text-[#F4D35E]">শুক্রবার: সাপ্তাহিক ছুটি</p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70 text-center sm:text-left">
          <div>
            © ২০০১ - ২০২৬ Speaker Abdul Jabbar Khan Memorial Public Library। গ্রাম: ভূতেরদিয়া, বাবুগঞ্জ, বরিশাল।
          </div>
          <div className="text-[11px] text-white/50">
            Digital Library Management System
          </div>
        </div>
      </div>
    </footer>
  );
};

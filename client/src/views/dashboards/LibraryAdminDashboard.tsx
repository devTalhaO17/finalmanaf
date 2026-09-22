import React, { useState } from 'react';
import { 
  Book, 
  BookCategory, 
  DigitalBook, 
  Notice, 
  LibraryEvent, 
  GalleryItem, 
  DonorMember, 
  SiteInfo, 
  MilestoneItem,
  User,
  BorrowRecord
} from '../../types';
import { storage, mockHashPassword, logActivity } from '../../lib/storage';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { ImageInputPicker } from '../../components/common/ImageInputPicker';
import { ChangePasswordModal } from '../../components/common/ChangePasswordModal';
import { CentralMediaManager } from '../../components/admin/CentralMediaManager';
import { SafeImage } from '../../components/common/SafeImage';
import { AdminLogViewer } from '../../components/admin/AdminLogViewer';
import { AdminEditUserModal } from '../../components/admin/AdminEditUserModal';
import { canManageUsers } from '../../lib/roles';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  Image as ImageIcon, 
  X, 
  Save, 
  Users, 
  Award, 
  Clock, 
  Building, 
  Info, 
  Link as LinkIcon, 
  CheckCircle2, 
  KeyRound, 
  Database, 
  UserPlus, 
  RotateCcw, 
  Download, 
  Upload, 
  BarChart3, 
  Shield, 
  BookMarked,
  UserCheck,
  Activity,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export const LibraryAdminDashboard: React.FC = () => {
  const { user: currentUser, changePassword } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'books' | 'digital' | 'circulation' | 'users' | 'logs' | 'founder_site' | 'donors' | 'notices' | 'events' | 'gallery' | 'history' | 'media' | 'reports' | 'backup' | 'password'>('books');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [showAdminPassFields, setShowAdminPassFields] = useState(false);
  const [isUpdatingSelfPass, setIsUpdatingSelfPass] = useState(false);

  const [selectedUserForReset, setSelectedUserForReset] = useState<string>('');
  const [quickNewPassword, setQuickNewPassword] = useState('Library123');

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

    const currentUsers = storage.getUsers();
    const targetUser = currentUsers.find(u => u.id === selectedUserForReset);
    if (!targetUser) {
      showToast('ব্যবহারকারী পাওয়া যায়নি', 'error');
      return;
    }

    const updatedUsers = currentUsers.map(u => {
      if (u.id === selectedUserForReset) {
        return {
          ...u,
          passwordHash: mockHashPassword(quickNewPassword),
          mustChangePassword: false
        };
      }
      return u;
    });

    storage.saveUsers(updatedUsers);
    setUsersList(updatedUsers);

    logActivity(
      'USER_PASSWORD_CHANGED_BY_ADMIN',
      'SECURITY',
      'WARNING',
      `লাইব্রেরি অ্যাডমিন কর্তৃক ${targetUser.fullName} (${targetUser.email}) এর পাসওয়ার্ড পরিবর্তন করা হয়েছে।`,
      undefined,
      undefined,
      { targetUserId: targetUser.id, targetEmail: targetUser.email }
    );

    showToast(`${targetUser.fullName}-এর পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে! নতুন পাসওয়ার্ড: ${quickNewPassword}`, 'success');
  };

  const [books, setBooks] = useState<Book[]>(() => storage.getBooks());
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [category, setCategory] = useState<BookCategory>('Novel');
  const [publicationYear, setPublicationYear] = useState<number>(2024);
  const [edition, setEdition] = useState('১ম সংস্করণ');
  const [language, setLanguage] = useState<'Bangla' | 'English' | 'Both'>('Bangla');
  const [coverUrl, setCoverUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(5);
  const [shelfNumber, setShelfNumber] = useState('A-101');
  const [isbn, setIsbn] = useState('978-984-000-000-0');
  const [description, setDescription] = useState('');

  const resetBookForm = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setPublisher('');
    setCategory('Novel');
    setPublicationYear(2024);
    setEdition('১ম সংস্করণ');
    setLanguage('Bangla');
    setCoverUrl('');
    setQuantity(5);
    setShelfNumber('A-101');
    setIsbn('978-984-000-000-0');
    setDescription('');
  };

  const handleOpenEditBook = (b: Book) => {
    setEditingBook(b);
    setTitle(b.title);
    setAuthor(b.author);
    setPublisher(b.publisher);
    setCategory(b.category);
    setPublicationYear(b.publicationYear);
    setEdition(b.edition);
    setLanguage(b.language);
    setCoverUrl(b.coverUrl);
    setQuantity(b.quantity);
    setShelfNumber(b.shelfNumber);
    setIsbn(b.isbn);
    setDescription(b.description || '');
    setShowBookModal(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !publisher) {
      showToast('বইয়ের নাম, লেখক ও প্রকাশক তথ্য প্রদান করা আবশ্যক', 'error');
      return;
    }

    const defaultCover = coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';
    const barcodeCode = editingBook ? editingBook.barcode : `SAJKS-${shelfNumber}-${Date.now().toString().slice(-4)}`;

    if (editingBook) {
      const updated: Book = {
        ...editingBook,
        title,
        author,
        publisher,
        category,
        publicationYear,
        edition,
        language,
        coverUrl: defaultCover,
        quantity,
        availableCopies: Math.min(quantity, editingBook.availableCopies),
        shelfNumber,
        isbn,
        description
      };
      storage.updateBook(updated);
      logActivity(
        'BOOK_UPDATED',
        'CONTENT_MANAGEMENT',
        'INFO',
        `বই তথ্য আপডেট: "${title}" (লেখক: ${author}, ক্যাটাগরি: ${category})`,
        undefined,
        undefined,
        { bookId: editingBook.id, title, category }
      );
      showToast('বইয়ের তথ্য সফলভাবে আপডেট করা হয়েছে', 'success');
    } else {
      const newBook: Book = {
        id: `bk_${Date.now()}`,
        title,
        author,
        publisher,
        category,
        publicationYear,
        edition,
        language,
        coverUrl: defaultCover,
        quantity,
        availableCopies: quantity,
        shelfNumber,
        isbn,
        barcode: barcodeCode,
        description,
        featured: false
      };
      storage.addBook(newBook);
      logActivity(
        'BOOK_ADDED',
        'CONTENT_MANAGEMENT',
        'SUCCESS',
        `নতুন বই যুক্ত করা হয়েছে: "${title}" (লেখক: ${author}, ক্যাটাগরি: ${category}, কপি: ${quantity} টি)`,
        undefined,
        undefined,
        { bookId: newBook.id, title, author, category }
      );
      showToast('নতুন বই সফলভাবে যুক্ত করা হয়েছে', 'success');
    }

    setBooks(storage.getBooks());
    setShowBookModal(false);
    resetBookForm();
  };

  const handleDeleteBook = (id: string) => {
    const target = books.find(b => b.id === id);
    if (window.confirm('আপনি কি নিশ্চিত যে এই বইটি মুছে ফেলতে চান?')) {
      storage.deleteBook(id);
      setBooks(storage.getBooks());
      logActivity(
        'BOOK_DELETED',
        'CONTENT_MANAGEMENT',
        'WARNING',
        `বই মুছে ফেলা হয়েছে: "${target?.title || id}" (লেখক: ${target?.author || 'অজানা'})`,
        undefined,
        undefined,
        { bookId: id, title: target?.title }
      );
      showToast('বই মুছে ফেলা হয়েছে', 'info');
    }
  };

  const [digitalBooks, setDigitalBooks] = useState<DigitalBook[]>(() => storage.getDigitalBooks());
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [editingDigitalBook, setEditingDigitalBook] = useState<DigitalBook | null>(null);

  const [dTitle, setDTitle] = useState('');
  const [dAuthor, setDAuthor] = useState('');
  const [dCategory, setDCategory] = useState<BookCategory>('Novel');
  const [dCover, setDCover] = useState('');
  const [dFileUrl, setDFileUrl] = useState('');
  const [dFormat, setDFormat] = useState<'PDF' | 'EPUB'>('PDF');
  const [dPageCount, setDPageCount] = useState(150);
  const [dSize, setDSize] = useState('৪.৫ মেগাবাইট');
  const [dDescription, setDDescription] = useState('');
  const [dSampleContent, setDSampleContent] = useState('');

  const resetDigitalForm = () => {
    setEditingDigitalBook(null);
    setDTitle('');
    setDAuthor('');
    setDCategory('Novel');
    setDCover('');
    setDFileUrl('');
    setDFormat('PDF');
    setDPageCount(150);
    setDSize('৪.৫ মেগাবাইট');
    setDDescription('');
    setDSampleContent('');
  };

  const handleOpenEditDigital = (db: DigitalBook) => {
    setEditingDigitalBook(db);
    setDTitle(db.title);
    setDAuthor(db.author);
    setDCategory(db.category);
    setDCover(db.coverUrl);
    setDFileUrl(db.fileUrl || db.pdfUrl || '');
    setDFormat(db.fileFormat || 'PDF');
    setDPageCount(db.pageCount);
    setDSize(db.fileSize);
    setDDescription(db.description || '');
    setDSampleContent(db.sampleContentText || '');
    setShowDigitalModal(true);
  };

  const handleSaveDigital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dTitle.trim() || !dAuthor.trim()) {
      showToast('ই-বুকের শিরোনাম ও লেখক প্রদান করুন', 'error');
      return;
    }

    const cover = dCover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
    const link = dFileUrl ? dFileUrl.trim() : '';
    const desc = dDescription.trim() || `${dTitle} — Speaker Abdul Jabbar Khan Memorial Library ডিজিটাল ক্যাটালগ সংগ্রহ।`;

    if (editingDigitalBook) {
      const updated: DigitalBook = {
        ...editingDigitalBook,
        title: dTitle.trim(),
        author: dAuthor.trim(),
        category: dCategory,
        coverUrl: cover,
        fileUrl: link,
        pdfUrl: link,
        fileFormat: dFormat,
        pageCount: Number(dPageCount) || 1,
        fileSize: link ? dSize : 'ক্যাটালগ সংরক্ষিত',
        description: desc,
        sampleContentText: dSampleContent.trim() || editingDigitalBook.sampleContentText
      };
      storage.updateDigitalBook(updated);
      logActivity(
        'DIGITAL_BOOK_UPDATED',
        'CONTENT_MANAGEMENT',
        'INFO',
        `ই-বুক তথ্য আপডেট: "${dTitle}" (লেখক: ${dAuthor})`,
        undefined,
        undefined,
        { digitalBookId: editingDigitalBook.id, title: dTitle }
      );
      showToast(link ? 'ই-বুক ও পিডিএফ লিংক আপডেট করা হয়েছে' : 'ই-বুক ক্যাটালগ সফলভাবে আপডেট করা হয়েছে', 'success');
    } else {
      const newDB: DigitalBook = {
        id: `dig_${Date.now()}`,
        title: dTitle.trim(),
        author: dAuthor.trim(),
        category: dCategory,
        coverUrl: cover,
        fileUrl: link,
        pdfUrl: link,
        fileFormat: dFormat,
        fileSize: link ? dSize : 'ক্যাটালগ সংরক্ষিত',
        pageCount: Number(dPageCount) || 1,
        description: desc,
        downloadCount: 0,
        readCount: 0,
        viewsCount: 0,
        downloadsCount: 0,
        addedDate: new Date().toISOString().split('T')[0],
        sampleContentText: dSampleContent.trim()
      };
      storage.addDigitalBook(newDB);
      logActivity(
        'DIGITAL_BOOK_ADDED',
        'CONTENT_MANAGEMENT',
        'SUCCESS',
        `নতুন ই-বুক সংরক্ষণ: "${dTitle}" (লেখক: ${dAuthor}, PDF লিংক: ${link ? 'সংযুক্ত' : 'ছাড়া'})`,
        undefined,
        undefined,
        { digitalBookId: newDB.id, title: dTitle }
      );
      showToast(link ? 'নতুন ডিজিটাল বই ও পিডিএফ লিংক যুক্ত করা হয়েছে' : 'পিডিএফ লিংক ছাড়াই ডিজিটাল বইটি সফলভাবে লাইব্রেরিতে সংরক্ষণ করা হয়েছে', 'success');
    }

    setDigitalBooks(storage.getDigitalBooks());
    setShowDigitalModal(false);
    resetDigitalForm();
  };

  const handleDeleteDigital = (id: string) => {
    const target = digitalBooks.find(db => db.id === id);
    if (window.confirm('আপনি কি নিশ্চিত যে এই ই-বুকটি মুছে ফেলতে চান?')) {
      storage.deleteDigitalBook(id);
      setDigitalBooks(storage.getDigitalBooks());
      logActivity(
        'DIGITAL_BOOK_DELETED',
        'CONTENT_MANAGEMENT',
        'WARNING',
        `ই-বুক মুছে ফেলা হয়েছে: "${target?.title || id}"`,
        undefined,
        undefined,
        { digitalBookId: id, title: target?.title }
      );
      showToast('ই-বুক মুছে ফেলা হয়েছে', 'info');
    }
  };

  const [siteInfo, setSiteInfo] = useState<SiteInfo>(() => storage.getSiteInfo());
  const [founderForm, setFounderForm] = useState(siteInfo.founder);
  const [siteAddress, setSiteAddress] = useState(siteInfo.address);
  const [siteEmail, setSiteEmail] = useState(siteInfo.email);
  const [sitePhone, setSitePhone] = useState(siteInfo.phone);
  const [siteHours, setSiteHours] = useState(siteInfo.hours);

  const [heroTitle, setHeroTitle] = useState(siteInfo.heroTitle || '');
  const [heroSubTitle, setHeroSubTitle] = useState(siteInfo.heroSubTitle || '');
  const [heroBannerImage, setHeroBannerImage] = useState(siteInfo.heroBannerImage || '');
  const [libraryExteriorImage, setLibraryExteriorImage] = useState(siteInfo.libraryExteriorImage || '');
  const [mottoText, setMottoText] = useState(siteInfo.mottoText || '');

  const [aboutHeaderImage, setAboutHeaderImage] = useState(siteInfo.aboutHeaderImage || '');
  const [aboutIntro, setAboutIntro] = useState(siteInfo.aboutIntro || '');
  const [mission, setMission] = useState(siteInfo.mission || '');
  const [vision, setVision] = useState(siteInfo.vision || '');

  const handleSaveSiteInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteInfo = {
      ...siteInfo,
      address: siteAddress,
      email: siteEmail,
      phone: sitePhone,
      hours: siteHours,
      heroTitle,
      heroSubTitle,
      heroBannerImage,
      libraryExteriorImage,
      mottoText,
      aboutHeaderImage,
      aboutIntro,
      mission,
      vision,
      founder: founderForm
    };
    storage.saveSiteInfo(updated);
    setSiteInfo(updated);
    showToast('ফ্রন্ট পেজ, অভ্যন্তরীণ পেজ ও সাইটের সকল তথ্য এবং ছবি সফলভাবে আপডেট করা হয়েছে', 'success');
  };

  const [donors, setDonors] = useState<DonorMember[]>(() => storage.getDonors());
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonorMember | null>(null);

  const [donorName, setDonorName] = useState('');
  const [donorDesig, setDonorDesig] = useState('');
  const [donorCat, setDonorCat] = useState<DonorMember['donorCategory']>('Donor Member');
  const [donorContrib, setDonorContrib] = useState('');
  const [donorPhoto, setDonorPhoto] = useState('');

  const resetDonorForm = () => {
    setEditingDonor(null);
    setDonorName('');
    setDonorDesig('');
    setDonorCat('Donor Member');
    setDonorContrib('');
    setDonorPhoto('');
  };

  const handleOpenEditDonor = (d: DonorMember) => {
    setEditingDonor(d);
    setDonorName(d.name);
    setDonorDesig(d.designation);
    setDonorCat(d.donorCategory);
    setDonorContrib(d.contribution);
    setDonorPhoto(d.photoUrl);
    setShowDonorModal(true);
  };

  const handleSaveDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName) return;

    const photo = donorPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300';

    if (editingDonor) {
      const updated: DonorMember = {
        ...editingDonor,
        name: donorName,
        designation: donorDesig,
        donorCategory: donorCat,
        contribution: donorContrib,
        photoUrl: photo
      };
      storage.updateDonor(updated);
      showToast('দাতা সদস্যের তথ্য আপডেট হয়েছে', 'success');
    } else {
      const newD: DonorMember = {
        id: `dn_${Date.now()}`,
        name: donorName,
        designation: donorDesig,
        donorCategory: donorCat,
        contribution: donorContrib,
        photoUrl: photo,
        joinDate: '২০২৬'
      };
      storage.addDonor(newD);
      showToast('নতুন দাতা সদস্য যুক্ত করা হয়েছে', 'success');
    }

    setDonors(storage.getDonors());
    setShowDonorModal(false);
    resetDonorForm();
  };

  const handleDeleteDonor = (id: string) => {
    if (window.confirm('আপনি কি এই দাতা সদস্য মুছতে চান?')) {
      storage.deleteDonor(id);
      setDonors(storage.getDonors());
      showToast('দাতা সদস্য মুছে ফেলা হয়েছে', 'info');
    }
  };

  const [notices, setNotices] = useState<Notice[]>(() => storage.getNotices());
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [nTitle, setNTitle] = useState('');
  const [nContent, setNContent] = useState('');
  const [nCat, setNCat] = useState<Notice['category']>('General');
  const [nUrgent, setNUrgent] = useState(false);

  const handleOpenEditNotice = (n: Notice) => {
    setEditingNotice(n);
    setNTitle(n.title);
    setNContent(n.content);
    setNCat(n.category);
    setNUrgent(n.isUrgent || false);
    setShowNoticeModal(true);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle || !nContent) return;

    if (editingNotice) {
      const updated: Notice = {
        ...editingNotice,
        title: nTitle,
        content: nContent,
        category: nCat,
        isUrgent: nUrgent
      };
      storage.updateNotice(updated);
      showToast('নোটিশ সফলভাবে আপডেট হয়েছে', 'success');
    } else {
      const newN: Notice = {
        id: `not_${Date.now()}`,
        title: nTitle,
        content: nContent,
        category: nCat,
        date: new Date().toISOString().split('T')[0],
        publishedBy: 'লাইব্রেরি অ্যাডমিন',
        isUrgent: nUrgent
      };
      storage.addNotice(newN);
      showToast('নতুন নোটিশ প্রকাশিত হয়েছে', 'success');
    }

    setNotices(storage.getNotices());
    setShowNoticeModal(false);
    setEditingNotice(null);
    setNTitle('');
    setNContent('');
  };

  const handleDeleteNotice = (id: string) => {
    if (window.confirm('নোটিশটি মুছে ফেলতে চান?')) {
      storage.deleteNotice(id);
      setNotices(storage.getNotices());
      showToast('নোটিশ মুছে ফেলা হয়েছে', 'info');
    }
  };

  const [gallery, setGallery] = useState<GalleryItem[]>(() => storage.getGallery());
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);

  const [gTitle, setGTitle] = useState('');
  const [gUrl, setGUrl] = useState('');
  const [gCat, setGCat] = useState('Events');

  const handleOpenEditGallery = (g: GalleryItem) => {
    setEditingGallery(g);
    setGTitle(g.title);
    setGUrl(g.imageUrl);
    setGCat(g.category);
    setShowGalleryModal(true);
  };

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gTitle || !gUrl) {
      showToast('ছবি ও শিরোনাম প্রদান করা আবশ্যক', 'error');
      return;
    }

    if (editingGallery) {
      const updated: GalleryItem = {
        ...editingGallery,
        title: gTitle,
        imageUrl: gUrl,
        category: gCat
      };
      storage.updateGalleryItem(updated);
      showToast('গ্যালারির ছবি আপডেট হয়েছে', 'success');
    } else {
      const newG: GalleryItem = {
        id: `gal_${Date.now()}`,
        title: gTitle,
        imageUrl: gUrl,
        category: gCat,
        date: new Date().toISOString().split('T')[0]
      };
      storage.addGalleryItem(newG);
      showToast('গ্যালারিতে নতুন ছবি যুক্ত হয়েছে', 'success');
    }

    setGallery(storage.getGallery());
    setShowGalleryModal(false);
    setEditingGallery(null);
    setGTitle('');
    setGUrl('');
  };

  const handleDeleteGallery = (id: string) => {
    if (window.confirm('গ্যালারির এই ছবিটি মুছতে চান?')) {
      storage.deleteGalleryItem(id);
      setGallery(storage.getGallery());
      showToast('ছবি মুছে ফেলা হয়েছে', 'info');
    }
  };

  const [events, setEvents] = useState<LibraryEvent[]>(() => storage.getEvents());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LibraryEvent | null>(null);

  const [eTitle, setETitle] = useState('');
  const [eDate, setEDate] = useState('');
  const [eTime, setETime] = useState('সকাল ১০:০০ - দুপুর ১২:০০');
  const [eLocation, setELocation] = useState('লাইব্রেরি সেমিনার হল');
  const [eDesc, setEDesc] = useState('');
  const [eImage, setEImage] = useState('');

  const handleOpenEditEvent = (evt: LibraryEvent) => {
    setEditingEvent(evt);
    setETitle(evt.title);
    setEDate(evt.date);
    setETime(evt.time);
    setELocation(evt.location);
    setEDesc(evt.description);
    setEImage(evt.imageUrl);
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eTitle || !eDate) {
      showToast('ইভেন্টের শিরোনাম ও তারিখ দেওয়া আবশ্যক', 'error');
      return;
    }

    if (editingEvent) {
      const updated: LibraryEvent = {
        ...editingEvent,
        title: eTitle,
        date: eDate,
        time: eTime,
        location: eLocation,
        description: eDesc,
        imageUrl: eImage || 'img_event_01'
      };
      storage.updateEvent(updated);
      showToast('ইভেন্ট আপডেট করা হয়েছে', 'success');
    } else {
      const newEvt: LibraryEvent = {
        id: `evt_${Date.now()}`,
        title: eTitle,
        date: eDate,
        time: eTime,
        location: eLocation,
        description: eDesc,
        imageUrl: eImage || 'img_event_01',
        organizer: 'লাইব্রেরি পরিচালনা পর্ষদ'
      };
      storage.addEvent(newEvt);
      showToast('নতুন ইভেন্ট যুক্ত করা হয়েছে', 'success');
    }

    setEvents(storage.getEvents());
    setShowEventModal(false);
    setEditingEvent(null);
    setETitle('');
    setEDate('');
    setEDesc('');
    setEImage('');
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('ইভেন্টটি মুছে ফেলতে চান?')) {
      storage.deleteEvent(id);
      setEvents(storage.getEvents());
      showToast('ইভেন্ট মুছে ফেলা হয়েছে', 'info');
    }
  };

  const [usersList, setUsersList] = useState<User[]>(() => storage.getUsers());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [uFullName, setUFullName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uMobile, setUMobile] = useState('');
  const [uAddress, setUAddress] = useState('');
  const [uRole, setURole] = useState<User['role']>('MEMBER');
  const [uPassword, setUPassword] = useState('Library123');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uFullName || !uEmail || !uMobile) {
      showToast('সকল আবশ্যক তথ্য প্রদান করুন', 'error');
      return;
    }

    const cleanEmail = uEmail.trim().toLowerCase();
    const duplicate = usersList.find(u => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      showToast('এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে', 'error');
      return;
    }

    const memberNum = 3000 + usersList.length + 1;
    const newMemberId = `SAJKS-${uRole.substring(0, 2)}-${memberNum}`;

    const newUser: User = {
      id: `usr_adm_${Date.now()}`,
      fullName: uFullName.trim(),
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      mobile: uMobile.trim(),
      address: uAddress.trim() || 'বাবুগঞ্জ, বরিশাল',
      role: uRole,
      passwordHash: mockHashPassword(uPassword),
      mustChangePassword: true,
      isEmailVerified: true,
      memberId: newMemberId,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    storage.addUser(newUser);
    logActivity(
      'USER_CREATED',
      'USER_MANAGEMENT',
      'SUCCESS',
      `নতুন ইউজার অ্যাকাউন্ট তৈরি: "${uFullName}" (${uRole}) - কার্ড ID: ${newMemberId}`,
      undefined,
      undefined,
      { targetUserId: newUser.id, targetUserName: uFullName, role: uRole, email: cleanEmail }
    );
    setUsersList(storage.getUsers());
    setShowAddUserModal(false);
    setUFullName('');
    setUEmail('');
    setUMobile('');
    setUAddress('');
    showToast(`নতুন ব্যবহারকারী (${uRole}) সফলভাবে যুক্ত করা হয়েছে! ID: ${newMemberId}`, 'success');
  };

  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>(() => storage.getBorrowRecords());
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueBookId, setIssueBookId] = useState('');
  const [issueUserId, setIssueUserId] = useState('');
  const [issueDays, setIssueDays] = useState(14);
  const [issueNotes, setIssueNotes] = useState('');

  const handleIssueBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBookId || !issueUserId) {
      showToast('বই এবং সদস্য নির্বাচন করুন', 'error');
      return;
    }

    const targetBook = books.find(b => b.id === issueBookId);
    const targetUser = usersList.find(u => u.id === issueUserId);

    if (!targetBook || targetBook.availableCopies <= 0) {
      showToast('নির্বাচিত বইটির কোনো কপি বর্তমানে লাইব্রেরিতে খালি নেই', 'error');
      return;
    }

    if (!targetUser) {
      showToast('সদস্য পাওয়া যায়নি', 'error');
      return;
    }

    const today = new Date();
    const issueDateStr = today.toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + issueDays);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const newRecord: BorrowRecord = {
      id: `brw_${Date.now()}`,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      userId: targetUser.id,
      userName: targetUser.fullName,
      userEmail: targetUser.email,
      userMemberId: targetUser.memberId,
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      status: 'issued',
      fineAmount: 0,
      finePaid: true,
      issuedBy: 'লাইব্রেরি অ্যাডমিন'
    };

    storage.addBorrowRecord(newRecord);
    logActivity(
      'BOOK_ISSUED',
      'CIRCULATION',
      'SUCCESS',
      `বই ইস্যু: "${targetBook.title}" সদস্য: ${targetUser.fullName} (${targetUser.memberId || targetUser.email})`,
      undefined,
      undefined,
      { recordId: newRecord.id, bookId: targetBook.id, memberId: targetUser.id, dueDate: dueDateStr }
    );
    setBorrowRecords(storage.getBorrowRecords());
    setBooks(storage.getBooks());
    setShowIssueModal(false);
    setIssueBookId('');
    setIssueUserId('');
    showToast(`"${targetBook.title}" সফলভাবে সদস্য ${targetUser.fullName}-কে ইস্যু করা হয়েছে!`, 'success');
  };

  const handleReturnBook = (borrowId: string) => {
    const record = borrowRecords.find(r => r.id === borrowId);
    const todayStr = new Date().toISOString().split('T')[0];
    storage.returnBookRecord(borrowId, todayStr, 0);
    logActivity(
      'BOOK_RETURNED',
      'CIRCULATION',
      'SUCCESS',
      `বই ফেরত গ্রহণ: "${record?.bookTitle || borrowId}" সদস্য: ${record?.userName || 'সদস্য'}`,
      undefined,
      undefined,
      { recordId: borrowId, bookTitle: record?.bookTitle }
    );
    setBorrowRecords(storage.getBorrowRecords());
    setBooks(storage.getBooks());
    showToast('বইটি সফলভাবে লাইব্রেরিতে জমা/রিটার্ন নেওয়া হয়েছে!', 'success');
  };

  const handleDeleteBorrowRecord = (borrowId: string) => {
    const record = borrowRecords.find(r => r.id === borrowId);
    if (window.confirm('আপনি কি এই ইস্যু রেকর্ডটি তালিকা থেকে মুছে ফেলতে চান?')) {
      const updated = borrowRecords.filter(r => r.id !== borrowId);
      setBorrowRecords(updated);
      storage.saveBorrowRecords(updated);
      logActivity(
        'CIRCULATION_RECORD_DELETED',
        'CIRCULATION',
        'WARNING',
        `ইস্যু রেকর্ড মুছে ফেলা হয়েছে: "${record?.bookTitle || borrowId}"`,
        undefined,
        undefined,
        { recordId: borrowId }
      );
      showToast('ইস্যু রেকর্ড মুছে ফেলা হয়েছে', 'info');
    }
  };

  const handleUserRoleChange = (userId: string, newRole: User['role']) => {
    const target = usersList.find(u => u.id === userId);
    const updated = usersList.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsersList(updated);
    storage.saveUsers(updated);
    logActivity(
      'USER_ROLE_CHANGED',
      'USER_MANAGEMENT',
      'WARNING',
      `ব্যবহারকারীর ভূমিকা পরিবর্তন: "${target?.fullName || userId}" নতুন রোল: ${newRole}`,
      undefined,
      undefined,
      { targetUserId: userId, oldRole: target?.role, newRole }
    );
    showToast(`ব্যবহারকারীর ভূমিকা (${newRole}) পরিবর্তন করা হয়েছে`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    const target = usersList.find(u => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'suspended' : 'active';
    const updated = usersList.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    setUsersList(updated);
    storage.saveUsers(updated);
    logActivity(
      'USER_STATUS_TOGGLED',
      'USER_MANAGEMENT',
      newStatus === 'active' ? 'SUCCESS' : 'WARNING',
      `ব্যবহারকারী স্ট্যাটাস পরিবর্তন: "${target.fullName}" (${newStatus === 'active' ? 'সক্রিয় করা হয়েছে' : 'স্থগিত করা হয়েছে'})`,
      undefined,
      undefined,
      { targetUserId: userId, newStatus }
    );
    showToast(`ব্যবহারকারীর স্ট্যাটাস "${newStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'}" করা হয়েছে`, 'info');
  };

  const handleDeleteUser = (userId: string) => {
    const target = usersList.find(u => u.id === userId);
    if (window.confirm('আপনি কি নিশ্চিত যে এই ইউজারটি মুছে ফেলতে চান?')) {
      const updated = usersList.filter(u => u.id !== userId);
      setUsersList(updated);
      storage.saveUsers(updated);
      logActivity(
        'USER_DELETED',
        'USER_MANAGEMENT',
        'DANGER',
        `ব্যবহারকারী অ্যাকাউন্ট মুছে ফেলা হয়েছে: "${target?.fullName || userId}" (ইমেইল: ${target?.email})`,
        undefined,
        undefined,
        { targetUserId: userId, email: target?.email }
      );
      showToast('ব্যবহারকারী মুছে ফেলা হয়েছে', 'info');
    }
  };

  const handleAdminResetPassword = (targetUser: User) => {
    const tempPass = prompt(`ব্যবহারকারী "${targetUser.fullName}" এর নতুন পাসওয়ার্ড লিখুন:`, 'Member@123');
    if (!tempPass) return;

    const updated = usersList.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          passwordHash: mockHashPassword(tempPass),
          mustChangePassword: false
        };
      }
      return u;
    });

    setUsersList(updated);
    storage.saveUsers(updated);
    showToast(`"${targetUser.fullName}" এর পাসওয়ার্ড সফলভাবে "${tempPass}" এ পরিবর্তন করা হয়েছে!`, 'success');
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      books: storage.getBooks(),
      digitalBooks: storage.getDigitalBooks(),
      users: storage.getUsers(),
      notices: storage.getNotices(),
      events: storage.getEvents(),
      gallery: storage.getGallery(),
      donors: storage.getDonors(),
      siteInfo: storage.getSiteInfo(),
      milestones: storage.getMilestones(),
      mediaLibrary: storage.getMediaLibrary(),
      borrowRecords: storage.getBorrowRecords()
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sajks_library_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('সম্পূর্ণ ডাটাবেজ ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.books) storage.saveBooks(data.books);
        if (data.digitalBooks) storage.saveDigitalBooks(data.digitalBooks);
        if (data.users) storage.saveUsers(data.users);
        if (data.notices) storage.saveNotices(data.notices);
        if (data.events) storage.saveEvents(data.events);
        if (data.gallery) storage.saveGallery(data.gallery);
        if (data.donors) storage.saveDonors(data.donors);
        if (data.siteInfo) storage.saveSiteInfo(data.siteInfo);
        if (data.milestones) storage.saveMilestones(data.milestones);
        if (data.mediaLibrary) storage.saveMediaLibrary(data.mediaLibrary);
        if (data.borrowRecords) storage.saveBorrowRecords(data.borrowRecords);

        showToast('ডাটাবেজ ব্যাকআপ ফাইল সফলভাবে রিস্টোর হয়েছে!', 'success');
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        showToast('অকার্যকর ব্যাকআপ ফাইল। সঠিক JSON ফাইল প্রদান করুন।', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = () => {
    if (window.confirm('সতর্কতা: আপনি কি নিশ্চিত যে প্রাথমিক মূল ডাটাবেজে রিসেট করতে চান? আপনার কাস্টম পরিবর্তন মুছে যাবে।')) {
      storage.resetAll();
      showToast('ডাটাবেজ সফলভাবে রিসেট করা হয়েছে!', 'success');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <Building className="w-7 h-7 text-emerald-400" />
            <span>লাইব্রেরি অ্যাডমিন ড্যাশবোর্ড (Content Management System)</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1">
            বই ক্যাটালগ, ই-বুক, প্রতিষ্ঠাতা তথ্য, দাতা সদস্য, নোটিশ ও ছবি সম্পাদনা করুন
          </p>
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-bold border border-emerald-600 flex items-center gap-1.5 shadow-xs transition-all shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
          <span>পাসওয়ার্ড পরিবর্তন</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
        <button
          onClick={() => setActiveTab('books')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'books'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>বই ক্যাটালগ ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('digital')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'digital'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ডিজিটাল ই-বুক ({digitalBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('circulation')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'circulation'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>বই ইস্যু ও রিটার্ন ({borrowRecords.length})</span>
        </button>

        {canManageUsers(currentUser?.role) && (
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>ইউজার ও মেম্বারশিপ ({usersList.length})</span>
        </button>
        )}

        {canManageUsers(currentUser?.role) && (
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'logs'
              ? 'bg-rose-700 text-white shadow-md font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-300" />
          <span>অডিট ও অ্যাক্টিভিটি লগ</span>
        </button>
        )}

        <button
          onClick={() => setActiveTab('events')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'events'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>ইভেন্ট ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'notices'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>নোটিশ ({notices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'gallery'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>গ্যালারি ({gallery.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('donors')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'donors'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>দাতা সদস্য ({donors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('founder_site')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'founder_site'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>প্রতিষ্ঠাতা ও সাইট সেটিংস</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'media'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'
          }`}
        >
          <Database className="w-4 h-4 text-amber-300" />
          <span>মিডিয়া ডাটাবেজ</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'reports'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>রিপোর্ট ও অ্যানালিটিক্স</span>
        </button>

        {canManageUsers(currentUser?.role) && (
        <button
          onClick={() => setActiveTab('backup')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-md font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>ব্যাকআপ ও রিস্টোর</span>
        </button>
        )}

        <button
          onClick={() => setActiveTab('password')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'password'
              ? 'bg-rose-600 text-white shadow-md font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <KeyRound className="w-4 h-4 text-rose-300" />
          <span>পাসওয়ার্ড পরিবর্তন</span>
        </button>
      </div>

      {canManageUsers(currentUser?.role) && activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>সিস্টেমের নিবন্ধিত সকল ইউজার ও মেম্বারশিপ তালিকা ({usersList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">অ্যাডমিন ও মেম্বার অ্যাকাউন্ট পরিচালনা, রোল পরিবর্তন, স্ট্যাটাস পরিবর্তন এবং পাসওয়ার্ড রিসেট করুন</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন সদস্য / এডমিন যোগ করুন</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="p-3">নাম ও মেম্বার কার্ড আইডি</th>
                  <th className="p-3">যোগাযোগ</th>
                  <th className="p-3">সিস্টেম রোল</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{u.fullName}</div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">কার্ড: {u.memberId || u.memberCardId || 'MEMBER-ID-NONE'}</div>
                    </td>
                    <td className="p-3 space-y-0.5">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{u.email}</div>
                      <div className="text-[11px] text-slate-500">{u.mobile || u.mobileNumber || 'মোবাইল তথ্য নেই'}</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role === 'MEMBER' ? 'MEMBER' : 'ADMIN'}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value as User['role'])}
                        className={`border rounded-lg px-2.5 py-1 font-bold text-[11px] ${
                          u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.role === 'LIBRARY_ADMIN' || u.role === 'LIBRARIAN'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                        }`}
                      >
                        <option value="ADMIN">🛡️ ADMIN (অ্যাডমিন / পরিচালক)</option>
                        <option value="MEMBER">👤 MEMBER (সাধারণ সদস্য)</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {u.status === 'active' ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="ইউজার তথ্য ও পাসওয়ার্ড সম্পাদনা করুন"
                        >
                          <Edit className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>সম্পাদনা / পাসওয়ার্ড</span>
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            u.status === 'active'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'স্থগিত' : 'সক্রিয়'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAddUserModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>নতুন ইউজার বা সদস্য অ্যাকাউন্ট তৈরি করুন</span>
                  </h3>
                  <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      value={uFullName}
                      onChange={(e) => setUFullName(e.target.value)}
                      placeholder="যেমন: মোঃ কামরুল হাসান"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">ইমেইল ঠিকানা *</label>
                    <input
                      type="email"
                      required
                      value={uEmail}
                      onChange={(e) => setUEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={uMobile}
                      onChange={(e) => setUMobile(e.target.value)}
                      placeholder="01700000000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">ঠিকানা</label>
                    <input
                      type="text"
                      value={uAddress}
                      onChange={(e) => setUAddress(e.target.value)}
                      placeholder="বাবুগঞ্জ, বরিশাল"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">সিস্টেম ভূমিকা (Role) *</label>
                    <select
                      value={uRole === 'MEMBER' ? 'MEMBER' : 'ADMIN'}
                      onChange={(e) => setURole(e.target.value as User['role'])}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="ADMIN">🛡️ ADMIN (অ্যাডমিন / পরিচালক - সব এডিট ও এড করার ক্ষমতা)</option>
                      <option value="MEMBER">👤 MEMBER (সাধারণ সদস্য - বই পড়া ও ধার নেওয়া)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">প্রাথমিক পাসওয়ার্ড</label>
                    <input
                      type="text"
                      value={uPassword}
                      onChange={(e) => setUPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>তৈরি করুন</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {canManageUsers(currentUser?.role) && activeTab === 'logs' && (
        <AdminLogViewer />
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>ইভেন্ট, সেমিনার ও কর্মসূচীর তালিকা ({events.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">লাইব্রেরির সাম্প্রতিক ও আগামী কর্মসূচীর তথ্য প্রকাশ ও সম্পাদনা করুন</p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setETitle('');
                setEDate('');
                setEDesc('');
                setEImage('');
                setShowEventModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ইভেন্ট যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e) => (
              <div key={e.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <SafeImage
                    src={e.imageUrl}
                    alt={e.title}
                    category="event"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-emerald-300 font-bold border border-emerald-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{e.date}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{e.title}</h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">স্থান: {e.location} • {e.time}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{e.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditEvent(e)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-500" />
                      <span>সম্পাদনা</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowEventModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>{editingEvent ? 'ইভেন্ট তথ্য সম্পাদনা' : 'নতুন ইভেন্ট প্রকাশ'}</span>
            </h2>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <ImageInputPicker
                value={eImage}
                onChange={setEImage}
                label="ইভেন্ট ব্যানার / ফটো (Upload / URL)"
                helpText="ইভেন্টের আকর্ষণীয় কভার ছবি নির্বাচন করুন বা ইউআরএল দিন"
                aspectRatio="banner"
              />

              <div>
                <label className="block font-semibold mb-1">ইভেন্ট শিরোনাম *</label>
                <input type="text" required value={eTitle} onChange={(e) => setETitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">তারিখ (YYYY-MM-DD) *</label>
                  <input type="text" required value={eDate} onChange={(e) => setEDate(e.target.value)} placeholder="২০২৬-০৯-১৫" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">সময়</label>
                  <input type="text" value={eTime} onChange={(e) => setETime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">স্থান / ভেন্যু</label>
                <input type="text" value={eLocation} onChange={(e) => setELocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>

              <div>
                <label className="block font-semibold mb-1">ইভেন্টের বিবরণ</label>
                <textarea rows={3} value={eDesc} onChange={(e) => setEDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5"><Save className="w-4 h-4" /><span>সংরক্ষণ করুন</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <CentralMediaManager />
      )}

      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              সকল ফিজিক্যাল বইয়ের তালিকা
            </h2>
            <button
              onClick={() => { resetBookForm(); setShowBookModal(true); }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন বই যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {books.map(b => (
              <div key={b.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-22 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden">
                    <SafeImage
                      src={b.coverImage || b.coverUrl}
                      alt={b.title}
                      category="book_cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 overflow-hidden text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                      {b.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{b.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 truncate">{b.author}</p>
                    <p className="text-[10px] text-slate-400 font-mono">শেলফ: {b.shelfNumber} | কপি: {b.availableCopies}/{b.quantity}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => handleOpenEditBook(b)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                    <Edit className="w-3.5 h-3.5" />
                    <span>সম্পাদনা</span>
                  </button>
                  <button onClick={() => handleDeleteBook(b.id)} className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'digital' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ডিজিটাল ই-বুক ও পিডিএফ তালিকা
            </h2>
            <button
              onClick={() => { resetDigitalForm(); setShowDigitalModal(true); }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ই-বুক যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {digitalBooks.map(db => (
              <div key={db.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-22 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden">
                    <SafeImage
                      src={db.coverUrl}
                      alt={db.title}
                      category="book_cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 overflow-hidden text-xs">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-[10px]">
                        {db.category}
                      </span>
                      {db.fileUrl || db.pdfUrl ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium text-[9px]">
                          ✓ PDF যুক্ত
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-medium text-[9px]">
                          সংরক্ষিত (PDF ছাড়া)
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{db.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 truncate">{db.author}</p>
                    <p className="text-[10px] text-slate-400 font-mono">পৃষ্ঠা: {db.pageCount} • {db.fileUrl || db.pdfUrl ? (db.fileSize || 'PDF') : 'ক্যাটালগ সংরক্ষিত'}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => handleOpenEditDigital(db)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                    <Edit className="w-3.5 h-3.5" />
                    <span>সম্পাদনা</span>
                  </button>
                  <button onClick={() => handleDeleteDigital(db.id)} className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'founder_site' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>ফ্রন্ট পেজ, অভ্যন্তরীণ পেজ ও লাইব্রেরি কনটেন্ট এডমিন ড্যাশবোর্ড</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ডিভাইস থেকে সরাসরি ছবি আপলোড (Device Upload) অথবা Image URL ব্যবহার করে ফ্রন্ট পেজ ও ইন্টারনাল পেজের ছবি এবং টেক্সট পরিবর্তন করুন।
            </p>
          </div>

          <form onSubmit={handleSaveSiteInfo} className="space-y-6 text-xs">
            
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>১. ফ্রন্ট পেজ (Home Page) ছবি ও শিরোনাম পরিবর্তন</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageInputPicker
                  value={heroBannerImage}
                  onChange={(url) => setHeroBannerImage(url)}
                  label="হোম পেজ হিরো ব্যানার ব্যাকগ্রাউন্ড ছবি"
                  helpText="হোম পেজের উপরের ব্যানারটির ব্যাকগ্রাউন্ড ছবি পরিবর্তন করুন"
                  aspectRatio="banner"
                />

                <ImageInputPicker
                  value={libraryExteriorImage}
                  onChange={(url) => setLibraryExteriorImage(url)}
                  label="লাইব্রেরি ভবনের বাহ্যিক ছবি (Main Exterior Building)"
                  helpText="ফ্রন্ট পেজ ও আমাদের সম্পর্কে পেজে প্রদর্শিত ভবন ছবি"
                  aspectRatio="cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold mb-1">ফ্রন্ট পেজ প্রধান হেডিং (Hero Title)</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="যেমন: Speaker Abdul Jabbar Khan Memorial Public Library"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">মোটো / স্লোগান (Motto)</label>
                  <input
                    type="text"
                    value={mottoText}
                    onChange={(e) => setMottoText(e.target.value)}
                    placeholder="যেমন: আলোকের সন্ধানই জীবনের আলো"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">হোম পেজ সাব-টাইটেল বর্ণনা</label>
                <textarea
                  rows={2}
                  value={heroSubTitle}
                  onChange={(e) => setHeroSubTitle(e.target.value)}
                  placeholder="গ্রামীণ জনপদে আলোর দিশারী হিসেবে গত ২৫ বছর যাবত নিরবচ্ছিন্ন জ্ঞান চর্চা ও গবেষণা সেবা..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                ></textarea>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>২. প্রতিষ্ঠাতা জনাব মোঃ নুরুল ইসলাম (মানিক) মৃধার ছবি ও জীবনী</span>
              </h3>

              <ImageInputPicker
                value={founderForm.photoUrl}
                onChange={(url) => setFounderForm({ ...founderForm, photoUrl: url })}
                label="প্রতিষ্ঠাতার ছবি (Device Upload / Image URL)"
                helpText="সরাসরি ডিভাইস থেকে ছবি ফাইল আপলোড করুন অথবা পিকচার লিংক পেস্ট করুন"
                aspectRatio="square"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">প্রতিষ্ঠাতার নাম *</label>
                  <input
                    type="text"
                    required
                    value={founderForm.name}
                    onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">পদবি / পরিচয় *</label>
                  <input
                    type="text"
                    required
                    value={founderForm.designation}
                    onChange={(e) => setFounderForm({ ...founderForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">প্রতিষ্ঠাতার প্রেরণা বা বাণী (Quote)</label>
                <textarea
                  rows={2}
                  value={founderForm.quote}
                  onChange={(e) => setFounderForm({ ...founderForm, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1">প্রতিষ্ঠাতার বিস্তারিত জীবনী ও অবদান</label>
                <textarea
                  rows={3}
                  value={founderForm.bio1}
                  onChange={(e) => setFounderForm({ ...founderForm, bio1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                ></textarea>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>৩. 'আমাদের সম্পর্কে' (About Page) ও মিশন-ভিশন</span>
              </h3>

              <ImageInputPicker
                value={aboutHeaderImage}
                onChange={(url) => setAboutHeaderImage(url)}
                label="আমাদের সম্পর্কে পেজের হেডার ছবি"
                helpText="অভ্যন্তরীণ 'আমাদের সম্পর্কে' পেজের উপরের ব্যানার/ছবি"
                aspectRatio="banner"
              />

              <div>
                <label className="block font-semibold mb-1">লাইব্রেরির সংক্ষিপ্ত পরিচিতি (About Intro)</label>
                <textarea
                  rows={3}
                  value={aboutIntro}
                  onChange={(e) => setAboutIntro(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">আমাদের মিশন (Mission)</label>
                  <textarea
                    rows={2}
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  ></textarea>
                </div>
                <div>
                  <label className="block font-semibold mb-1">আমাদের ভিশন (Vision)</label>
                  <textarea
                    rows={2}
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>৪. লাইব্রেরির ঠিকানা ও সর্বজনীন তথ্য</span>
              </h3>

              <div>
                <label className="block font-semibold mb-1">লাইব্রেরি পূর্ণ ঠিকানা</label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={siteEmail}
                    onChange={(e) => setSiteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মোবাইল / ফোন</label>
                  <input
                    type="text"
                    value={sitePhone}
                    onChange={(e) => setSitePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">খোলা থাকার সময়সূচী</label>
                  <input
                    type="text"
                    value={siteHours}
                    onChange={(e) => setSiteHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>সকল তথ্য ও ছবি সংরক্ষণ করুন</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'donors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              দাতা সদস্যদের তালিকা
            </h2>
            <button
              onClick={() => { resetDonorForm(); setShowDonorModal(true); }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন দাতা সদস্য যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map(d => (
              <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={d.photoUrl} alt={d.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shrink-0" />
                  <div className="text-xs overflow-hidden">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{d.name}</h3>
                    <p className="text-[11px] text-emerald-600 font-medium truncate">{d.designation}</p>
                    <span className="text-[10px] text-amber-600 font-bold">{d.donorCategory}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenEditDonor(d)} className="p-1.5 text-slate-500 hover:text-emerald-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteDonor(d.id)} className="p-1.5 text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              নোটিশ বোর্ড ব্যবস্থাপনা
            </h2>
            <button
              onClick={() => { setEditingNotice(null); setNTitle(''); setNContent(''); setShowNoticeModal(true); }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন নোটিশ প্রকাশ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {notices.map(n => (
              <div key={n.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex justify-between items-start gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {n.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{n.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{n.content}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenEditNotice(n)} className="p-1.5 text-slate-500 hover:text-emerald-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteNotice(n.id)} className="p-1.5 text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ফটো গ্যালারি ছবি
            </h2>
            <button
              onClick={() => { setEditingGallery(null); setGTitle(''); setGUrl(''); setShowGalleryModal(true); }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ছবি যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map(g => (
              <div key={g.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs relative group">
                <img src={g.imageUrl} alt={g.title} className="w-full h-36 object-cover" />
                <div className="p-3 text-xs flex justify-between items-center">
                  <span className="font-bold truncate text-slate-900 dark:text-white">{g.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleOpenEditGallery(g)} className="p-1 text-slate-500 hover:text-emerald-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteGallery(g.id)} className="p-1 text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'circulation' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>বই ইস্যু ও রিটার্ন ব্যবস্থাপনা ({borrowRecords.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">সদস্যদের বই ধার দেওয়া, ফেরত নেওয়া এবং ডিউ ডেট ট্র্যাক করুন</p>
            </div>
            <button
              onClick={() => {
                setIssueBookId(books.find(b => b.availableCopies > 0)?.id || '');
                setIssueUserId(usersList.find(u => u.role === 'MEMBER')?.id || usersList[0]?.id || '');
                setShowIssueModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
            >
              <BookMarked className="w-4 h-4" />
              <span>নতুন বই ইস্যু করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">মোট ইস্যুকৃত বই</p>
                <p className="text-2xl font-extrabold text-emerald-900 dark:text-white mt-1">
                  {borrowRecords.filter(r => r.status === 'issued').length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">ফেরত সম্পন্ন রেকর্ড</p>
                <p className="text-2xl font-extrabold text-blue-900 dark:text-white mt-1">
                  {borrowRecords.filter(r => r.status === 'returned').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500 opacity-60" />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700 dark:text-amber-300 font-bold">মোট লেনদেন ইতিহাস</p>
                <p className="text-2xl font-extrabold text-amber-900 dark:text-white mt-1">{borrowRecords.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-60" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="p-3">বইয়ের বিবরণ</th>
                  <th className="p-3">সদস্যের তথ্য</th>
                  <th className="p-3">ইস্যু ও জমা তারিখ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {borrowRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      কোনো বই ইস্যুর রেকর্ড পাওয়া যায়নি। &quot;নতুন বই ইস্যু করুন&quot; বাটনে ক্লিক করে বই ইস্যু করুন।
                    </td>
                  </tr>
                ) : (
                  borrowRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{record.bookTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono">আইডি: {record.bookId}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{record.userName}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">আইডি: {record.userMemberId || 'MEMBER-ID'}</div>
                        <div className="text-[10px] text-slate-400">{record.userEmail}</div>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <div className="text-slate-600 dark:text-slate-300">ইস্যু: <span className="font-bold">{record.issueDate}</span></div>
                        <div className="text-rose-600 dark:text-rose-400">ডিউ: <span className="font-bold">{record.dueDate}</span></div>
                        {record.returnDate && (
                          <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">ফেরত: {record.returnDate}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${
                          record.status === 'issued'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}>
                          {record.status === 'issued' ? '⏳ চলমান (Borrowed)' : '✅ ফেরত সম্পন্ন (Returned)'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {record.status === 'issued' && (
                            <button
                              onClick={() => handleReturnBook(record.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>জমা নিন</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBorrowRecord(record.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="space-y-4">
          <CentralMediaManager />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>লাইব্রেরি সমগ্র পরিসংখ্যান ও অ্যানালিটিক্স রিপোর্ট</span>
            </h2>
            <p className="text-xs text-slate-500">
              Speaker Abdul Jabbar Khan Memorial Public Library's মোট সম্পদ, বই, পাঠক ও কার্যক্রমের পূর্ণ বিবরণ
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500">মোট বই শিরোনাম</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{books.length} টি</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">মোট ফিজিক্যাল কপি: {books.reduce((acc, b) => acc + (b.quantity || 1), 0)} টি</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500">ডিজিটাল ই-বুক</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{digitalBooks.length} টি</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">অনলাইনে পড়ার জন্য উন্মুক্ত</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500">মোট নিবন্ধিত সদস্য</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{usersList.length} জন</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">সক্রিয় মেম্বার আইডি সহ</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500">দাতা ও পৃষ্ঠপোষক</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{donors.length} জন</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">আজীবন ও দাতা সদস্য</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">ক্যাটাগরিভিত্তিক বইয়ের বিভাজন:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                {(['Novel', 'Poetry', 'History', 'Liberation War', 'Science', 'Religion'] as BookCategory[]).map(cat => {
                  const count = books.filter(b => b.category === cat).length;
                  return (
                    <div key={cat} className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{cat}</p>
                      <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{count} টি</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {canManageUsers(currentUser?.role) && activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                <span>ডাটাবেজ ব্যাকআপ ও সম্পূর্ণ রিস্টোর কন্ট্রোল</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                লাইব্রেরির সমস্ত বই, ই-বুক, ইউজার, নোটিশ, ছবি ও সেটিংস এক ক্লিকে ডাউনলোড বা রিস্টোর করুন
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                    <Download className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">১. সম্পূর্ণ ব্যাকআপ ডাউনলোড</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    বর্তমান সমস্ত বই, ইউজার ও কনটেন্ট একটি সুরক্ষিত JSON ব্যাকআপ ফাইল হিসেবে ডাউনলোড করুন।
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON ব্যাকআপ ডাউনলোড</span>
                </button>
              </div>

              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">২. ব্যাকআপ থেকে রিস্টোর</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    পূর্বে ডাউনলোড করা JSON ফাইল সিলেক্ট করে সাইটের যাবতীয় ডাটা পূর্বাবস্থায় ফিরিয়ে আনুন।
                  </p>
                </div>
                <label className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-center">
                  <Upload className="w-4 h-4" />
                  <span>JSON ফাইল সিলেক্ট করুন</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-5 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">৩. ডিফল্ট ডাটাবেজে রিসেট</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    সমস্ত পরিবর্তন মুছে ফেলে প্রাথমিক মূল লাইব্রেরি ক্যাটালগে রিসেট করতে চান?
                  </p>
                </div>
                <button
                  onClick={handleResetDatabase}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ফ্যাক্টরি রিসেট করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-rose-600" />
                  <span>অ্যাডমিন পাসওয়ার্ড ও নিরাপত্তা প্যানেল (Password & Security Management)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  আপনার নিজস্ব পাসওয়ার্ড পরিবর্তন করুন অথবা প্রয়োজনে যেকোনো ইউজার/লাইব্রেরিয়ানের পাসওয়ার্ড আপডেট করুন
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
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">১. নিজস্ব অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h3>
                    <p className="text-[11px] text-slate-500">লগইনরত অ্যাকাউন্ট: <strong>{currentUser?.fullName || 'Admin'}</strong> ({currentUser?.email})</p>
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

              {canManageUsers(currentUser?.role) && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-900">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">২. ইউজার ও মেম্বারের পাসওয়ার্ড পরিবর্তন</h3>
                    <p className="text-[11px] text-slate-500">মেম্বার বা স্টাফের পাসওয়ার্ড ভুলে গেলে অ্যাডমিন হিসেবে সরাসরি নতুন পাসওয়ার্ড সেট করুন</p>
                  </div>
                </div>

                <form onSubmit={handleQuickResetUserPassword} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ব্যবহারকারী বা মেম্বার নির্বাচন করুন *
                    </label>
                    <select
                      value={selectedUserForReset}
                      onChange={(e) => setSelectedUserForReset(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">-- ব্যবহারকারী নির্বাচন করুন --</option>
                      {usersList.map(u => (
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
                    <span>অ্যাডমিন হিসেবে পাসওয়ার্ড পরিবর্তনের সাথে সাথে মেম্বার/স্টাফ এই নতুন পাসওয়ার্ড দিয়ে সিস্টেমে প্রবেশ করতে পারবেন।</span>
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

      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowIssueModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-600" />
              <span>সদস্যকে নতুন বই ইস্যু করুন</span>
            </h2>

            <form onSubmit={handleIssueBookSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">ইস্যু করার জন্য বই নির্বাচন করুন *</label>
                <select
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="">-- বই সিলেক্ট করুন --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                      {b.title} - {b.author} (খালি কপি: {b.availableCopies}/{b.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">গ্রাহক / সদস্য নির্বাচন করুন *</label>
                <select
                  value={issueUserId}
                  onChange={(e) => setIssueUserId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="">-- সদস্য সিলেক্ট করুন --</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (ID: {u.memberId || u.memberCardId || 'MEMBER'}, {u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ইস্যুর মেয়াদ (দিন)</label>
                <select
                  value={issueDays}
                  onChange={(e) => setIssueDays(parseInt(e.target.value) || 14)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value={7}>৭ দিন (১ সপ্তাহ)</option>
                  <option value={14}>১৪ দিন (২ সপ্তাহ)</option>
                  <option value={21}>২১ দিন (৩ সপ্তাহ)</option>
                  <option value={30}>৩০ দিন (১ মাস)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowIssueModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">
                  বাতিল
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ইস্যু নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowBookModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>{editingBook ? 'বইয়ের তথ্য সম্পাদনা' : 'নতুন বই সংযোজন'}</span>
            </h2>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              <ImageInputPicker
                value={coverUrl}
                onChange={setCoverUrl}
                label="বইয়ের প্রচ্ছদ / কভার ফটো (Cover Photo)"
                helpText="সরাসরি ডিভাইস থেকে প্রচ্ছদ ছবি আপলোড করুন অথবা ছবি লিংক পেস্ট করুন"
                aspectRatio="cover"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">বইয়ের নাম *</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">লেখকের নাম *</label>
                  <input type="text" required value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">প্রকাশক *</label>
                  <input type="text" required value={publisher} onChange={(e) => setPublisher(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as BookCategory)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option value="Novel">উপন্যাস</option>
                    <option value="Poetry">কবিতা</option>
                    <option value="History">ইতিহাস</option>
                    <option value="Liberation War">মুক্তিযুদ্ধ</option>
                    <option value="Science">বিজ্ঞান</option>
                    <option value="Religion">ধর্ম ও দর্শন</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">কপি সংখ্যা</label>
                  <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowBookModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5"><Save className="w-4 h-4" /><span>সংরক্ষণ করুন</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDigitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowDigitalModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{editingDigitalBook ? 'ই-বুক তথ্য সম্পাদনা' : 'নতুন ডিজিটাল ই-বুক সংযোজন ও ক্যাটালগ সংরক্ষণ'}</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                পিডিএফ লিংক বাধ্যতামূলক নয়। শুধুমাত্র বইয়ের নাম, লেখক ও বিবরণ লিখেও লাইব্রেরিতে ক্যাটালগ সংরক্ষণ (Store) করে রাখতে পারবেন।
              </p>
            </div>

            <form onSubmit={handleSaveDigital} className="space-y-4 text-xs">
              <ImageInputPicker
                value={dCover}
                onChange={setDCover}
                label="ই-বুক কভার ফটো (Cover Upload / URL)"
                helpText="ডিভাইস থেকে কভার ফটো আপলোড করুন অথবা ফটো লিংক লিখুন"
                aspectRatio="cover"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ই-বুক নাম *</label>
                  <input type="text" required value={dTitle} onChange={(e) => setDTitle(e.target.value)} placeholder="বইয়ের নাম লিখুন" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">লেখকের নাম *</label>
                  <input type="text" required value={dAuthor} onChange={(e) => setDAuthor(e.target.value)} placeholder="লেখকের নাম লিখুন" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select value={dCategory} onChange={(e) => setDCategory(e.target.value as BookCategory)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value="Novel">উপন্যাস (Novel)</option>
                    <option value="Story">গল্প (Story)</option>
                    <option value="Science">বিজ্ঞান (Science)</option>
                    <option value="Technology">প্রযুক্তি (Technology)</option>
                    <option value="History">ইতিহাস (History)</option>
                    <option value="Liberation War">মুক্তিযুদ্ধ (Liberation War)</option>
                    <option value="Religion">ধর্মীয় (Religion)</option>
                    <option value="Children">শিশু-কিশোর (Children)</option>
                    <option value="Literature">সাহিত্য (Literature)</option>
                    <option value="Agriculture">কৃষি (Agriculture)</option>
                    <option value="Computer Science">কম্পিউটার সায়েন্স (CS)</option>
                    <option value="Programming">প্রোগ্রামিং (Programming)</option>
                    <option value="AI">কৃত্রিম বুদ্ধিমত্তা (AI)</option>
                    <option value="Reference">রেফারেন্স (Reference)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">মোট পৃষ্ঠা সংখ্যা</label>
                  <input type="number" min={1} value={dPageCount} onChange={(e) => setDPageCount(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    পিডিএফ / ই-বুক ফাইল লিংক <span className="text-emerald-600 dark:text-emerald-400 font-normal">(ঐচ্ছিক — বাধ্যতামূলক নয়)</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold">
                    Optional / খালি রাখা যাবে
                  </span>
                </div>
                <input
                  type="text"
                  value={dFileUrl}
                  onChange={(e) => setDFileUrl(e.target.value)}
                  placeholder="গুগল ড্রাইভ লিংক, ড্রপবক্স লিংক বা সরাসরি PDF ডাউনলোড লিংক (না থাকলে খালি রাখুন)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>✓ লিংক না দিলেও বইটি লাইব্রেরির ক্যাটালগে সফলভাবে সংরক্ষিত (Store) থাকবে।</span>
                  {dFileUrl && (
                    <button
                      type="button"
                      onClick={() => setDFileUrl('')}
                      className="text-rose-500 hover:underline font-medium text-[10px] self-start sm:self-auto"
                    >
                      লিংক পরিষ্কার করুন
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-blue-100 dark:border-blue-900/60">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    অথবা ডিভাইস থেকে সরাসরি পিডিএফ/ই-বুক ফাইল আপলোড (ঐচ্ছিক)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.epub,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 15 * 1024 * 1024) {
                          showToast('১৫ মেগাবাইটের কম সাইজের ফাইল নির্বাচন করুন', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setDFileUrl(result);
                          setDSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                          showToast(`"${file.name}" ফাইলটি যুক্ত হয়েছে`, 'success');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-[11px] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 text-slate-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বইয়ের বিবরণ / সূচিপত্র (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={dDescription}
                  onChange={(e) => setDDescription(e.target.value)}
                  placeholder="বইটি সম্পর্কে বিবরণ..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">নমুনা টেক্সট / সারাংশ (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={dSampleContent}
                  onChange={(e) => setDSampleContent(e.target.value)}
                  placeholder="পাঠকদের জন্য বইটির কিছু প্রাথমিক টেক্সট বা সারাংশ..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-serif text-[11px]"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowDigitalModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5"><Save className="w-4 h-4" /><span>{editingDigitalBook ? 'আপডেট করুন' : 'সংরক্ষণ করুন (Store)'}</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDonorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowDonorModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{editingDonor ? 'দাতা সদস্যের তথ্য সম্পাদনা' : 'নতুন দাতা সদস্য সংযোজন'}</span>
            </h2>

            <form onSubmit={handleSaveDonor} className="space-y-4 text-xs">
              <ImageInputPicker
                value={donorPhoto}
                onChange={setDonorPhoto}
                label="দাতা সদস্যের ফটো (Upload / URL)"
                helpText="ডিভাইস ফাইল নির্বাচন করুন অথবা ইমেজ ইউআরএল পেস্ট করুন"
                aspectRatio="avatar"
              />

              <div>
                <label className="block font-semibold mb-1">পূর্ণ নাম *</label>
                <input type="text" required value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">পদবি</label>
                  <input type="text" value={donorDesig} onChange={(e) => setDonorDesig(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select value={donorCat} onChange={(e) => setDonorCat(e.target.value as DonorMember['donorCategory'])} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value="Chief Sponsor">প্রধান পৃষ্ঠপোষক</option>
                    <option value="Patron">পৃষ্ঠপোষক</option>
                    <option value="Life Member">আজীবন সদস্য</option>
                    <option value="Donor Member">দাতা সদস্য</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিশেষ অবদান</label>
                <textarea rows={2} value={donorContrib} onChange={(e) => setDonorContrib(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowDonorModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5"><Save className="w-4 h-4" /><span>সংরক্ষণ করুন</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowNoticeModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              <span>{editingNotice ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ প্রকাশ'}</span>
            </h2>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">নোটিশের বিষয় / শিরোনাম *</label>
                <input type="text" required value={nTitle} onChange={(e) => setNTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>

              <div>
                <label className="block font-semibold mb-1">নোটিশের বিবরণ *</label>
                <textarea rows={4} required value={nContent} onChange={(e) => setNContent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowNoticeModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5"><Save className="w-4 h-4" /><span>প্রকাশ করুন</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowGalleryModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span>{editingGallery ? 'গ্যালারি ছবি সম্পাদনা' : 'গ্যালারিতে নতুন ছবি সংযোজন'}</span>
            </h2>

            <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
              <ImageInputPicker
                value={gUrl}
                onChange={setGUrl}
                label="গ্যালারির ছবি (Device Upload / Image URL)"
                helpText="সরাসরি ফোন/কম্পিউটার থেকে আপলোড করুন বা লিংক পেস্ট করুন"
                aspectRatio="square"
              />

              <div>
                <label className="block font-semibold mb-1">ছবি শিরোনাম *</label>
                <input type="text" required value={gTitle} onChange={(e) => setGTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5"><Save className="w-4 h-4" /><span>সংরক্ষণ করুন</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {editingUser && (
        <AdminEditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updatedUser) => {
            setUsersList(storage.getUsers());
          }}
        />
      )}
    </div>
  );
};

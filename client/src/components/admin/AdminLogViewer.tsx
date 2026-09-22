import React, { useState, useMemo } from 'react';
import { SystemLog, LogCategory, LogSeverity } from '../../types';
import { storage } from '../../lib/storage';
import { useToast } from '../common/Toast';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  FileText, 
  Database, 
  UserCheck, 
  Lock, 
  Clock, 
  ArrowUpDown, 
  ChevronRight,
  Code,
  X,
  Calendar,
  Globe,
  Monitor
} from 'lucide-react';

export const AdminLogViewer: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<SystemLog[]>(() => storage.getSystemLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<SystemLog | null>(null);

  const refreshLogs = () => {
    setLogs(storage.getSystemLogs());
    showToast('লগ ডাটা সফলভাবে রিফ্রেশ করা হয়েছে', 'info');
  };

  const handleClearLogs = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল সিস্টেম অ্যাক্টিভিটি লগ মুছে ফেলতে চান? এই অ্যাকশনটি অপরিবর্তনযোগ্য।')) {
      storage.clearSystemLogs();
      setLogs([]);
      showToast('সকল সিস্টেম লগ মুছে ফেলা হয়েছে', 'success');
    }
  };

  const handleExportCSV = () => {
    storage.exportLogsAsCSV();
    showToast('সিস্টেম লগ CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'success');
  };

  const handleExportJSON = () => {
    storage.exportLogsAsJSON();
    showToast('সিস্টেম লগ JSON ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'success');
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
        const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
        
        const q = searchTerm.toLowerCase();
        const matchesSearch = 
          !q ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          (log.actor.name && log.actor.name.toLowerCase().includes(q)) ||
          (log.actor.email && log.actor.email.toLowerCase().includes(q)) ||
          (log.actor.role && log.actor.role.toLowerCase().includes(q)) ||
          (log.ipAddress && log.ipAddress.toLowerCase().includes(q));

        return matchesCategory && matchesSeverity && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, searchTerm, selectedCategory, selectedSeverity, sortOrder]);

  const totalCount = logs.length;
  const authCount = logs.filter(l => l.category === 'AUTH').length;
  const securityCount = logs.filter(l => l.category === 'SECURITY' || l.severity === 'DANGER' || l.severity === 'WARNING').length;
  const circulationCount = logs.filter(l => l.category === 'BOOK_CIRCULATION' || l.category === 'CATALOG').length;

  const getSeverityBadge = (sev: LogSeverity) => {
    switch (sev) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সফল (SUCCESS)</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>সতর্কতা (WARNING)</span>
          </span>
        );
      case 'DANGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>বিপদজনক (DANGER)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Info className="w-3.5 h-3.5" />
            <span>তথ্য (INFO)</span>
          </span>
        );
    }
  };

  const getCategoryColor = (cat: LogCategory) => {
    switch (cat) {
      case 'AUTH':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'SECURITY':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'BOOK_CIRCULATION':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'CATALOG':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'USER_MANAGEMENT':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'DONATION':
        return 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>সিস্টেম অডিট ও অ্যাক্টিভিটি লগ (Audit Logs)</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ব্যবহারকারীর লগইন, পাসওয়ার্ড পরিবর্তন, বই ইস্যু-রিটার্ন ও প্রশাসনিক কর্মকাণ্ডের সার্বক্ষণিক রেকর্ড
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={refreshLogs}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-600 transition-colors flex items-center gap-1.5 shadow-xs"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl border border-emerald-500 transition-colors flex items-center gap-1.5 shadow-xs"
              title="CSV রিপোর্ট ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span>CSV ডাউনলোড</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl border border-blue-500 transition-colors flex items-center gap-1.5 shadow-xs"
              title="JSON ব্যাকআপ ফাইল"
            >
              <Database className="w-4 h-4" />
              <span>JSON এক্সপোর্ট</span>
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-semibold text-xs rounded-xl border border-rose-700 transition-colors flex items-center gap-1.5 shadow-xs"
              title="লগ হিস্ট্রি পরিষ্কার করুন"
            >
              <Trash2 className="w-4 h-4" />
              <span>লগ মুছুন</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">মোট সংরক্ষিত লগ</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-emerald-400">{totalCount}</span>
              <span className="text-[10px] text-slate-400">সর্বশেষ ১০০০ এন্ট্রি</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">অথেনটিকেশন ও সেশন</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-blue-400">{authCount}</span>
              <span className="text-[10px] text-slate-400">লগইন / পাসওয়ার্ড</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">নিরাপত্তা ও সতর্কতা</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-rose-400">{securityCount}</span>
              <span className="text-[10px] text-slate-400">ব্যর্থ চেষ্টা / সতর্কবার্তা</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">লাইব্রেরি ইস্যু ও বই</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-amber-400">{circulationCount}</span>
              <span className="text-[10px] text-slate-400">সার্কুলেশন অপারেশন</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="লগ খুঁজুন (অ্যাকশন, ব্যবহারকারীর নাম, ইমেইল, বিস্তারিত, আইপি)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="ALL">সকল ক্যাটাগরি (All Categories)</option>
              <option value="AUTH">AUTH (লগইন ও পাসওয়ার্ড)</option>
              <option value="USER_MANAGEMENT">USER_MANAGEMENT (সদস্য ব্যবস্থাপনা)</option>
              <option value="BOOK_CIRCULATION">BOOK_CIRCULATION (বই ইস্যু ও জমা)</option>
              <option value="CATALOG">CATALOG (বই ও ই-বুক ক্যাটালগ)</option>
              <option value="SECURITY">SECURITY (নিরাপত্তা ও সতর্কতা)</option>
              <option value="SYSTEM">SYSTEM (সিস্টেম ও ব্যাকআপ)</option>
              <option value="DONATION">DONATION (অনুদান ও দাতা)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="ALL">সকল তীব্রতা (All Severities)</option>
              <option value="SUCCESS">SUCCESS (সফল কর্মকাণ্ড)</option>
              <option value="INFO">INFO (সাধারণ তথ্য)</option>
              <option value="WARNING">WARNING (সতর্কতামূলক)</option>
              <option value="DANGER">DANGER (গুরুত্বপূর্ণ / ত্রুটি)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>মোট পাওয়া গেছে: <strong className="text-slate-900 dark:text-white">{filteredLogs.length}</strong> টি লগ রেকর্ড</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>সময় অনুযায়ী: {sortOrder === 'desc' ? 'নতুনগুলো আগে' : 'পুরাতনগুলো আগে'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">কোনো লগ রেকর্ড পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">আপনার ফিল্টার বা সার্চ কি-ওয়ার্ড পরিবর্তন করে আবার দেখুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">সময় ও তারিখ</th>
                  <th className="p-4">অ্যাকশন ও বিভাগ</th>
                  <th className="p-4">তীব্রতা</th>
                  <th className="p-4">ব্যবহারকারী / সম্পাদনকারী</th>
                  <th className="p-4">কার্যবিবরণী (Details)</th>
                  <th className="p-4 text-right">বিস্তারিত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{formattedTime}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-mono font-bold text-[11px] text-slate-900 dark:text-white">
                          {log.action}
                        </div>
                        <span className={`inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-bold border ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{log.actor.name || 'সিস্টেম / অজ্ঞাত'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {log.actor.email || 'N/A'} • <span className="text-amber-600 dark:text-amber-400 font-bold">{log.actor.role}</span>
                        </div>
                      </td>

                      <td className="p-4 max-w-md">
                        <p className="text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed font-medium">
                          {log.details}
                        </p>
                        {log.ipAddress && (
                          <span className="text-[10px] text-slate-400 font-mono mt-1 inline-flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" /> IP: {log.ipAddress}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogForDetails(log)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Code className="w-3.5 h-3.5 text-emerald-600" />
                          <span>মেটাডাটা</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Code className="w-5 h-5 text-emerald-600" />
                <span>লগ বিবরণ ও অডিট মেটাডাটা (Raw Event Payload)</span>
              </div>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">অ্যাকশন:</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400">{selectedLogForDetails.action}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">বিভাগ ও তীব্রতা:</span>
                  <strong>{selectedLogForDetails.category} ({selectedLogForDetails.severity})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">সময়:</span>
                  <strong className="font-mono">{new Date(selectedLogForDetails.timestamp).toISOString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">সম্পাদনকারী:</span>
                  <strong>{selectedLogForDetails.actor.name} ({selectedLogForDetails.actor.email})</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ঘটনার পূর্ণাঙ্গ বিবরণ:
                </label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-medium">
                  {selectedLogForDetails.details}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সম্পূর্ণ JSON পে-লোড ও ক্লায়েন্ট এনভায়রনমেন্ট:
                </label>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                  {JSON.stringify(selectedLogForDetails, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

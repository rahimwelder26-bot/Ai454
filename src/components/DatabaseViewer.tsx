import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  Download, 
  RefreshCw, 
  Layers, 
  Users, 
  PhoneCall, 
  Wifi, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  HardDrive 
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const DatabaseViewer: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTable, setActiveTable] = useState<'apps' | 'users' | 'callers' | 'network' | 'audit'>('apps');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDatabase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/database/records');
      const dbData = await res.json();
      setData(dbData);

      const logsRes = await fetch('/api/audit-logs');
      const logsData = await logsRes.json();
      if (logsData.logs) setAuditLogs(logsData.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  const handleDownloadBackup = () => {
    soundFx.playBeep(950, 0.1);
    window.open('/api/database/download-backup', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 p-6 sm:p-8 glow-cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
              <Cloud className="w-3.5 h-3.5 animate-pulse" />
              <span>গুগল ক্লাউড লিঙ্কড অটোনোমাস ইঞ্জিন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বয়ংক্রিয় অটোনোমাস ডাটাবেজ কোর
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              এই অ্যাপের নিজস্ব ডাটাবেজ গুগলের সাথে সরাসরি কানেক্টেড এবং সম্পূর্ণ স্বয়ংক্রিয়ভাবে ডেটা সংরক্ষণ, ব্যাকআপ, সিঙ্ক ও ইনডেক্সিং হ্যান্ডেল করে।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-cyan-950 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>ডাটাবেজ ব্যাকআপ ডাউনলোড (JSON)</span>
            </button>
            <button
              onClick={fetchDatabase}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Database Vital Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" /> গুগল ক্লাউড লিংক
          </span>
          <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> আনলিমিটেড কানেক্টেড
          </p>
          <span className="text-[10px] text-slate-400 font-mono block">Gemini 3.8 Flash ইন্টিগ্রেটেড</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" /> স্টোরেজ ইঞ্জিন
          </span>
          <p className="text-sm font-bold text-white">Autonomous JSON Document</p>
          <span className="text-[10px] text-cyan-400 font-mono block">স্বয়ংক্রিয় ট্রানজেকশন সিঙ্ক</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" /> ডাটাবেজ ফাইল সাইজ
          </span>
          <p className="text-sm font-bold text-white font-mono">{data?.stats?.dbFileSizeKb || 12} KB</p>
          <span className="text-[10px] text-slate-500 font-mono block">হাই-স্পিড ইন-মেমরি ক্যাশ</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> অটো-হ্যান্ডলিং স্থিতি
          </span>
          <p className="text-sm font-bold text-emerald-400">100% স্বয়ংক্রিয়</p>
          <span className="text-[10px] text-slate-400 font-mono block">জিরো-মেইনটেন্যান্স প্রটোকল</span>
        </div>
      </div>

      {/* Table Navigation and Records Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Table selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800 pb-3">
          {[
            { id: 'apps', label: 'অ্যাপ্লিকেশন তালিকা (Apps)', count: data?.tables?.apps || 0, icon: Layers },
            { id: 'users', label: 'ব্যবহারকারী রেজিস্ট্রি (Users)', count: data?.tables?.users || 0, icon: Users },
            { id: 'callers', label: 'কলার হিস্ট্রি (Callers)', count: data?.tables?.callerHistory || 0, icon: PhoneCall },
            { id: 'network', label: 'নেটওয়ার্ক ডিভাইস (Devices)', count: data?.tables?.networkDevices || 0, icon: Wifi },
            { id: 'audit', label: 'অডিট লগ (Audit Logs)', count: auditLogs.length, icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTable === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTable(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content of selected table */}
        <div className="overflow-x-auto">
          {activeTable === 'apps' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3">আইডি</th>
                  <th className="pb-3">টাইটেল</th>
                  <th className="pb-3">ক্যাটাগরি</th>
                  <th className="pb-3">তৈরির তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data?.sampleData?.appsSummary?.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-850/40">
                    <td className="py-2.5 font-mono text-cyan-400">{app.id}</td>
                    <td className="py-2.5 font-bold text-white">{app.title}</td>
                    <td className="py-2.5 uppercase text-[10px] font-mono text-purple-400">{app.category}</td>
                    <td className="py-2.5 text-slate-400 font-mono">{new Date(app.createdAt).toLocaleString('bn-BD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'users' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3">নাম</th>
                  <th className="pb-3">জিমেইল</th>
                  <th className="pb-3">ভূমিকা</th>
                  <th className="pb-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data?.sampleData?.usersSummary?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-850/40">
                    <td className="py-2.5 font-bold text-white">{u.name}</td>
                    <td className="py-2.5 text-cyan-300 font-mono">{u.email}</td>
                    <td className="py-2.5 font-mono text-[10px] text-purple-400 uppercase">{u.role}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'callers' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3">নম্বর</th>
                  <th className="pb-3">শনাক্ত নাম</th>
                  <th className="pb-3">লোকেশন</th>
                  <th className="pb-3">অপারেটর</th>
                  <th className="pb-3">ঝুঁকি স্তর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data?.sampleData?.callerHistory?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-850/40">
                    <td className="py-2.5 text-cyan-400 font-mono font-bold">{c.phoneNumber}</td>
                    <td className="py-2.5 font-bold text-white">{c.name}</td>
                    <td className="py-2.5 text-slate-300">{c.location}</td>
                    <td className="py-2.5 text-slate-400">{c.carrier}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{c.riskLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'network' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3">হোস্টনেম</th>
                  <th className="pb-3">আইপি</th>
                  <th className="pb-3">ম্যাক</th>
                  <th className="pb-3">সিগন্যাল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data?.sampleData?.networkDevices?.map((d: any) => (
                  <tr key={d.mac} className="hover:bg-slate-850/40">
                    <td className="py-2.5 font-bold text-white">{d.hostname}</td>
                    <td className="py-2.5 text-cyan-300 font-mono">{d.ip}</td>
                    <td className="py-2.5 text-slate-500 font-mono text-[10px]">{d.mac}</td>
                    <td className="py-2.5 text-emerald-400 font-mono">{d.signalStrength}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'audit' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3">সময়</th>
                  <th className="pb-3">একশন</th>
                  <th className="pb-3">অ্যাক্টর</th>
                  <th className="pb-3">বিবরণ</th>
                  <th className="pb-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-850/40">
                    <td className="py-2 text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString('bn-BD')}
                    </td>
                    <td className="py-2 font-bold text-white">{log.action}</td>
                    <td className="py-2 text-cyan-300 font-mono text-[11px]">{log.actor}</td>
                    <td className="py-2 text-slate-300 max-w-xs truncate">{log.details}</td>
                    <td className="py-2">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        log.status === 'success' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

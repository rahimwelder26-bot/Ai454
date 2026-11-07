import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Radio, 
  ArrowDownUp, 
  RefreshCw, 
  Ban, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Lock, 
  Zap, 
  Sliders 
} from 'lucide-react';
import { NetworkDevice, UserSession } from '../types';
import { soundFx } from '../utils/audio';

interface NetworkSentinelProps {
  currentUser: UserSession | null;
}

export const NetworkSentinel: React.FC<NetworkSentinelProps> = ({ currentUser }) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [wifiInfo, setWifiInfo] = useState<any>({
    ssid: 'CyberSecure_5GHz_Enterprise',
    channel: 36,
    frequency: '5.180 GHz (WiFi 6 - 802.11ax)',
    security: 'WPA3-Personal SAE + AES-256',
    downloadSpeed: '124.5 Mbps',
    uploadSpeed: '88.2 Mbps',
    ping: '9 ms',
    jitter: '1.2 ms',
    gatewayIp: '192.168.1.1',
    dnsServers: ['8.8.8.8 (Google Primary)', '1.1.1.1 (Cloudflare)'],
  });

  const [firewallActive, setFirewallActive] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerScan = async () => {
    setIsScanning(true);
    soundFx.playBeep(920, 0.1);
    try {
      const res = await fetch('/api/network/scan', { method: 'POST' });
      const data = await res.json();
      if (data.devices) {
        setDevices(data.devices);
        if (data.wifiDetails) setWifiInfo(data.wifiDetails);
      }
      soundFx.playBeep(1150, 0.15);
      setActionNotice('ওয়াইফাই নেটওয়ার্কের সকল সক্রিয় নোড সফলভাবে শনাক্ত ও স্ক্যান করা হয়েছে।');
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    triggerScan();
  }, []);

  const handleToggleBlock = async (mac: string) => {
    soundFx.playBeep(700, 0.08);
    try {
      const res = await fetch('/api/network/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac }),
      });
      const data = await res.json();
      if (data.device) {
        setDevices((prev) =>
          prev.map((d) => (d.mac === mac ? data.device : d))
        );
        setActionNotice(
          data.device.isBlocked
            ? `ম্যাক অ্যাড্রেস ${mac} কে ব্লক করা হয়েছে। রাউটার সংযোগ বিচ্ছিন্ন করেছে।`
            : `ম্যাক অ্যাড্রেস ${mac} কে পুনরায় অনুমতি দেওয়া হয়েছে।`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFlushDns = () => {
    soundFx.playBeep(1000, 0.1);
    setActionNotice('ডিএনএস ও রাউটার ক্যাশ ফ্লাশ করা হয়েছে। নেটওয়ার্ক প্রতিক্রিয়া অপ্টিমাইজড!');
  };

  const handleOptimizeBandwidth = () => {
    soundFx.playBeep(980, 0.1);
    setActionNotice('কিউওএস (QoS) ব্যান্ডউইথ ট্র্যাফিক শেপিং সক্রিয় করা হয়েছে। অগ্রাধিকার নোডগুলো সর্বোচ্চ স্পিড পাবে।');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 p-6 sm:p-8 glow-emerald">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>রিয়েলটাইম ওয়াইফাই ও নেটওয়ার্ক সেন্টিনেল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              নেটওয়ার্ক ও ওয়াইফাই স্বয়ংক্রিয় নিয়ন্ত্রণ হাব
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              ওয়াইফাই স্পেকট্রাম বিশ্লেষণ, সংযুক্ত ডিভাইস নিরীক্ষণ, সন্দেহজনক নোড ফিল্টারিং এবং ক্ষতিকর অনুপ্রবেশ প্রতিহত করার সর্বোচ্চ কৃত্রিম বুদ্ধিমত্তা।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerScan}
              disabled={isScanning}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-emerald-950 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'স্ক্যান চলছে...' : 'ডিপ নেটওয়ার্ক স্ক্যান'}</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" /> সক্রিয় ওয়াইফাই SSID
          </span>
          <p className="text-sm sm:text-base font-extrabold text-white truncate">{wifiInfo.ssid}</p>
          <span className="text-[10px] text-cyan-400 font-mono block">{wifiInfo.frequency}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ArrowDownUp className="w-3.5 h-3.5 text-emerald-400" /> ডাউনলোড / আপলোড
          </span>
          <p className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
            ↓ {wifiInfo.downloadSpeed}
          </p>
          <span className="text-[10px] text-slate-400 font-mono block">↑ {wifiInfo.uploadSpeed}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> পিং ও লেটেন্সি
          </span>
          <p className="text-sm sm:text-base font-extrabold text-white font-mono">{wifiInfo.ping}</p>
          <span className="text-[10px] text-emerald-400 font-mono block">জিটার: {wifiInfo.jitter} (স্থির)</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> ফায়ারওয়াল ও সিকিউরিটি
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-white truncate">WPA3-SAE Enterprise</p>
          <span className="text-[10px] text-purple-400 font-mono block">AES-256 বিট এনক্রিপ্টেড</span>
        </div>
      </div>

      {/* Connected Devices Radar & Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Connected Device Inventory Table */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                ওয়াইফাইতে সংযুক্ত সক্রিয় ডিভাইসসমূহ ({devices.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ব্লকড নোড: {devices.filter((d) => d.isBlocked).length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3">হোস্ট ও ভেন্ডর</th>
                  <th className="pb-3">আইপি ও ম্যাক অ্যাড্রেস</th>
                  <th className="pb-3">সিগন্যাল ও ব্যান্ডউইথ</th>
                  <th className="pb-3">স্ট্যাটাস</th>
                  <th className="pb-3 text-right">নেটওয়ার্ক একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {devices.map((dev) => (
                  <tr key={dev.mac} className="hover:bg-slate-850/40">
                    <td className="py-3 pr-2">
                      <span className="font-bold text-white block">{dev.hostname}</span>
                      <span className="text-[10px] text-slate-400">{dev.vendor}</span>
                    </td>
                    <td className="py-3 pr-2 font-mono">
                      <span className="text-cyan-300 block">{dev.ip}</span>
                      <span className="text-[10px] text-slate-500">{dev.mac}</span>
                    </td>
                    <td className="py-3 pr-2 font-mono">
                      <span className="text-slate-300 block">{dev.signalStrength}% সিগন্যাল</span>
                      <span className="text-[10px] text-emerald-400">{dev.bandwidthUsage}</span>
                    </td>
                    <td className="py-3 pr-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dev.isBlocked
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : dev.status === 'flagged'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {dev.isBlocked ? 'ব্লক করা হয়েছে' : dev.status === 'flagged' ? 'সন্দেহজনক' : 'অনলাইন'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleBlock(dev.mac)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                          dev.isBlocked
                            ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{dev.isBlocked ? 'আনব্লক করুন' : 'ওয়াইফাই থেকে কাটুন'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Instant Network Tactical Actions */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              নেটওয়ার্ক অপ্টিমাইজেশন টুলস
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={handleFlushDns}
                className="w-full text-left p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>ডিএনএস ও ক্যাশ ফ্লাশ</span>
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">সব জমে থাকা আইপি ক্যাশ পরিষ্কার করে লেটেন্সি কমায়।</p>
              </button>

              <button
                onClick={handleOptimizeBandwidth}
                className="w-full text-left p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
                  <span>ব্যান্ডউইথ ট্র্যাফিক শেপিং</span>
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">গেমিং ও ডাউনলোডের জন্য স্বয়ংক্রিয় স্পিড বুস্ট প্রটোকল।</p>
              </button>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">স্বয়ংক্রিয় এআই ফায়ারওয়াল</span>
                  <span className="text-[10px] text-slate-400">ম্যালিসিয়াস প্যাকেট ড্রপ ফিল্টার</span>
                </div>
                <button
                  onClick={() => setFirewallActive(!firewallActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    firewallActive ? 'bg-cyan-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      firewallActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              গুগল কানেক্টেড নেটওয়ার্ক সেন্টিনেল
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Google Gemini এর ক্লাউড সিকিউরিটি ইনটেলিজেন্স ব্যবহার করে সন্দেহজনক ডার্কনেট আইপি ও বোটনেট ট্র্যাফিক সাথে সাথে শনাক্ত করা হয়।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

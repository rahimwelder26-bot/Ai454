import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Battery, 
  BatteryCharging, 
  Cpu, 
  HardDrive, 
  Flashlight, 
  BellOff, 
  Lock, 
  Unlock, 
  Volume2, 
  AlertOctagon, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Sliders 
} from 'lucide-react';
import { DeviceTelemetry, UserSession } from '../types';
import { soundFx } from '../utils/audio';

interface DeviceControllerProps {
  currentUser: UserSession | null;
}

export const DeviceController: React.FC<DeviceControllerProps> = ({ currentUser }) => {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    deviceName: 'Omni Sentinel Smartphone Host',
    osVersion: 'Android 15 (Security Patch Nov 2026)',
    batteryLevel: 87,
    batteryCharging: false,
    powerSaverMode: false,
    cpuUsage: 14,
    memoryUsage: 42,
    storageFreeGb: 184,
    storageTotalGb: 256,
    wifiSsid: 'CyberSecure_5GHz_Enterprise',
    wifiConnected: true,
    cellularSignal: 4,
    flashlightOn: false,
    dndMode: false,
    deviceLocked: false,
    alarmActive: false,
    lastSync: new Date().toISOString(),
  });

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/device/telemetry');
      const data = await res.json();
      if (data.telemetry) setTelemetry(data.telemetry);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const sendDeviceCommand = async (action: string) => {
    setLoadingAction(action);
    soundFx.playBeep(850, 0.08);

    try {
      const res = await fetch('/api/device/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.telemetry) {
        setTelemetry(data.telemetry);

        if (action === 'trigger_alarm') {
          soundFx.startSiren();
          setActionMessage('জরুরি উচ্চ ডেসিবেল সাইরেন চালু করা হয়েছে!');
        } else if (action === 'stop_alarm') {
          soundFx.stopSiren();
          setActionMessage('সাইরেন বন্ধ করা হয়েছে।');
        } else if (action === 'toggle_flashlight') {
          setActionMessage(`ফোনের ফ্ল্যাশলাইট ${data.telemetry.flashlightOn ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
        } else if (action === 'clean_ram') {
          setActionMessage('মেমোরি অপ্টিমাইজেশন সম্পন্ন! ১.৪ জিবি ব্যাকগ্রাউন্ড ক্যাশ মুক্ত করা হয়েছে।');
        } else if (action === 'toggle_battery_saver') {
          setActionMessage(`ব্যাটারি সেভার মোড ${data.telemetry.powerSaverMode ? 'সক্রিয়' : 'নিষ্ক্রিয়'}।`);
        } else if (action === 'lock_device') {
          setActionMessage('ফোন রিমোটলি সম্পূর্ণ লক করা হয়েছে।');
        } else if (action === 'unlock_device') {
          setActionMessage('ফোন আনলক করা হয়েছে।');
        } else if (action === 'toggle_dnd') {
          setActionMessage(`DND মোড ${data.telemetry.dndMode ? 'সক্রিয়' : 'নিষ্ক্রিয়'}।`);
        }
      }
      soundFx.playBeep(1100, 0.1);
    } catch (e: any) {
      soundFx.playBeep(300, 0.2);
      alert(`কমান্ড ব্যর্থ: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`rounded-3xl border p-6 sm:p-8 transition-all ${
        telemetry.alarmActive
          ? 'bg-rose-950/60 border-rose-500 glow-rose animate-pulse'
          : 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-purple-500/30 glow-violet'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              <span>রিমোট ডিভাইস ওএস কন্ট্রোলার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              সম্পূর্ণ ফোন অটোমেশন ও রিমোট নিয়ন্ত্রণ
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              আপনার পুরো ফোনটি এআই দিয়ে নিয়ন্ত্রণ করুন—ব্যাটারি সেভিং, র‍্যাম ক্লিনিং, টর্চলাইট, সাইরেন এলার্ম, ডু-নট-ডিস্টার্ব এবং রিমোট লক সহ সবকিছু কেন্দ্রীয় কমান্ডে পরিচালিত।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTelemetry}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>সিঙ্ক রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-purple-300 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Realtime Device Telemetry Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
        {/* Battery */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Battery className="w-4 h-4 text-emerald-400" /> ব্যাটারি লেভেল
            </span>
            <span className="font-mono text-emerald-400 font-bold">{telemetry.batteryLevel}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${telemetry.batteryLevel}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {telemetry.powerSaverMode ? 'পাওয়ার সেভার সক্রিয়' : 'স্বাভাবিক ডিসচার্জ'}
          </span>
        </div>

        {/* CPU */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-4 h-4 text-cyan-400" /> CPU ব্যবহার
            </span>
            <span className="font-mono text-cyan-400 font-bold">{telemetry.cpuUsage}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${telemetry.cpuUsage}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">অক্টাকোর প্রসেসর সুস্থির</span>
        </div>

        {/* RAM */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-4 h-4 text-purple-400" /> RAM মেমোরি
            </span>
            <span className="font-mono text-purple-400 font-bold">{telemetry.memoryUsage}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${telemetry.memoryUsage}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">৫.২ জিবি ফ্রি / ১২ জিবি</span>
        </div>

        {/* Storage */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <HardDrive className="w-4 h-4 text-amber-400" /> স্টোরেজ ফ্রি
            </span>
            <span className="font-mono text-amber-400 font-bold">{telemetry.storageFreeGb} GB</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.round(((telemetry.storageTotalGb - telemetry.storageFreeGb) / telemetry.storageTotalGb) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">মোট {telemetry.storageTotalGb} জিবি UFS 4.0</span>
        </div>
      </div>

      {/* Tactical Remote Control Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Flashlight */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flashlight className={`w-5 h-5 ${telemetry.flashlightOn ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <h4 className="font-bold text-sm text-white">টর্চলাইট / ফ্ল্যাশলাইট</h4>
            </div>
            <p className="text-xs text-slate-400">
              ফোনের পেছনের LED ফ্ল্যাশ {telemetry.flashlightOn ? 'জ্বলছে' : 'বন্ধ রয়েছে'}
            </p>
          </div>
          <button
            onClick={() => sendDeviceCommand('toggle_flashlight')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              telemetry.flashlightOn
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {telemetry.flashlightOn ? 'বন্ধ করুন' : 'চালু করুন'}
          </button>
        </div>

        {/* Battery Saver */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className={`w-5 h-5 ${telemetry.powerSaverMode ? 'text-emerald-400' : 'text-slate-400'}`} />
              <h4 className="font-bold text-sm text-white">পাওয়ার সেভার মোড</h4>
            </div>
            <p className="text-xs text-slate-400">
              CPU ক্লক ডাউন করে ব্যাটারি আয়ু বাড়ায়
            </p>
          </div>
          <button
            onClick={() => sendDeviceCommand('toggle_battery_saver')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              telemetry.powerSaverMode
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {telemetry.powerSaverMode ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
          </button>
        </div>

        {/* Clean RAM */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <h4 className="font-bold text-sm text-white">র‍্যাম ও ক্যাশ ক্লিন</h4>
            </div>
            <p className="text-xs text-slate-400">
              অব্যবহৃত ব্যাকগ্রাউন্ড টাস্ক শেষ করে স্পিড বুস্ট
            </p>
          </div>
          <button
            onClick={() => sendDeviceCommand('clean_ram')}
            disabled={loadingAction === 'clean_ram'}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            ক্লিন করুন
          </button>
        </div>

        {/* Remote Screen Lock */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {telemetry.deviceLocked ? (
                <Lock className="w-5 h-5 text-rose-400" />
              ) : (
                <Unlock className="w-5 h-5 text-slate-400" />
              )}
              <h4 className="font-bold text-sm text-white">রিমোট স্ক্রিন লক</h4>
            </div>
            <p className="text-xs text-slate-400">
              {telemetry.deviceLocked ? 'স্ক্রিন সম্পূর্ণ লক করা আছে' : 'ডিভাইস সাধারণ আনলক মোডে আছে'}
            </p>
          </div>
          <button
            onClick={() => sendDeviceCommand(telemetry.deviceLocked ? 'unlock_device' : 'lock_device')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              telemetry.deviceLocked
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600/80 hover:bg-rose-600 text-white'
            }`}
          >
            {telemetry.deviceLocked ? 'আনলক করুন' : 'লক করুন'}
          </button>
        </div>

        {/* Do Not Disturb (DND) */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BellOff className={`w-5 h-5 ${telemetry.dndMode ? 'text-cyan-400' : 'text-slate-400'}`} />
              <h4 className="font-bold text-sm text-white">ডু-নট-ডিস্টার্ব (DND)</h4>
            </div>
            <p className="text-xs text-slate-400">
              সকল অবাঞ্ছিত নোটিফিকেশন সাইলেন্ট রাখুন
            </p>
          </div>
          <button
            onClick={() => sendDeviceCommand('toggle_dnd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              telemetry.dndMode
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {telemetry.dndMode ? 'বন্ধ করুন' : 'চালু করুন'}
          </button>
        </div>

        {/* Emergency High-Decibel Siren */}
        <div className={`p-5 rounded-3xl border flex items-center justify-between ${
          telemetry.alarmActive
            ? 'bg-rose-950 border-rose-500 animate-pulse'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertOctagon className={`w-5 h-5 ${telemetry.alarmActive ? 'text-rose-400 animate-spin' : 'text-rose-500'}`} />
              <h4 className="font-bold text-sm text-white">জরুরি সাইরেন সংকেত</h4>
            </div>
            <p className="text-xs text-slate-400">
              হারানো বা চুরির সময়ে তীব্র শব্দ বাজায়
            </p>
          </div>
          <button
            onClick={() => sendDeviceCommand(telemetry.alarmActive ? 'stop_alarm' : 'trigger_alarm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              telemetry.alarmActive
                ? 'bg-white text-rose-900 animate-bounce'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {telemetry.alarmActive ? 'সাইরেন থামান' : 'সাইরেন বাজান'}
          </button>
        </div>
      </div>
    </div>
  );
};

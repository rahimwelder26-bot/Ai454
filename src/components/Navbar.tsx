import React, { useState } from 'react';
import { 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Wifi, 
  PhoneCall, 
  Smartphone, 
  Database, 
  Sparkles, 
  Lock, 
  LogOut, 
  CheckCircle2, 
  Zap, 
  Volume2, 
  VolumeX, 
  Palette, 
  Flame 
} from 'lucide-react';
import { UserSession, SystemHealth, ThemeColor } from '../types';
import { OMNIMIND_CORE_ICON, COLOR_THEMES } from '../assets/branding';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  health: SystemHealth | null;
  currentTheme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  overdriveActive: boolean;
  setOverdriveActive: (active: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenLogin,
  onLogout,
  health,
  currentTheme,
  setTheme,
  overdriveActive,
  setOverdriveActive,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isSoundEnabled());
  const [showThemePicker, setShowThemePicker] = useState(false);

  const activeThemeConfig = COLOR_THEMES[currentTheme] || COLOR_THEMES.inferno;

  const toggleOverdrive = () => {
    const newState = !overdriveActive;
    setOverdriveActive(newState);
    if (newState) {
      soundFx.playQuantumOverdrive();
    } else {
      soundFx.playBeep(400, 0.1);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setSoundEnabled(next);
    if (next) soundFx.playBeep(880, 0.08);
  };

  const navItems = [
    { id: 'terminal', label: 'মাস্টার কমান্ড হাব', icon: Terminal, badge: 'AI Core' },
    { id: 'apps', label: 'অ্যাপ ক্রিয়েটর ও স্যান্ডবক্স', icon: Layers, badge: 'Live' },
    { id: 'admin', label: 'এডমিন কন্ট্রোল', icon: ShieldCheck, badge: 'Protected' },
    { id: 'network', label: 'নেটওয়ার্ক সেন্টিনেল', icon: Wifi, badge: 'Defense' },
    { id: 'caller', label: 'অজানা কলার ট্র্যাকার', icon: PhoneCall, badge: 'Radar' },
    { id: 'device', label: 'ফোন রিমোট কন্ট্রোল', icon: Smartphone, badge: 'Host' },
    { id: 'database', label: 'অটোনোমাস ডাটাবেজ', icon: Database, badge: 'Google Cloud' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      {/* Top micro status bar */}
      <div className="bg-slate-900/80 border-b border-slate-800/50 px-3 sm:px-6 py-1.5 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1.5 font-bold" style={{ color: activeThemeConfig.lightHex }}>
            <span className={`w-2 h-2 rounded-full animate-ping ${overdriveActive ? 'bg-red-500' : 'bg-cyan-400'}`}></span>
            {overdriveActive ? '🔥 কোয়ান্টাম ওভারড্রাইভ মোড সক্রিয় (১০০% টার্বো)' : 'সর্বোচ্চ কৃত্রিম বুদ্ধিমত্তা সক্রিয়'}
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:inline text-slate-400">
            গুগল ক্লাউড ইঞ্জিন: <span className="text-emerald-400 font-semibold">{health?.geminiConnected ? 'জেমিনি 3.8 Flash (আনলিমিটেড)' : 'অটোনোমাস কোর'}</span>
          </span>
        </div>

        {/* Right tools: Sound, Overdrive, Theme Switcher, Auth */}
        <div className="flex items-center gap-2">
          {/* Overdrive Turbo Toggle */}
          <button
            onClick={toggleOverdrive}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition shadow-sm ${
              overdriveActive
                ? 'bg-red-600 text-white animate-pulse shadow-red-900 border border-red-400'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="কোয়ান্টাম ওভারড্রাইভ টার্বো মোড"
          >
            <Flame className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">ওভারড্রাইভ</span>
          </button>

          {/* Theme Palette dropdown toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 text-[10px] font-semibold transition"
              title="ভয়ংকর কালার থিম পরিবর্তন"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeThemeConfig.hex }}></span>
              <span className="hidden md:inline">{activeThemeConfig.nameBengali}</span>
              <Palette className="w-3 h-3 ml-0.5" />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400 px-2 py-1 font-bold">
                  ভয়ংকর নিয়ন কালার নির্বাচন
                </div>
                {Object.values(COLOR_THEMES).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setTheme(th.id);
                      setShowThemePicker(false);
                      soundFx.playBeep(900, 0.05);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition ${
                      currentTheme === th.id
                        ? 'bg-slate-800 text-white font-bold border border-slate-700'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: th.hex }}></span>
                      <span>{th.nameBengali}</span>
                    </div>
                    {currentTheme === th.id && <span className="text-[10px] text-cyan-400">সক্রিয়</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Effect Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1 rounded-lg border transition ${
              soundEnabled ? 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' : 'text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'সাউন্ড সক্রিয়' : 'সাউন্ড বন্ধ'}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>

          {/* Auth Status */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <span className="text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                {currentUser.role === 'master_admin' ? 'মাস্টার এডমিন' : 'অনুমোদিত'}
              </span>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                title="লগআউট"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 transition text-[10px]"
            >
              <Lock className="w-3 h-3" />
              এডমিন লগইন
            </button>
          )}
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand identity with the powerful generated AI Icon! */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab('terminal')}>
          <div className="relative">
            {/* Outer spinning quantum energy ring */}
            <div className="absolute -inset-1 rounded-2xl opacity-75 blur-sm animate-pulse" style={{ backgroundColor: activeThemeConfig.hex }}></div>
            
            {/* Powerful AI core emblem image */}
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-900 group-hover:scale-105 transition-transform duration-300">
              <img
                src={OMNIMIND_CORE_ICON}
                alt="OmniMind Core Icon"
                className="w-full h-full object-cover animate-spin-slow hover:animate-none"
              />
            </div>
            
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                <span>OmniMind</span>
                <span className="text-xs uppercase font-extrabold px-1.5 py-0.2 rounded" style={{ backgroundColor: activeThemeConfig.hex, color: '#030712' }}>
                  ULTRA
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">সর্বশক্তিমান কৃত্রিম বুদ্ধিমত্তা হাব</p>
          </div>
        </div>

        {/* Tab switcher buttons */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  soundFx.playBeep(850, 0.04);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'text-white border shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${activeThemeConfig.hex}25`,
                        borderColor: activeThemeConfig.hex,
                        boxShadow: `0 0 20px -3px ${activeThemeConfig.hex}40`,
                      }
                    : {}
                }
              >
                <Icon
                  className="w-4 h-4 transition-transform group-hover:scale-110"
                  style={isActive ? { color: activeThemeConfig.lightHex } : {}}
                />
                <span>{item.label}</span>
                {item.id === 'apps' && (
                  <span className="hidden xl:inline text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

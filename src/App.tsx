import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CommandHub } from './components/CommandHub';
import { AppCreator } from './components/AppCreator';
import { AdminPanel } from './components/AdminPanel';
import { NetworkSentinel } from './components/NetworkSentinel';
import { CallerTracker } from './components/CallerTracker';
import { DeviceController } from './components/DeviceController';
import { DatabaseViewer } from './components/DatabaseViewer';
import { AuthModal } from './components/AuthModal';
import { UserSession, SystemHealth, ThemeColor } from './types';
import { soundFx } from './utils/audio';
import { Sparkles, Shield, Cpu, Cloud, Flame } from 'lucide-react';
import { OMNIMIND_CORE_ICON, COLOR_THEMES } from './assets/branding';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('terminal');
  const [activeAppId, setActiveAppId] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  
  // Fierce color themes: 'inferno' (default blood-red neon), 'cyan', 'purple', 'emerald', 'gold'
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('inferno');
  const [overdriveActive, setOverdriveActive] = useState<boolean>(true);

  // Restore session & theme from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnimind_user_session');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        // Automatically pre-authenticate as Super Admin for smooth instant experience
        const defaultMaster: UserSession = {
          id: 'user_master_001',
          email: 'info.rahim76@gmail.com',
          name: 'মুহাম্মদ রাহিম (সুপার এডমিন)',
          role: 'master_admin',
          permissions: {
            canGenerateApps: true,
            canControlNetwork: true,
            canLookupCallers: true,
            canDeviceControl: true,
            canAccessDatabase: true,
          },
        };
        setCurrentUser(defaultMaster);
        localStorage.setItem('omnimind_user_session', JSON.stringify(defaultMaster));
      }

      const storedTheme = localStorage.getItem('omnimind_theme') as ThemeColor;
      if (storedTheme && COLOR_THEMES[storedTheme]) {
        setCurrentTheme(storedTheme);
      }
    } catch (e) {
      console.warn('Failed to parse session', e);
    }
  }, []);

  const handleSetTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme);
    localStorage.setItem('omnimind_theme', theme);
  };

  // Fetch system health on mount
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/system/health');
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.error('Health fetch error', e);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('omnimind_user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    soundFx.playBeep(450, 0.1);
    setCurrentUser(null);
    localStorage.removeItem('omnimind_user_session');
  };

  const handleOpenAppSandbox = (appId: string) => {
    setActiveAppId(appId);
    setCurrentTab('apps');
  };

  const activeThemeConfig = COLOR_THEMES[currentTheme] || COLOR_THEMES.inferno;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col theme-${currentTheme} selection:bg-red-500/30 selection:text-red-200 matrix-grid`}>
      {/* Top Futuristic Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        health={health}
        currentTheme={currentTheme}
        setTheme={handleSetTheme}
        overdriveActive={overdriveActive}
        setOverdriveActive={setOverdriveActive}
      />

      {/* Main Module Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'terminal' && (
          <CommandHub
            currentUser={currentUser}
            onOpenAppSandbox={handleOpenAppSandbox}
            onNavigateTab={setCurrentTab}
            currentTheme={currentTheme}
            overdriveActive={overdriveActive}
          />
        )}

        {currentTab === 'apps' && (
          <AppCreator
            currentUser={currentUser}
            activeAppId={activeAppId}
            currentTheme={currentTheme}
            overdriveActive={overdriveActive}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            onOpenLogin={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'network' && (
          <NetworkSentinel currentUser={currentUser} />
        )}

        {currentTab === 'caller' && (
          <CallerTracker currentUser={currentUser} />
        )}

        {currentTab === 'device' && (
          <DeviceController currentUser={currentUser} />
        )}

        {currentTab === 'database' && (
          <DatabaseViewer />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
        masterEmailHint={health?.masterAdminEmail || 'info.rahim76@gmail.com'}
        currentTheme={currentTheme}
      />

      {/* Futuristic Command Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 backdrop-blur py-6 px-4 sm:px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/20">
              <img src={OMNIMIND_CORE_ICON} alt="OmniMind Icon" className="w-full h-full object-cover" />
            </div>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Sparkles className="w-4 h-4" style={{ color: activeThemeConfig.lightHex }} />
              OmniMind Supreme OS Ultra
            </span>
            <span>•</span>
            <span>মাস্টার সুপারভাইজার: <strong className="text-slate-300">info.rahim76@gmail.com</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Cloud className="w-3.5 h-3.5" /> গুগল ক্লাউড সংযোগ সক্রিয়
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-red-400">
              <Flame className="w-3.5 h-3.5" /> কোয়ান্টাম ওভারড্রাইভ
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

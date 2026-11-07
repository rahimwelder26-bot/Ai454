import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, Sparkles, X, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { OMNIMIND_CORE_ICON, COLOR_THEMES } from '../assets/branding';
import { ThemeColor } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  masterEmailHint: string;
  currentTheme?: ThemeColor;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  masterEmailHint,
  currentTheme = 'inferno',
}) => {
  const [email, setEmail] = useState(masterEmailHint || 'info.rahim76@gmail.com');
  const [password, setPassword] = useState('Rahim@Master#2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTheme = COLOR_THEMES[currentTheme] || COLOR_THEMES.inferno;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    soundFx.playBeep(650, 0.08);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        soundFx.playBeep(250, 0.2);
        throw new Error(data.error || 'লগইন ব্যর্থ হয়েছে');
      }

      soundFx.playBeep(950, 0.15);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setError(null);
    soundFx.playBeep(750, 0.05);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-slate-900 border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        style={{ borderColor: activeTheme.hex, boxShadow: `0 0 35px -5px ${activeTheme.hex}50` }}
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Fierce AI Icon */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <div className="absolute -inset-1 rounded-full blur-md opacity-75 animate-pulse" style={{ backgroundColor: activeTheme.hex }}></div>
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-xl bg-slate-950">
              <img
                src={OMNIMIND_CORE_ICON}
                alt="OmniMind Core Icon"
                className="w-full h-full object-cover animate-spin-slow"
              />
            </div>
          </div>

          <h2 className="text-xl font-black text-white">সুরক্ষিত এডমিন ও ব্যবহারকারী লগইন</h2>
          <p className="text-xs text-slate-400 mt-1">
            মাস্টার এডমিন অনুমোদিত জিমেইল ও পাসওয়ার্ড প্রদান করুন
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: activeTheme.lightHex }} />
              অনুমোদিত জিমেইল (Gmail Address)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. info.rahim76@gmail.com"
              className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" style={{ color: activeTheme.lightHex }} />
              গোপন পাসওয়ার্ড (Access Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 px-4 rounded-xl text-sm transition shadow-xl text-white flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r ${activeTheme.gradientClass}`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                যাচাই করা হচ্ছে...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                সিস্টেম আনলক করুন
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Helper */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-xs">
          <p className="text-slate-400 mb-2 font-medium">দ্রুত টেস্ট ও প্রবেশ সহায়িকা:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('info.rahim76@gmail.com', 'Rahim@Master#2026')}
              className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left transition"
            >
              <div className="text-[11px] font-bold flex items-center gap-1" style={{ color: activeTheme.lightHex }}>
                <Sparkles className="w-3 h-3" /> মাস্টার এডমিন
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">info.rahim76@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('operator@omnimind.ai', 'Operator#1234')}
              className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left transition"
            >
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> অপারেটর মোড
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">operator@omnimind.ai</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

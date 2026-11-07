import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Code2, 
  Download, 
  Trash2, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Plus, 
  ExternalLink, 
  Check, 
  Copy, 
  Smartphone, 
  Monitor, 
  Save, 
  Flame, 
  ShieldCheck, 
  Terminal, 
  Zap 
} from 'lucide-react';
import { GeneratedApp, UserSession, ThemeColor } from '../types';
import { soundFx } from '../utils/audio';
import { COLOR_THEMES } from '../assets/branding';

interface AppCreatorProps {
  currentUser: UserSession | null;
  activeAppId?: string;
  currentTheme?: ThemeColor;
  overdriveActive?: boolean;
}

export const AppCreator: React.FC<AppCreatorProps> = ({ 
  currentUser, 
  activeAppId, 
  currentTheme = 'inferno',
  overdriveActive = false 
}) => {
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<GeneratedApp | null>(null);
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<'social' | 'tool' | 'game' | 'utility' | 'business' | 'custom'>('social');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('preview');
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const activeTheme = COLOR_THEMES[currentTheme] || COLOR_THEMES.inferno;

  // Pre-built Mega Application Arsenal templates
  const megaAppTemplates = [
    {
      id: 'facebook',
      title: 'OmniSocial (Facebook Clone)',
      category: 'social',
      badge: 'মেগা সোশ্যাল',
      prompt: 'ফেসবুকের মত একটি সম্পূর্ণ সোশ্যাল মিডিয়া ওয়েব অ্যাপ তৈরি করো যাতে নিউজফিড, স্টোরি, পোস্ট ক্রিয়েটর, লাইক, কমেন্ট ও রিয়েলটাইম ইন-মেমরি ডাটাবেজ থাকবে।'
    },
    {
      id: 'quantum_chat',
      title: 'QuantumChat (এনক্রিপ্টেড মেসেঞ্জার)',
      category: 'social',
      badge: 'প্রাইভেট চ্যাট',
      prompt: 'একটি উচ্চ নিরাপত্তাযুক্ত কোয়ান্টাম এনক্রিপ্টেড চ্যাট ও মেসেঞ্জার অ্যাপ তৈরি করো যাতে লাইভ মেসেজ, ভয়েস নোট সিমুলেশন এবং সাইবার ডার্ক মোড থাকবে।'
    },
    {
      id: 'cyber_war',
      title: 'CyberWar (স্যাটেলাইট থ্রেট ডিফেন্স)',
      category: 'tool',
      badge: 'ডিফেন্স পোর্টাল',
      prompt: 'একটি গ্লোবাল সাইবার ডিফেন্স ও স্যাটেলাইট থ্রেট মনিটরিং পোর্টাল তৈরি করো যাতে লাইভ থ্রেট রাডার, হ্যাকার আইপি ব্লকার এবং ফায়ারওয়াল মিটার থাকবে।'
    },
    {
      id: 'crypto_trader',
      title: 'CryptoTitan (ট্রেডিং টার্মিনাল)',
      category: 'business',
      badge: 'ফাইন্যান্স টার্মিনাল',
      prompt: 'একটি প্রফেশনাল ক্রিপ্টোকারেন্সি ট্রেডিং টার্মিনাল ড্যাশবোর্ড তৈরি করো যাতে লাইভ চার্ট, অর্ডারবুক এবং বাই/সেল সিমুলেটর থাকবে।'
    },
    {
      id: 'retro_blaster',
      title: 'RetroBlaster (সাইবার আর্কেড গেম)',
      category: 'game',
      badge: 'অ্যাকশন গেম',
      prompt: 'একটি আকর্ষণীয় রেট্রো সাইবার স্পেস ব্লাস্টার আর্কেড গেম তৈরি করো যাতে স্পেসশিপ কন্ট্রোল, শত্রু জাহাজ ধ্বংস, স্কোরবোর্ড ও লেজার সাউন্ড থাকবে।'
    }
  ];

  // Fetch apps on mount
  const fetchApps = async (selectId?: string) => {
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.apps) {
        setApps(data.apps);
        if (selectId) {
          const target = data.apps.find((a: GeneratedApp) => a.id === selectId);
          if (target) {
            setSelectedApp(target);
            setEditedCode(target.htmlCode);
            return;
          }
        }
        if (!selectedApp && data.apps.length > 0) {
          setSelectedApp(data.apps[0]);
          setEditedCode(data.apps[0].htmlCode);
        }
      }
    } catch (e) {
      console.error('Failed to fetch apps', e);
    }
  };

  useEffect(() => {
    fetchApps(activeAppId);
  }, [activeAppId]);

  const handleSelectApp = (app: GeneratedApp) => {
    setSelectedApp(app);
    setEditedCode(app.htmlCode);
    soundFx.playBeep(800, 0.05);
  };

  const handleGenerateApp = async (e?: React.FormEvent, customPrompt?: string, customCat?: any) => {
    if (e) e.preventDefault();
    const finalPrompt = (customPrompt || prompt).trim();
    if (!finalPrompt || isGenerating) return;

    soundFx.playBeep(900, 0.1);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          category: customCat || category,
          authorEmail: currentUser ? currentUser.email : 'Master Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'অ্যাপ তৈরিতে ত্রুটি');

      soundFx.playBeep(1100, 0.15);
      await fetchApps(data.app.id);
      setPrompt('');
    } catch (err: any) {
      soundFx.playBeep(300, 0.2);
      alert(`অ্যাপ তৈরিতে ব্যর্থ হয়েছে: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই অ্যাপটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/apps/${id}`, { method: 'DELETE' });
      if (res.ok) {
        soundFx.playBeep(400, 0.1);
        const filtered = apps.filter((a) => a.id !== id);
        setApps(filtered);
        if (selectedApp?.id === id) {
          setSelectedApp(filtered[0] || null);
          setEditedCode(filtered[0]?.htmlCode || '');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCode = async () => {
    if (!selectedApp) return;
    setIsSaving(true);
    soundFx.playBeep(850, 0.08);

    try {
      const res = await fetch('/api/apps/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApp.id,
          title: selectedApp.title,
          description: selectedApp.description,
          category: selectedApp.category,
          tags: selectedApp.tags,
          htmlCode: editedCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedApp(data.app);
        soundFx.playBeep(1050, 0.1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!selectedApp) return;
    const blob = new Blob([editedCode || selectedApp.htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedApp.title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playBeep(950, 0.08);
  };

  const handleCopyCode = () => {
    if (!selectedApp) return;
    navigator.clipboard.writeText(editedCode || selectedApp.htmlCode);
    setCopied(true);
    soundFx.playBeep(900, 0.05);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`rounded-3xl border p-6 sm:p-8 transition-all duration-300 ${activeTheme.glowClass} bg-slate-900/90`}
           style={{ borderColor: `${activeTheme.hex}40` }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-2 border"
                 style={{ backgroundColor: `${activeTheme.hex}20`, borderColor: `${activeTheme.hex}50`, color: activeTheme.lightHex }}>
              <Layers className="w-3.5 h-3.5" />
              <span>জিরো-হোস্টিং লাইভ স্যান্ডবক্স ইঞ্জিন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্বয়ংক্রিয় ইনস্ট্যান্ট ওয়েব অ্যাপ সংশ্লেষক
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              আপনি যা বলবেন, তৎক্ষণাৎ তা তৈরি হবে। কোনো গিটহ্যাব বা বাহ্যিক হোস্টিংয়ে ডিপ্লয় করা লাগবে না; এখান থেকেই সরাসরি সম্পূর্ণ অ্যাপ ব্যবহার ও পরিচালনা করতে পারবেন। ফেসবুকের মতো সম্পূর্ণ কার্যকর সোশ্যাল নেটওয়ার্ক তৈরির ক্ষমতা সমৃদ্ধ।
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-slate-950 text-white font-mono px-3.5 py-2 rounded-2xl border"
                  style={{ borderColor: `${activeTheme.hex}40`, color: activeTheme.lightHex }}>
              মোট অ্যাপ: {apps.length} টি সক্রিয়
            </span>
          </div>
        </div>

        {/* Prompt generator input */}
        <form onSubmit={(e) => handleGenerateApp(e)} className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-semibold self-center mr-1">ক্যাটাগরি:</span>
            {[
              { id: 'social', label: 'সোশ্যাল নেটওয়ার্ক (Facebook Clone)' },
              { id: 'tool', label: 'টুলস ও ইউটিলিটি' },
              { id: 'business', label: 'বিজনেস ও ফাইন্যান্স' },
              { id: 'game', label: 'আর্কেড গেম' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id as any)}
                className={`px-3 py-1 rounded-xl transition ${
                  category === c.id
                    ? 'text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                style={category === c.id ? { backgroundColor: activeTheme.hex } : {}}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="যেমন: 'ফেসবুকের মত একটি সোশ্যাল মিডিয়া অ্যাপ তৈরি করো যেখানে পোস্ট, লাইক ও কমেন্ট থাকবে'..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className={`font-bold px-6 py-3 rounded-2xl text-sm transition shadow-xl text-white flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0 bg-gradient-to-r ${activeTheme.gradientClass}`}
            >
              {isGenerating ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  অ্যাপ তৈরি হচ্ছে...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>তৎক্ষণাৎ তৈরি ও রান করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Mega Arsenal Presets */}
          <div className="pt-2">
            <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>এক ক্লিকে প্রিবিল্ট মেগা অ্যাপ লাইব্রেরি থেকে তৈরি করুন:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {megaAppTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setCategory(t.category as any);
                    handleGenerateApp(undefined, t.prompt, t.category);
                  }}
                  disabled={isGenerating}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-left transition group"
                >
                  <span className="text-[9px] font-mono block text-cyan-400">{t.badge}</span>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 block truncate">
                    {t.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Main Apps Layout: Sidebar of deployed apps + Live interactive sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Apps Library & Switcher */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              আপনার তৈরি অ্যাপসমূহ
            </h3>
            <span className="text-xs text-slate-400 font-mono">({apps.length})</span>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {apps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-slate-900 border-2 shadow-xl'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                  style={isSelected ? { borderColor: activeTheme.hex } : {}}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-white line-clamp-1">{app.title}</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 uppercase">
                      {app.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      লাইভ স্যান্ডবক্স
                    </span>
                    {apps.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteApp(app.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Interactive Runner & Code Inspector */}
        <div className={`lg:col-span-3 space-y-3 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-950' : ''}`}>
          {selectedApp ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
              {/* App Sandbox Toolbar */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: activeTheme.hex }}></div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{selectedApp.title}</span>
                      <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                        সরাসরি কার্যকর
                      </span>
                    </h3>
                  </div>
                </div>

                {/* View toggles & tools */}
                <div className="flex items-center gap-2">
                  {/* View mode toggle */}
                  <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        viewMode === 'preview' ? 'text-white shadow font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                      style={viewMode === 'preview' ? { backgroundColor: activeTheme.hex } : {}}
                    >
                      <Play className="w-3 h-3" /> লাইভ অ্যাপ
                    </button>
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        viewMode === 'code' ? 'text-white shadow font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                      style={viewMode === 'code' ? { backgroundColor: activeTheme.hex } : {}}
                    >
                      <Code2 className="w-3 h-3" /> কোড
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`hidden sm:flex px-3 py-1 rounded-lg text-xs font-semibold items-center gap-1.5 transition ${
                        viewMode === 'split' ? 'text-white shadow font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                      style={viewMode === 'split' ? { backgroundColor: activeTheme.hex } : {}}
                    >
                      স্প্লিট ভিউ
                    </button>
                  </div>

                  {/* Device viewport frame */}
                  {viewMode === 'preview' && (
                    <div className="hidden sm:flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-slate-400">
                      <button
                        onClick={() => setDeviceFrame('desktop')}
                        className={`p-1.5 rounded-lg transition ${deviceFrame === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'hover:text-white'}`}
                        title="ডেস্কটপ ভিউ"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeviceFrame('mobile')}
                        className={`p-1.5 rounded-lg transition ${deviceFrame === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'hover:text-white'}`}
                        title="মোবাইল ভিউ"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    title="কোড কপি করুন"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    title="HTML ফাইল ডাউনলোড করুন"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    title={isFullscreen ? 'ফুলস্ক্রিন থেকে প্রস্থান' : 'ফুলস্ক্রিন করুন'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex overflow-hidden bg-slate-950">
                {/* Code Editor Panel */}
                {(viewMode === 'code' || viewMode === 'split') && (
                  <div className={`flex flex-col border-r border-slate-800 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                    <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>HTML5 / TailwindCSS / JavaScript</span>
                      <button
                        onClick={handleSaveCode}
                        disabled={isSaving}
                        className="text-white font-bold flex items-center gap-1 px-3 py-1 rounded-lg border transition disabled:opacity-50"
                        style={{ backgroundColor: activeTheme.hex, borderColor: activeTheme.hex }}
                      >
                        <Save className="w-3 h-3" />
                        <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেভ ও রিফ্রেশ'}</span>
                      </button>
                    </div>
                    <textarea
                      value={editedCode}
                      onChange={(e) => setEditedCode(e.target.value)}
                      className="flex-1 p-4 bg-slate-950 text-cyan-200 font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto"
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Live Preview Sandbox Panel */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`flex-1 flex items-center justify-center bg-slate-950 p-2 overflow-auto ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                    <div
                      className={`h-full w-full transition-all duration-300 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-white ${
                        deviceFrame === 'mobile' && viewMode === 'preview'
                          ? 'max-w-sm max-h-[700px] border-4 border-slate-800'
                          : 'max-w-full'
                      }`}
                    >
                      <iframe
                        srcDoc={editedCode || selectedApp.htmlCode}
                        title={selectedApp.title}
                        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Layers className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-base font-bold text-slate-300">কোনো অ্যাপ নির্বাচন করা হয়নি</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                বাম পাশের তালিকা থেকে একটি অ্যাপ ক্লিক করুন অথবা উপরের বক্সে আপনার প্রম্পট দিয়ে নতুন অ্যাপ তৈরি করুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Terminal as TerminalIcon, 
  Cpu, 
  Layers, 
  Wifi, 
  PhoneCall, 
  Smartphone, 
  Database, 
  Volume2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Activity, 
  Radio, 
  Shield 
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { UserSession, ThemeColor } from '../types';
import { OMNIMIND_CORE_ICON, OMNIMIND_COMMAND_ROOM, COLOR_THEMES } from '../assets/branding';

interface CommandHubProps {
  currentUser: UserSession | null;
  onOpenAppSandbox: (appId: string) => void;
  onNavigateTab: (tab: string) => void;
  currentTheme: ThemeColor;
  overdriveActive: boolean;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  timestamp: string;
  actionType: string;
  thoughtBengali?: string;
  executionSummary?: string;
  appCreated?: any;
  callerData?: any;
  deviceData?: any;
}

export const CommandHub: React.FC<CommandHubProps> = ({
  currentUser,
  onOpenAppSandbox,
  onNavigateTab,
  currentTheme,
  overdriveActive,
}) => {
  const [inputCommand, setInputCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init_welcome',
      command: 'সর্বশক্তিমান এআই কোর অ্যাক্টিভেশন ও প্রটোকল যাচাই',
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      actionType: 'general_qa',
      thoughtBengali: 'ওমনিমাইন্ড কোয়ান্টাম নিউরাল কোর সর্বোচ্চ ক্ষমতায় কার্যকর। সব ধরনের সাইবার, অ্যাপ সংশ্লেষণ ও রিমোট নিয়ন্ত্রণ ব্যবস্থা আনলক করা হয়েছে।',
      executionSummary: 'সালাম মাস্টার রাহিম! আমি পৃথিবীর সবচেয়ে শক্তিশালী এআই হাব। আপনি মুখে বলুন বা লিখে দিন—আমি তৎক্ষণাৎ ফেসবুকের মতো যেকোনো সোশ্যাল ও ওয়েব অ্যাপ্লিকেশন সরাসরি তৈরি করে রান করাবো (গিটহ্যাব বা বাইরের কোনো হোস্টিং ছাড়াই), ওয়াইফাই ও নেটওয়ার্কের পূর্ণ সুরক্ষা দেব, অজানা নম্বরের কলারের লোকেশন ও নাম বলে দেব এবং আপনার পুরো ফোনকে স্বয়ংক্রিয়ভাবে নিয়ন্ত্রণ করব। বলুন, কী নির্দেশ দিচ্ছেন?',
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeTheme = COLOR_THEMES[currentTheme] || COLOR_THEMES.inferno;

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  // Voice recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputCommand(transcript);
        setIsListening(false);
        soundFx.playBeep(880, 0.1);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('আপনার ব্রাউজারে ভয়েস রিকগনিশন সমর্থন করে না। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন।');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      soundFx.playBeep(700, 0.1);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleExecuteCommand = async (cmdText?: string) => {
    const cmd = (cmdText || inputCommand).trim();
    if (!cmd || isProcessing) return;

    soundFx.playBeep(950, 0.08);
    setIsProcessing(true);
    if (!cmdText) setInputCommand('');

    const currentItem: CommandHistoryItem = {
      id: `cmd_${Date.now()}`,
      command: cmd,
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      actionType: 'processing',
    };

    setHistory((prev) => [...prev, currentItem]);

    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          actorEmail: currentUser ? currentUser.email : 'Master Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'কমান্ড ব্যর্থ হয়েছে');

      soundFx.playBeep(1150, 0.12);

      setHistory((prev) =>
        prev.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                actionType: data.actionType,
                thoughtBengali: data.thoughtBengali,
                executionSummary: data.executionSummary,
                appCreated: data.app,
                callerData: data.caller,
                deviceData: data.telemetry,
              }
            : item
        )
      );

      // Auto speak TTS announcement if caller action
      if (data.actionType === 'caller_lookup' && data.caller?.audioSpeechText) {
        soundFx.speakBengaliAlert(data.caller.audioSpeechText);
      }
    } catch (err: any) {
      soundFx.playBeep(300, 0.2);
      setHistory((prev) =>
        prev.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                actionType: 'error',
                executionSummary: `ত্রুটি: ${err.message}`,
              }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const quickCommands = [
    { label: '🚀 ফেসবুকের মত সোশ্যাল মিডিয়া অ্যাপ বানাও', cmd: 'ফেসবুকের মত একটি লাইভ সোশ্যাল মিডিয়া অ্যাপ তৈরি করো যেখানে পোস্ট, লাইক ও কমেন্ট থাকবে' },
    { label: '📡 ওয়াইফাই স্ক্যান করো ও সন্দেহজনক ডিভাইস চেক করো', cmd: 'ওয়াইফাই নেটওয়ার্ক স্ক্যান করো এবং সন্দেহজনক ডিভাইস চেক করো' },
    { label: '📞 অচেনা নম্বর ০১৭১... কার ও কোন লোকেশন চেক করো', cmd: 'অচেনা নম্বর ০১৭১২৩৪৫৬৭৮ কার নামে এবং কোন লোকেশন থেকে কল আসছে চেক করো' },
    { label: '⚡ ব্যাটারি সেভার চালু করো ও র‍্যাম ক্লিন করো', cmd: 'ফোনের ব্যাটারি সেভার অন করো এবং র‍্যাম ক্যাশ ক্লিন করো' },
    { label: '💾 ডাটাবেজ ব্যাকআপ ও অটোনোমাস সিঙ্ক চেক করো', cmd: 'অটোনোমাস ডাটাবেজ রেকর্ড ও গুগল ক্লাউড সংযোগের স্থিতি চেক করো' },
  ];

  return (
    <div className="space-y-6">
      {/* Epic Hero Command Center with Generated Wallpaper & AI Core Icon */}
      <div className={`relative rounded-3xl border overflow-hidden transition-all duration-300 ${activeTheme.glowClass}`} style={{ borderColor: `${activeTheme.hex}50` }}>
        {/* Background Wallpaper Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={OMNIMIND_COMMAND_ROOM}
            alt="OmniMind Command Center"
            className="w-full h-full object-cover opacity-35 filter contrast-125"
          />
          {/* Cyber matrix gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(3,7,18,0.9)_100%)]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold shadow-lg"
                 style={{ backgroundColor: `${activeTheme.hex}20`, borderColor: `${activeTheme.hex}60`, color: activeTheme.lightHex }}>
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>{overdriveActive ? 'কোয়ান্টাম ওভারড্রাইভ সক্রিয় • ১০০% টার্বো প্রসেসিং' : 'সার্বভৌম এআই কোর • আনলিমিটেড গুগল পাওয়ার'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              আমি যা বলব সে তাই করবে।
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              আপনি মুখে বলুন বা লিখে দিন—এআই অবিলম্বে সম্পূর্ণ কার্যক্ষম ওয়েব অ্যাপ্লিকেশন বানিয়ে স্যান্ডবক্সে লাইভ রান করাবে (কোনো গিটহ্যাব পোস্টিং ছাড়াই), ওয়াইফাই ও নেটওয়ার্ক সুরক্ষা দেবে, অচেনা কলারের লোকেশন ও নাম বের করবে এবং পুরো ফোনের রিমোট নিয়ন্ত্রণ চালাবে।
            </p>

            {/* Quick preset commands */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center lg:justify-start">
              {quickCommands.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecuteCommand(item.cmd)}
                  disabled={isProcessing}
                  className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-white/40 px-3.5 py-1.5 rounded-full transition duration-150 disabled:opacity-50 shadow-md backdrop-blur"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Levitating Powerful AI Core Reactor Icon Avatar */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
              {/* Outer pulsed neon aura */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse"
                style={{ backgroundColor: activeTheme.hex }}
              />

              {/* Orbital ring 1 */}
              <div
                className="absolute inset-2 rounded-full border-2 border-dashed opacity-50 animate-spin-slow"
                style={{ borderColor: activeTheme.hex }}
              />

              {/* Orbital ring 2 */}
              <div
                className="absolute inset-6 rounded-full border border-dotted opacity-40 animate-reverse-spin-slow"
                style={{ borderColor: activeTheme.lightHex }}
              />

              {/* The core emblem image */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-slate-950 z-10 group">
                <img
                  src={OMNIMIND_CORE_ICON}
                  alt="OmniMind Reactor Core"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Core telemetry badge */}
            <div className="mt-2 text-center">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 shadow"
                    style={{ color: activeTheme.lightHex }}>
                {overdriveActive ? 'CORE TEMP: 3,420°K (OVERDRIVE)' : 'CORE STATUS: QUANTUM OPTIMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Command Input Box with glowing accent */}
      <div
        className="bg-slate-900/95 border rounded-3xl p-3 sm:p-4 shadow-2xl transition-all"
        style={{ borderColor: `${activeTheme.hex}60`, boxShadow: `0 0 25px -5px ${activeTheme.hex}30` }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border"
            style={{ backgroundColor: `${activeTheme.hex}20`, borderColor: `${activeTheme.hex}50`, color: activeTheme.lightHex }}
          >
            <TerminalIcon className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
            placeholder="আপনার নির্দেশ বাংলায় বা ইংরেজিতে লিখুন... (যেমন: 'ফেসবুকের মত একটি লাইভ সোশ্যাল অ্যাপ বানাও')"
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
            disabled={isProcessing}
          />

          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-3 rounded-2xl border transition ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isListening ? 'ভয়েস ইনপুট বন্ধ করুন' : 'ভয়েস কমান্ড দিন'}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Submit button */}
          <button
            type="button"
            onClick={() => handleExecuteCommand()}
            disabled={isProcessing || !inputCommand.trim()}
            className={`font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition shadow-xl text-white flex items-center gap-2 flex-shrink-0 disabled:opacity-50 bg-gradient-to-r ${activeTheme.gradientClass}`}
          >
            {isProcessing ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                বাস্তবায়ন হচ্ছে...
              </span>
            ) : (
              <>
                <span>কমান্ড চালান</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Output Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-slate-200 font-bold font-mono">OmniMind Quantum Terminal Execution Stream</span>
          </div>
          <span className="text-[11px] font-bold" style={{ color: activeTheme.lightHex }}>
            Google Gemini 3.8 Flash • Quantum Core Online
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[600px] overflow-y-auto font-sans">
          {history.map((item) => (
            <div key={item.id} className="space-y-3 border-b border-slate-800/60 pb-6 last:border-0 last:pb-0">
              {/* Command input prompt line */}
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-sm mt-0.5" style={{ color: activeTheme.lightHex }}>❯</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{item.command}</p>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* AI Thought reasoning stream */}
              {item.thoughtBengali && (
                <div className="ml-5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[11px]" style={{ color: activeTheme.lightHex }}>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>এআই কোয়ান্টাম নিউরাল চিন্তাভাবনা ও কমান্ড বিশ্লেষণ:</span>
                  </div>
                  <p className="leading-relaxed text-slate-400">{item.thoughtBengali}</p>
                </div>
              )}

              {/* Execution Summary Output */}
              {item.executionSummary && (
                <div className="ml-5 p-4 rounded-2xl bg-slate-900/80 border text-slate-200 text-sm leading-relaxed"
                     style={{ borderColor: `${activeTheme.hex}30` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: activeTheme.lightHex }}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      কমান্ড ফলাফল ও স্থিতি
                    </span>
                    <button
                      onClick={() => soundFx.speakBengaliAlert(item.executionSummary || '')}
                      className="text-slate-400 hover:text-white p-1 transition"
                      title="ভয়েসে শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p>{item.executionSummary}</p>
                </div>
              )}

              {/* Interactive App Creation Card if generated! */}
              {item.appCreated && (
                <div className="ml-5 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border shadow-2xl space-y-3"
                     style={{ borderColor: activeTheme.hex }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-400" />
                      <h4 className="font-extrabold text-white text-base">{item.appCreated.title}</h4>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono border"
                          style={{ backgroundColor: `${activeTheme.hex}20`, borderColor: activeTheme.hex, color: activeTheme.lightHex }}>
                      ইন-ব্রাউজার স্যান্ডবক্স লাইভ
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{item.appCreated.description}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => onOpenAppSandbox(item.appCreated.id)}
                      className={`text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg bg-gradient-to-r ${activeTheme.gradientClass}`}
                    >
                      <span>সরাসরি অ্যাপটি চালান ও ব্যবহার করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      গিটহ্যাব ছাড়াই ১০০% সক্রিয়
                    </span>
                  </div>
                </div>
              )}

              {/* Caller Lookup Intel Card if generated! */}
              {item.callerData && (
                <div className="ml-5 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <PhoneCall className="w-5 h-5" />
                      <span>কলার ট্র্যাকিং রিপোর্ট: {item.callerData.phoneNumber}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      item.callerData.riskLevel === 'High Risk'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {item.callerData.riskLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">সম্ভাব্য কলার:</span>
                      <span className="font-bold text-white">{item.callerData.name}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">অঞ্চল ও অবস্থান:</span>
                      <span className="font-semibold text-slate-200">{item.callerData.location}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">টেলিকম ক্যারিয়ার:</span>
                      <span className="font-semibold text-cyan-300">{item.callerData.carrier}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">স্প্যাম স্কোর:</span>
                      <span className="font-bold text-amber-400">{item.callerData.spamScore}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('caller')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>কলার ট্র্যাকার ট্যাবে বিস্তারিত ও সিমুলেশন দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="ml-5 p-4 rounded-2xl bg-slate-900 border text-xs flex items-center gap-3 animate-pulse"
                 style={{ borderColor: activeTheme.hex, color: activeTheme.lightHex }}>
              <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: activeTheme.hex }}></span>
              <span>ওমনিমাইন্ড কোয়ান্টাম এআই নির্দেশটি বিশ্লেষণ ও বাস্তবায়ন করছে...</span>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};

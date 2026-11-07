import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Search, 
  MapPin, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Volume2, 
  PhoneIncoming, 
  PhoneOff, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Clock, 
  History 
} from 'lucide-react';
import { CallerRecord, UserSession } from '../types';
import { soundFx } from '../utils/audio';

interface CallerTrackerProps {
  currentUser: UserSession | null;
}

export const CallerTracker: React.FC<CallerTrackerProps> = ({ currentUser }) => {
  const [phoneNumber, setPhoneNumber] = useState('+8801712345678');
  const [isSearching, setIsSearching] = useState(false);
  const [currentResult, setCurrentResult] = useState<CallerRecord | null>(null);
  const [history, setHistory] = useState<CallerRecord[]>([]);

  // Simulation state for incoming call overlay
  const [simulatingCall, setSimulatingCall] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/caller/history');
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
        if (!currentResult && data.history.length > 0) {
          setCurrentResult(data.history[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Timer for active answered call
  useEffect(() => {
    let interval: any = null;
    if (callAnswered) {
      interval = setInterval(() => {
        setCallTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callAnswered]);

  const handleLookup = async (e?: React.FormEvent, customNum?: string) => {
    if (e) e.preventDefault();
    const num = (customNum || phoneNumber).trim();
    if (!num || isSearching) return;

    setIsSearching(true);
    soundFx.playBeep(850, 0.08);

    try {
      const res = await fetch('/api/caller/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'কলার খুঁজে পাওয়া যায়নি');

      setCurrentResult(data.caller);
      soundFx.playBeep(1100, 0.15);
      fetchHistory();

      // Automatically announce in Bengali
      if (data.caller.audioSpeechText) {
        soundFx.speakBengaliAlert(data.caller.audioSpeechText);
      }
    } catch (err: any) {
      soundFx.playBeep(300, 0.2);
      alert(`অনুসন্ধান ব্যর্থ: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTriggerSimulation = () => {
    const target = currentResult || {
      id: 'sim_001',
      phoneNumber: '+8801712345678',
      name: 'মোহাম্মদ রফিকুল ইসলাম (ব্যবসা পরিচালক)',
      location: 'গুলশান-২, ঢাকা, বাংলাদেশ',
      carrier: 'Grameenphone 4G LTE',
      spamScore: 4,
      callType: 'Business' as const,
      riskLevel: 'Safe' as const,
      lastLookedUp: new Date().toISOString(),
      notes: 'ভেরিফায়েড কলার',
      audioSpeechText: 'সতর্কতা! ঢাকা গুলশান থেকে গ্রামীণফোন নম্বর থেকে কল আসছে, কলার মোহাম্মদ রফিকুল ইসলাম, স্ট্যাটাস নিরাপদ।',
    };

    setSimulatingCall(true);
    setCallAnswered(false);
    setCallTimer(0);

    // Play ringtone and voice announcement
    soundFx.playRingtone();
    setTimeout(() => {
      soundFx.speakBengaliAlert(target.audioSpeechText);
    }, 1200);
  };

  const handleAnswerCall = () => {
    soundFx.playBeep(1000, 0.1);
    setCallAnswered(true);
  };

  const handleEndCall = () => {
    soundFx.playBeep(450, 0.15);
    setSimulatingCall(false);
    setCallAnswered(false);
    setCallTimer(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 p-6 sm:p-8 glow-cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>টেলিকম ও স্যাটেলাইট সিগন্যাল ট্রায়াংগুলেশন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              স্মার্ট কলার আইডি ও অজানা নম্বর জিও-লোকেশন ট্র্যাকার
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              অচেনা নম্বর থেকে কল এলেই এআই তাৎক্ষণিকভাবে বলে দেবে—এটা কোন লোকেশন থেকে, কোন ব্যক্তি এবং কোন অপারেটর থেকে ফোন দিচ্ছে। সাথে সাথে ভয়েসে বাংলায় ঘোষণা করে সতর্ক করবে।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerSimulation}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-cyan-950 flex items-center gap-2 animate-pulse"
            >
              <PhoneIncoming className="w-4 h-4" />
              <span>ইনকামিং কল সিমুলেশন চালান</span>
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleLookup} className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="যেকোনো মোবাইল নম্বর লিখুন (যেমন: 01712345678 বা 01987654321)..."
              className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !phoneNumber.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-2xl text-sm transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                স্ক্যান হচ্ছে...
              </span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>পরিচয় ও লোকেশন খুঁজুন</span>
              </>
            )}
          </button>
        </form>

        {/* Quick sample numbers */}
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <span className="text-slate-500 self-center">টেস্ট নম্বর:</span>
          {[
            { num: '+8801712345678', label: 'গ্রামীণফোন (ঢাকা গুলশান - সেফ)' },
            { num: '+8801987654321', label: 'বাংলালিংক (মিরপুর - সন্দেহভাজন লটারি)' },
            { num: '+8801819998877', label: 'রবি (চট্টগ্রাম আগ্রাবাদ)' },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPhoneNumber(item.num);
                handleLookup(undefined, item.num);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition"
            >
              {item.num} ({item.label})
            </button>
          ))}
        </div>
      </div>

      {/* Main Results Showcase & Map Radar */}
      {currentResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Detailed Telecom Intel Sheet */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 block mb-1">যাচাইকৃত কলার প্রোফাইল</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">{currentResult.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{currentResult.phoneNumber}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    currentResult.riskLevel === 'High Risk'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : currentResult.riskLevel === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {currentResult.riskLevel === 'Safe' ? 'নিরাপদ কলার' : currentResult.riskLevel}
                </span>

                <button
                  onClick={() => soundFx.speakBengaliAlert(currentResult.audioSpeechText)}
                  className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="ভয়েসে শুনুন"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ভয়েসে শুনুন</span>
                </button>
              </div>
            </div>

            {/* Grid of verified parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  ভৌগোলিক অঞ্চল ও অবস্থান
                </span>
                <p className="text-sm font-bold text-slate-200">{currentResult.location}</p>
                <span className="text-[10px] text-slate-500 font-mono block">GPS ট্রায়াংগুলেশন সক্রিয়</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  টেলিকম নেটওয়ার্ক ও ক্যারিয়ার
                </span>
                <p className="text-sm font-bold text-cyan-300">{currentResult.carrier}</p>
                <span className="text-[10px] text-slate-500 font-mono block">4G LTE ভয়েস চ্যানেল</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  কলের ধরণ (Category)
                </span>
                <p className="text-sm font-bold text-white">{currentResult.callType}</p>
                <span className="text-[10px] text-slate-500 font-mono block">স্বয়ংক্রিয় ক্লাউড রেটিং</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  স্প্যাম সম্ভাবনা স্কোর
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        currentResult.spamScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${currentResult.spamScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-white">{currentResult.spamScore}%</span>
                </div>
              </div>
            </div>

            {/* AI Contextual Speech Text & Safety Note */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                স্বয়ংক্রিয় এআই ভয়েস অ্যানাউন্সমেন্ট টেক্সট:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{currentResult.audioSpeechText}"
              </p>
            </div>
          </div>

          {/* Right Col: Satellite Simulated Radar Map */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-white mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                স্যাটেলাইট ম্যাপ ও সিগন্যাল রাডার
              </h4>
              <p className="text-xs text-slate-400">
                নিকটতম বিটিএস (BTS) মোবাইল টাওয়ারের সাথে দূরত্ব ও জিপিএস স্থানাঙ্ক।
              </p>
            </div>

            {/* Radar visualizer circle */}
            <div className="relative w-48 h-48 mx-auto rounded-full border-2 border-cyan-500/30 bg-slate-950 flex items-center justify-center overflow-hidden my-4 shadow-inner">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 m-6"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-500/10 m-14"></div>
              {/* Radar sweep */}
              <div className="absolute inset-0 animate-radar origin-center bg-gradient-to-r from-transparent via-cyan-500/10 to-cyan-500/25 pointer-events-none"></div>

              {/* Center blip */}
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400 animate-ping"></div>

              {/* Coordinates label */}
              <div className="absolute bottom-2 text-[9px] font-mono text-cyan-300/80 bg-slate-900/90 px-2 py-0.5 rounded">
                23.8103° N, 90.4125° E
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>সিগন্যাল বিলম্ব:</span>
                <span className="text-emerald-400 font-bold">14 ms</span>
              </div>
              <div className="flex justify-between">
                <span>টাওয়ার আইডি:</span>
                <span className="text-slate-300">BTS-DHK-GUL-44</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          পূর্ববর্তী অনুসন্ধান ও ট্রেস রেকর্ডসমূহ ({history.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3">মোবাইল নম্বর</th>
                <th className="pb-3">শনাক্তকৃত নাম</th>
                <th className="pb-3">অবস্থান</th>
                <th className="pb-3">অপারেটর</th>
                <th className="pb-3">ঝুঁকি স্তর</th>
                <th className="pb-3 text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {history.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-850/40">
                  <td className="py-3 pr-2 font-mono text-cyan-300 font-bold">{rec.phoneNumber}</td>
                  <td className="py-3 pr-2 font-bold text-white">{rec.name}</td>
                  <td className="py-3 pr-2 text-slate-300">{rec.location}</td>
                  <td className="py-3 pr-2 text-slate-400">{rec.carrier}</td>
                  <td className="py-3 pr-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.riskLevel === 'High Risk'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {rec.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setCurrentResult(rec);
                        soundFx.speakBengaliAlert(rec.audioSpeechText);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      বিস্তারিত দেখুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Incoming Call Simulation Modal */}
      {simulatingCall && currentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500 rounded-3xl p-6 text-center shadow-2xl glow-cyan space-y-6">
            <div className="space-y-2">
              <span className="inline-block text-xs uppercase font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                {callAnswered ? 'কল চালু আছে...' : 'ইনকামিং কল সতর্কবার্তা'}
              </span>
              <h3 className="text-2xl font-black text-white">{currentResult.name}</h3>
              <p className="text-sm text-cyan-400 font-mono">{currentResult.phoneNumber}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {currentResult.location}
              </p>
              <p className="text-xs text-slate-500 font-mono">{currentResult.carrier}</p>
            </div>

            {/* Profile Avatar with Radar Rings */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl border-4 border-slate-900">
                {currentResult.name[0]}
              </div>
            </div>

            {callAnswered ? (
              <div className="space-y-4">
                <div className="text-sm font-mono text-emerald-400 font-bold">
                  {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}
                </div>
                <button
                  onClick={handleEndCall}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>কল শেষ করুন</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-around gap-4 pt-2">
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-950 transition"
                  title="কল বাতিল করুন"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                <button
                  onClick={handleAnswerCall}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-950 transition animate-bounce"
                  title="কল রিসিভ করুন"
                >
                  <PhoneIncoming className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

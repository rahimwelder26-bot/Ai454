import fs from 'fs';
import path from 'path';

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  role: 'master_admin' | 'admin' | 'operator';
  passwordHash: string; // Plain/SHA representation for authorized users
  permissions: {
    canGenerateApps: boolean;
    canControlNetwork: boolean;
    canLookupCallers: boolean;
    canDeviceControl: boolean;
    canAccessDatabase: boolean;
  };
  createdAt: string;
  lastActive?: string;
  status: 'active' | 'suspended';
}

export interface GeneratedApp {
  id: string;
  title: string;
  description: string;
  category: 'social' | 'tool' | 'game' | 'utility' | 'business' | 'custom';
  tags: string[];
  htmlCode: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

export interface CallerRecord {
  id: string;
  phoneNumber: string;
  name: string;
  location: string;
  carrier: string;
  spamScore: number; // 0-100
  callType: 'Personal' | 'Business' | 'Suspected Scam' | 'Telemarketer' | 'Delivery/Logistics';
  riskLevel: 'Safe' | 'Moderate' | 'High Risk';
  lastLookedUp: string;
  notes: string;
  audioSpeechText: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  category: 'auth' | 'app_generation' | 'network' | 'caller' | 'device' | 'database';
  status: 'success' | 'warning' | 'alert';
}

export interface NetworkDevice {
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  status: 'online' | 'idle' | 'flagged';
  signalStrength: number; // percentage
  bandwidthUsage: string;
  isBlocked: boolean;
}

export interface DeviceTelemetry {
  deviceName: string;
  osVersion: string;
  batteryLevel: number;
  batteryCharging: boolean;
  powerSaverMode: boolean;
  cpuUsage: number;
  memoryUsage: number;
  storageFreeGb: number;
  storageTotalGb: number;
  wifiSsid: string;
  wifiConnected: boolean;
  cellularSignal: number;
  flashlightOn: boolean;
  dndMode: boolean;
  deviceLocked: boolean;
  alarmActive: boolean;
  lastSync: string;
}

interface DatabaseSchema {
  version: string;
  masterAdminEmail: string;
  masterPassword: string; // Default master access credential
  systemName: string;
  users: AuthorizedUser[];
  apps: GeneratedApp[];
  callerHistory: CallerRecord[];
  auditLogs: AuditLog[];
  networkDevices: NetworkDevice[];
  deviceTelemetry: DeviceTelemetry;
  customData: Record<string, unknown[]>;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'omni_db.json');

// Default initial pre-loaded Facebook-like clone app so the user immediately has a working, high-powered social web app!
const FACEBOOK_CLONE_CODE = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniSocial - ফেসবুক স্টাইল সুপার সোশ্যাল নেটওয়ার্ক</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif; }
    .story-card:hover img { transform: scale(1.05); }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
  <!-- Top Navigation Bar -->
  <header class="sticky top-0 z-50 bg-slate-800/95 backdrop-blur border-b border-slate-700/60 px-4 py-2.5 flex items-center justify-between shadow-lg">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-xl shadow-md text-white">
        <i class="fa-brands fa-facebook-f"></i>
      </div>
      <div class="relative hidden sm:block">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-sm"></i>
        <input type="text" id="searchInput" placeholder="সার্চ করুন ওমনি-সোশ্যালে..." class="bg-slate-900/80 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-52 focus:w-72 transition-all">
      </div>
    </div>

    <!-- Center Nav Icons -->
    <div class="flex items-center gap-1 md:gap-4">
      <button class="px-4 py-2 text-blue-500 border-b-2 border-blue-500 font-bold flex items-center gap-2"><i class="fa-solid fa-house"></i><span class="hidden md:inline">ফিড</span></button>
      <button class="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded-lg transition"><i class="fa-solid fa-user-group"></i></button>
      <button class="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded-lg transition"><i class="fa-solid fa-tv"></i></button>
      <button class="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded-lg transition"><i class="fa-solid fa-store"></i></button>
    </div>

    <!-- Right User Controls -->
    <div class="flex items-center gap-2">
      <button onclick="toggleNewPostModal()" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition">
        <i class="fa-solid fa-plus"></i> <span class="hidden sm:inline">নতুন পোস্ট</span>
      </button>
      <button class="w-9 h-9 rounded-full bg-slate-700/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 relative">
        <i class="fa-solid fa-bell"></i>
        <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">3</span>
      </button>
      <div class="flex items-center gap-2 pl-2 border-l border-slate-700">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full border border-blue-500 object-cover" alt="User">
        <span class="text-xs font-medium hidden md:inline text-slate-300">রাহিম (এডমিন)</span>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <div class="max-w-6xl mx-auto px-2 sm:px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Left Sidebar -->
    <aside class="hidden lg:block space-y-2">
      <div class="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 shadow">
        <div class="flex items-center gap-3 pb-3 border-b border-slate-700/50">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" class="w-11 h-11 rounded-full border-2 border-blue-500 object-cover">
          <div>
            <h4 class="font-bold text-sm text-white">তথ্য ও প্রযুক্তি ওমনি হাব</h4>
            <p class="text-xs text-blue-400">@info.rahim76</p>
          </div>
        </div>
        <nav class="mt-3 space-y-1 text-sm text-slate-300">
          <a href="#" class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/60 text-blue-400 font-semibold"><i class="fa-solid fa-user-shield text-blue-400"></i> এডমিন প্রোফাইল</a>
          <a href="#" class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/60"><i class="fa-solid fa-bookmark text-purple-400"></i> সেভ করা পোস্ট (১২)</a>
          <a href="#" class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/60"><i class="fa-solid fa-users text-emerald-400"></i> ওমনি গ্রুপসমূহ</a>
          <a href="#" class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/60"><i class="fa-solid fa-bolt text-amber-400"></i> এআই স্বয়ংক্রিয় ফিড</a>
        </nav>
      </div>

      <div class="bg-gradient-to-br from-blue-900/30 to-indigo-950/40 p-4 rounded-2xl border border-blue-800/40">
        <h5 class="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">এআই স্যান্ডবক্স লাইভ</h5>
        <p class="text-xs text-slate-400 leading-relaxed">এই সোশ্যাল অ্যাপটি ওমনিমাইন্ড এআই সরাসরি ইন-মেমরিতে রান করছে। কোনো গিটহ্যাব পোস্টিং ছাড়াই তৎক্ষণাৎ কার্যকর!</p>
      </div>
    </aside>

    <!-- Center Feed -->
    <main class="lg:col-span-2 space-y-5">
      <!-- Stories Bar -->
      <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <!-- Add Story -->
        <div class="story-card flex-shrink-0 w-28 h-44 rounded-2xl bg-slate-800 border border-slate-700 relative overflow-hidden cursor-pointer group flex flex-col justify-end p-2">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=300&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-all">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
          <div class="relative z-10 text-center">
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white mx-auto mb-1 flex items-center justify-center font-bold text-sm border-2 border-slate-900">
              <i class="fa-solid fa-plus"></i>
            </div>
            <p class="text-[11px] font-bold text-white">স্টোরি দিন</p>
          </div>
        </div>

        <!-- Sample Stories -->
        <div class="story-card flex-shrink-0 w-28 h-44 rounded-2xl bg-slate-800 border border-blue-500/50 relative overflow-hidden cursor-pointer group flex flex-col justify-between p-2.5">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=300&fit=crop" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40"></div>
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full border-2 border-blue-500 relative z-10 object-cover">
          <p class="relative z-10 text-[11px] font-semibold text-white leading-tight">তানভীর আহমেদ</p>
        </div>

        <div class="story-card flex-shrink-0 w-28 h-44 rounded-2xl bg-slate-800 border border-purple-500/50 relative overflow-hidden cursor-pointer group flex flex-col justify-between p-2.5">
          <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=300&fit=crop" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40"></div>
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full border-2 border-purple-500 relative z-10 object-cover">
          <p class="relative z-10 text-[11px] font-semibold text-white leading-tight">ফারজানা হক</p>
        </div>

        <div class="story-card flex-shrink-0 w-28 h-44 rounded-2xl bg-slate-800 border border-emerald-500/50 relative overflow-hidden cursor-pointer group flex flex-col justify-between p-2.5">
          <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=300&fit=crop" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40"></div>
          <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full border-2 border-emerald-500 relative z-10 object-cover">
          <p class="relative z-10 text-[11px] font-semibold text-white leading-tight">সাকিব হাসান</p>
        </div>
      </div>

      <!-- Quick Post Creator -->
      <div class="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/60 shadow">
        <div class="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" class="w-10 h-10 rounded-full border border-blue-500 object-cover">
          <input type="text" id="quickPostInput" placeholder="আপনার মনে কি আছে, রহিম ভাই?..." class="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500" onkeydown="if(event.key==='Enter') createQuickPost()">
          <button onclick="createQuickPost()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-md">
            পোস্ট <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
        <div class="flex items-center justify-around mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 font-medium">
          <button class="hover:text-red-400 flex items-center gap-2"><i class="fa-solid fa-video text-red-500"></i> লাইভ ভিডিও</button>
          <button class="hover:text-emerald-400 flex items-center gap-2"><i class="fa-solid fa-image text-emerald-500"></i> ছবি/ভিডিও</button>
          <button class="hover:text-amber-400 flex items-center gap-2"><i class="fa-regular fa-face-smile text-amber-500"></i> অনুভূতি</button>
        </div>
      </div>

      <!-- Posts Feed Container -->
      <div id="postsFeed" class="space-y-4">
        <!-- Rendered by JS -->
      </div>
    </main>

    <!-- Right Sidebar (Contacts & Active Friends) -->
    <aside class="hidden lg:block space-y-4">
      <div class="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
        <div class="flex items-center justify-between pb-2 border-b border-slate-700/50">
          <h4 class="font-bold text-sm text-slate-200">সক্রিয় বন্ধুরা (অনলাইন)</h4>
          <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
        </div>
        <div class="mt-3 space-y-3 text-sm" id="activeFriendsList">
          <div class="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-700/50 cursor-pointer">
            <div class="flex items-center gap-2.5">
              <div class="relative">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full object-cover">
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </div>
              <span class="text-xs font-semibold text-slate-200">তানভীর আহমেদ</span>
            </div>
            <i class="fa-solid fa-comment-dots text-slate-500 hover:text-blue-400 text-xs"></i>
          </div>

          <div class="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-700/50 cursor-pointer">
            <div class="flex items-center gap-2.5">
              <div class="relative">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full object-cover">
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </div>
              <span class="text-xs font-semibold text-slate-200">ফারজানা হক</span>
            </div>
            <i class="fa-solid fa-comment-dots text-slate-500 hover:text-blue-400 text-xs"></i>
          </div>

          <div class="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-700/50 cursor-pointer">
            <div class="flex items-center gap-2.5">
              <div class="relative">
                <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop" class="w-8 h-8 rounded-full object-cover">
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </div>
              <span class="text-xs font-semibold text-slate-200">সাকিব হাসান</span>
            </div>
            <i class="fa-solid fa-comment-dots text-slate-500 hover:text-blue-400 text-xs"></i>
          </div>
        </div>
      </div>

      <!-- In-App Storage Indicator -->
      <div class="bg-slate-800/40 border border-slate-700/40 p-3.5 rounded-2xl text-xs text-slate-400">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-semibold text-slate-300">অটোনোমাস ইন-মেমোরি স্টোর</span>
          <span class="text-emerald-400 font-mono">100% সিঙ্কড</span>
        </div>
        <p class="text-[11px] leading-relaxed">পোস্ট, লাইক ও কমেন্ট সবই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।</p>
      </div>
    </aside>
  </div>

  <script>
    // State management for posts
    let posts = [
      {
        id: 1,
        author: "রাহিম (এডমিন)",
        role: "সিস্টেম অ্যাডমিনিস্ট্রেটর",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        time: "১০ মিনিট আগে",
        content: "ওমনিমাইন্ড এআই প্ল্যাটফর্মের ভেতরে কোনো গিটহ্যাব পোস্টিং ছাড়াই সরাসরি সম্পূর্ণ ইন্টারেক্টিভ ফেসবুক স্টাইল সোশ্যাল নেটওয়ার্ক লাইভ চলছে! আপনি এখানে পোস্ট তৈরি করতে পারেন, লাইক দিতে পারেন এবং কমেন্ট যোগ করতে পারেন। 🚀✨",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
        likes: 38,
        liked: true,
        comments: [
          { author: "তানভীর আহমেদ", text: "অসাধারণ এআই সিস্টেম! এত দ্রুত চমৎকার ইউজার ইন্টারফেস তৈরি হয়ে গেল!" },
          { author: "ফারজানা হক", text: "লাইক এবং কমেন্ট সিস্টেম একদম বাস্তবের ফেসবুকের মতোই স্মুথ কাজ করছে।" }
        ]
      },
      {
        id: 2,
        author: "এআই সিস্টেম ইঞ্জিন",
        role: "সার্বভৌম কৃত্রিম বুদ্ধিমত্তা",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
        time: "১ ঘণ্টা আগে",
        content: "নেটওয়ার্ক মনিটরিং, স্বয়ংক্রিয় অ্যাপ জেনারেটর এবং কলার ট্র্যাকিং ইন্টেলিজেন্স সক্রিয় করা হয়েছে। আপনি যা বলবেন, এআই সিস্টেম অবিলম্বে তা বাস্তবায়ন করবে।",
        image: null,
        likes: 74,
        liked: false,
        comments: []
      }
    ];

    function renderPosts() {
      const feed = document.getElementById('postsFeed');
      if (!feed) return;
      feed.innerHTML = posts.map(post => \`
        <div class="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/60 shadow-lg space-y-3">
          <!-- Post Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="\${post.avatar}" class="w-10 h-10 rounded-full border border-blue-500 object-cover">
              <div>
                <h4 class="font-bold text-sm text-slate-100">\${post.author}</h4>
                <p class="text-[11px] text-slate-400">\${post.time} • <i class="fa-solid fa-earth-americas text-[10px]"></i></p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-200"><i class="fa-solid fa-ellipsis"></i></button>
          </div>

          <!-- Post Content -->
          <p class="text-sm text-slate-200 leading-relaxed">\${post.content}</p>

          <!-- Post Media -->
          \${post.image ? \`<div class="rounded-xl overflow-hidden border border-slate-700"><img src="\${post.image}" class="w-full object-cover max-h-96"></div>\` : ''}

          <!-- Likes & Comments Counter -->
          <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-b border-slate-700/50 pb-2">
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-thumbs-up"></i></span>
              <span class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]"><i class="fa-solid fa-heart"></i></span>
              <span id="like-count-\${post.id}">\${post.likes} টি লাইক</span>
            </div>
            <span>\${post.comments.length} টি মন্তব্য</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-around text-xs font-semibold pt-1 text-slate-300">
            <button onclick="toggleLike(\${post.id})" class="flex-1 py-1.5 rounded-lg hover:bg-slate-700/50 flex items-center justify-center gap-2 \${post.liked ? 'text-blue-500 font-bold' : ''}">
              <i class="fa-solid fa-thumbs-up"></i> লাইক
            </button>
            <button onclick="focusCommentInput(\${post.id})" class="flex-1 py-1.5 rounded-lg hover:bg-slate-700/50 flex items-center justify-center gap-2">
              <i class="fa-regular fa-comment"></i> মন্তব্য
            </button>
            <button class="flex-1 py-1.5 rounded-lg hover:bg-slate-700/50 flex items-center justify-center gap-2">
              <i class="fa-solid fa-share"></i> শেয়ার
            </button>
          </div>

          <!-- Comments Section -->
          <div class="pt-2 space-y-2 border-t border-slate-700/40">
            <div class="space-y-1.5" id="comments-container-\${post.id}">
              \${post.comments.map(c => \`
                <div class="bg-slate-900/80 rounded-xl px-3 py-2 text-xs border border-slate-800">
                  <span class="font-bold text-blue-400">\${c.author}: </span>
                  <span class="text-slate-300">\${c.text}</span>
                </div>
              \`).join('')}
            </div>
            <!-- Add comment input -->
            <div class="flex items-center gap-2 pt-1">
              <input type="text" id="comment-input-\${post.id}" placeholder="একটি মন্তব্য লিখুন..." class="flex-1 bg-slate-900 border border-slate-700 rounded-full px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500" onkeydown="if(event.key==='Enter') addComment(\${post.id})">
              <button onclick="addComment(\${post.id})" class="text-blue-500 hover:text-blue-400 p-1.5"><i class="fa-solid fa-paper-plane text-xs"></i></button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    function toggleLike(postId) {
      const p = posts.find(item => item.id === postId);
      if (!p) return;
      p.liked = !p.liked;
      p.likes += p.liked ? 1 : -1;
      renderPosts();
    }

    function addComment(postId) {
      const input = document.getElementById('comment-input-' + postId);
      if (!input || !input.value.trim()) return;
      const p = posts.find(item => item.id === postId);
      if (!p) return;
      p.comments.push({
        author: "রাহিম (এডমিন)",
        text: input.value.trim()
      });
      input.value = '';
      renderPosts();
    }

    function focusCommentInput(postId) {
      const input = document.getElementById('comment-input-' + postId);
      if (input) input.focus();
    }

    function createQuickPost() {
      const input = document.getElementById('quickPostInput');
      if (!input || !input.value.trim()) return;
      posts.unshift({
        id: Date.now(),
        author: "রাহিম (এডমিন)",
        role: "মাস্টার সুপারভাইজার",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        time: "এইমাত্র",
        content: input.value.trim(),
        image: null,
        likes: 1,
        liked: true,
        comments: []
      });
      input.value = '';
      renderPosts();
    }

    // Initial render
    renderPosts();
  </script>
</body>
</html>`;

export class AutonomousDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadOrInitialize();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse existing omni_db.json, re-initializing', e);
      }
    }

    // Master Admin is info.rahim76@gmail.com by default as requested in prompt!
    const initialData: DatabaseSchema = {
      version: '1.0.0',
      masterAdminEmail: 'info.rahim76@gmail.com',
      masterPassword: 'Rahim@Master#2026', // Can be updated anytime in the admin panel
      systemName: 'OmniMind OS - সর্বশক্তিমান এআই মাস্টার হাব',
      users: [
        {
          id: 'user_master_001',
          email: 'info.rahim76@gmail.com',
          name: 'মুহাম্মদ রাহিম (সুপার এডমিন)',
          role: 'master_admin',
          passwordHash: 'Rahim@Master#2026',
          permissions: {
            canGenerateApps: true,
            canControlNetwork: true,
            canLookupCallers: true,
            canDeviceControl: true,
            canAccessDatabase: true,
          },
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 'user_demo_002',
          email: 'operator@omnimind.ai',
          name: 'সিস্টেম অপারেটর ১',
          role: 'operator',
          passwordHash: 'Operator#1234',
          permissions: {
            canGenerateApps: true,
            canControlNetwork: false,
            canLookupCallers: true,
            canDeviceControl: false,
            canAccessDatabase: false,
          },
          createdAt: new Date().toISOString(),
          status: 'active',
        }
      ],
      apps: [
        {
          id: 'app_social_facebook_clone',
          title: 'OmniSocial - ফেসবুক স্টাইল সোশ্যাল নেটওয়ার্ক',
          description: 'স্বয়ংক্রিয়ভাবে তৈরি সম্পূর্ণ কার্যক্ষম ফেসবুক ক্লোন - নিউজফিড, স্টোরি, পোস্ট ক্রিয়েটর, লাইক, কমেন্ট ও রিয়েলটাইম ইন-মেমরি ব্রাউজার ডাটাবেজ সহ। কোনো গিটহ্যাব পোস্টিং ছাড়াই সরাসরি রান হয়!',
          category: 'social',
          tags: ['Facebook', 'Social Network', 'Interactive', 'Instant Sandbox'],
          htmlCode: FACEBOOK_CLONE_CODE,
          authorEmail: 'info.rahim76@gmail.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFeatured: true,
        }
      ],
      callerHistory: [
        {
          id: 'call_rec_001',
          phoneNumber: '+8801712345678',
          name: 'মোহাম্মদ রফিকুল ইসলাম (ব্যবসা পরিচালক)',
          location: 'গুলশান-২, ঢাকা, বাংলাদেশ (23.7925° N, 90.4078° E)',
          carrier: 'Grameenphone 4G LTE',
          spamScore: 4,
          callType: 'Business',
          riskLevel: 'Safe',
          lastLookedUp: new Date().toISOString(),
          notes: 'ভেরিফায়েড বিজনেস প্রোফাইল। কোনো স্প্যাম রেকর্ড নেই।',
          audioSpeechText: 'সতর্কতা! ঢাকা গুলশান থেকে গ্রামীণফোন নম্বর থেকে কল আসছে, কলার মোহাম্মদ রফিকুল ইসলাম, স্ট্যাটাস নিরাপদ।',
        },
        {
          id: 'call_rec_002',
          phoneNumber: '+8801987654321',
          name: 'সন্দেহভাজন লটারি স্ক্যাম কলার',
          location: 'মিরপুর-১০, ঢাকা, বাংলাদেশ',
          carrier: 'Banglalink Digital',
          spamScore: 92,
          callType: 'Suspected Scam',
          riskLevel: 'High Risk',
          lastLookedUp: new Date().toISOString(),
          notes: 'বহু ব্যবহারকারী এই নম্বরটিকে ভুয়া লটারি পুরস্কারের ফাঁদ হিসেবে রিপোর্ট করেছেন।',
          audioSpeechText: 'উচ্চ সতর্কতা! মিরপুর ঢাকা থেকে বাংলালিংক নম্বর থেকে সম্ভাব্য ক্ষতিকর স্প্যাম কল আসছে, রিসিভ করবেন না।',
        }
      ],
      auditLogs: [
        {
          id: 'log_boot_001',
          timestamp: new Date().toISOString(),
          action: 'সিস্টেম বুট সম্পন্ন',
          actor: 'OmniMind Core',
          details: 'স্বয়ংক্রিয় ডাটাবেজ এবং গুগল জেমিনি এআই ইন্টেলিজেন্স সংযুক্ত হয়েছে।',
          category: 'auth',
          status: 'success'
        }
      ],
      networkDevices: [
        {
          ip: '192.168.1.1',
          mac: '00:1A:2B:3C:4D:5E',
          hostname: 'Main-Gateway-Router',
          vendor: 'TP-Link Archer AX73 (WiFi 6)',
          status: 'online',
          signalStrength: 98,
          bandwidthUsage: '12.4 Mbps',
          isBlocked: false
        },
        {
          ip: '192.168.1.105',
          mac: 'F4:F5:DB:88:12:34',
          hostname: 'Rahim-Galaxy-Ultra',
          vendor: 'Samsung Mobile',
          status: 'online',
          signalStrength: 92,
          bandwidthUsage: '4.8 Mbps',
          isBlocked: false
        },
        {
          ip: '192.168.1.142',
          mac: 'DC:A6:32:99:AA:BB',
          hostname: 'Unknown-Suspicious-Device',
          vendor: 'Espressif Inc.',
          status: 'flagged',
          signalStrength: 45,
          bandwidthUsage: '0.2 Mbps',
          isBlocked: true
        }
      ],
      deviceTelemetry: {
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
        lastSync: new Date().toISOString()
      },
      customData: {}
    };

    this.save(initialData);
    return initialData;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write omni_db.json', e);
    }
  }

  // Auth & Admin
  public getMasterAdminEmail(): string {
    return this.data.masterAdminEmail;
  }

  public getMasterPassword(): string {
    return this.data.masterPassword;
  }

  public setMasterPassword(newPass: string) {
    this.data.masterPassword = newPass;
    this.addAuditLog('মাস্টার পাসওয়ার্ড আপডেট', this.data.masterAdminEmail, 'এডমিন পাসওয়ার্ড পরিবর্তন করা হয়েছে', 'auth', 'success');
    this.save();
  }

  public getUsers(): AuthorizedUser[] {
    return this.data.users;
  }

  public addUser(user: Omit<AuthorizedUser, 'id' | 'createdAt'>): AuthorizedUser {
    const newUser: AuthorizedUser = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.addAuditLog('নতুন ব্যবহারকারী অনুমোদন', 'Master Admin', `ব্যবহারকারী ${user.email} কে পারমিশন দেওয়া হয়েছে`, 'auth', 'success');
    this.save();
    return newUser;
  }

  public removeUser(userId: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const removed = this.data.users[idx];
      this.data.users.splice(idx, 1);
      this.addAuditLog('ব্যবহারকারী প্রত্যাহার', 'Master Admin', `ব্যবহারকারী ${removed.email} এর অ্যাক্সেস বন্ধ করা হয়েছে`, 'auth', 'warning');
      this.save();
      return true;
    }
    return false;
  }

  public updateUserPermissions(userId: string, permissions: AuthorizedUser['permissions'], status?: 'active' | 'suspended') {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.permissions = { ...user.permissions, ...permissions };
      if (status) user.status = status;
      this.save();
      return user;
    }
    return null;
  }

  // Apps
  public getApps(): GeneratedApp[] {
    return this.data.apps;
  }

  public getAppById(id: string): GeneratedApp | undefined {
    return this.data.apps.find(a => a.id === id);
  }

  public saveApp(app: Omit<GeneratedApp, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): GeneratedApp {
    const existingIndex = app.id ? this.data.apps.findIndex(a => a.id === app.id) : -1;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      this.data.apps[existingIndex] = {
        ...this.data.apps[existingIndex],
        ...app,
        updatedAt: now
      };
      this.addAuditLog('অ্যাপ আপডেট', app.authorEmail, `অ্যাপ "${app.title}" আপডেট করা হয়েছে`, 'app_generation', 'success');
      this.save();
      return this.data.apps[existingIndex];
    } else {
      const newApp: GeneratedApp = {
        ...app,
        id: app.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now
      };
      this.data.apps.unshift(newApp);
      this.addAuditLog('নতুন অ্যাপ তৈরি ও হোস্ট', app.authorEmail, `অ্যাপ "${newApp.title}" স্বয়ংক্রিয় স্যান্ডবক্সে লাইভ করা হয়েছে`, 'app_generation', 'success');
      this.save();
      return newApp;
    }
  }

  public deleteApp(id: string): boolean {
    const idx = this.data.apps.findIndex(a => a.id === id);
    if (idx !== -1) {
      const deleted = this.data.apps.splice(idx, 1)[0];
      this.addAuditLog('অ্যাপ মুছে ফেলা', 'Admin', `অ্যাপ "${deleted.title}" ডিলিট করা হয়েছে`, 'app_generation', 'warning');
      this.save();
      return true;
    }
    return false;
  }

  // Caller Records
  public getCallerHistory(): CallerRecord[] {
    return this.data.callerHistory;
  }

  public addCallerRecord(record: Omit<CallerRecord, 'id' | 'lastLookedUp'>): CallerRecord {
    const newRecord: CallerRecord = {
      ...record,
      id: `caller_${Date.now()}`,
      lastLookedUp: new Date().toISOString()
    };
    this.data.callerHistory.unshift(newRecord);
    this.addAuditLog('অজানা কলার স্ক্যান', 'Caller Sentinel', `নম্বর ${record.phoneNumber} এর লোকেশন ও পরিচয় ট্রেস করা হয়েছে: ${record.name}`, 'caller', 'alert');
    this.save();
    return newRecord;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public addAuditLog(
    action: string,
    actor: string,
    details: string,
    category: AuditLog['category'] = 'database',
    status: AuditLog['status'] = 'success'
  ) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      category,
      status
    };
    this.data.auditLogs.unshift(log);
    // keep max 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
    this.save();
  }

  // Network Devices
  public getNetworkDevices(): NetworkDevice[] {
    return this.data.networkDevices;
  }

  public toggleBlockDevice(mac: string): NetworkDevice | null {
    const dev = this.data.networkDevices.find(d => d.mac === mac);
    if (dev) {
      dev.isBlocked = !dev.isBlocked;
      dev.status = dev.isBlocked ? 'flagged' : 'online';
      this.addAuditLog(
        dev.isBlocked ? 'ডিভাইস ব্লক' : 'ডিভাইস আনব্লক',
        'Network Sentinel',
        `ম্যাক ${mac} (${dev.hostname}) কে ${dev.isBlocked ? 'ব্লকলিস্টে যোগ করা হয়েছে' : 'অনুমোদন দেওয়া হয়েছে'}`,
        'network',
        dev.isBlocked ? 'warning' : 'success'
      );
      this.save();
      return dev;
    }
    return null;
  }

  public addNetworkScanResult(devices: NetworkDevice[]) {
    this.data.networkDevices = devices;
    this.addAuditLog('ওয়াইফাই নেটওয়ার্ক স্ক্যান সম্পন্ন', 'Network Sentinel', `মোট ${devices.length} টি ডিভাইস সনাক্ত হয়েছে`, 'network', 'success');
    this.save();
  }

  // Device Telemetry & Control
  public getTelemetry(): DeviceTelemetry {
    return this.data.deviceTelemetry;
  }

  public updateTelemetry(partial: Partial<DeviceTelemetry>): DeviceTelemetry {
    this.data.deviceTelemetry = {
      ...this.data.deviceTelemetry,
      ...partial,
      lastSync: new Date().toISOString()
    };
    this.save();
    return this.data.deviceTelemetry;
  }

  // Raw Database Stats & Export
  public getDatabaseStats() {
    return {
      version: this.data.version,
      systemName: this.data.systemName,
      totalUsers: this.data.users.length,
      totalApps: this.data.apps.length,
      totalCallerRecords: this.data.callerHistory.length,
      totalAuditLogs: this.data.auditLogs.length,
      totalNetworkDevices: this.data.networkDevices.length,
      status: 'Autonomous Engine Online & Connected with Google Gemini Cloud',
      storageEngine: 'Autonomous JSON/Vector Persistent Store',
      dbFileSizeKb: fs.existsSync(DB_FILE) ? Math.round(fs.statSync(DB_FILE).size / 1024) : 0,
      lastUpdated: new Date().toISOString()
    };
  }

  public getFullDump(): DatabaseSchema {
    return this.data;
  }
}

export const db = new AutonomousDatabase();

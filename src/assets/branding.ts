// High-power branding images and icons for OmniMind OS

export const OMNIMIND_CORE_ICON = '/src/assets/images/omnimind_core_icon_1794023185918.jpg';
export const OMNIMIND_COMMAND_ROOM = '/src/assets/images/omnimind_command_room_1794023202258.jpg';

export interface ColorThemeConfig {
  id: 'inferno' | 'cyan' | 'purple' | 'emerald' | 'gold';
  nameBengali: string;
  nameEnglish: string;
  hex: string;
  glowClass: string;
  badgeClass: string;
  borderClass: string;
  gradientClass: string;
  lightHex: string;
}

export const COLOR_THEMES: Record<string, ColorThemeConfig> = {
  inferno: {
    id: 'inferno',
    nameBengali: 'ভয়ংকর ইনফার্নো রেড',
    nameEnglish: 'Inferno Blood Crimson',
    hex: '#ef4444',
    lightHex: '#f87171',
    glowClass: 'glow-blood-red',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    borderClass: 'border-red-500/40 focus:border-red-500',
    gradientClass: 'from-red-600 via-rose-600 to-amber-600',
  },
  cyan: {
    id: 'cyan',
    nameBengali: 'সাইবার ভয়েড ব্লু',
    nameEnglish: 'Cyber Void Electric Cyan',
    hex: '#06b6d4',
    lightHex: '#22d3ee',
    glowClass: 'glow-cyan',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    borderClass: 'border-cyan-500/40 focus:border-cyan-500',
    gradientClass: 'from-cyan-600 via-blue-600 to-indigo-600',
  },
  purple: {
    id: 'purple',
    nameBengali: 'কোয়ান্টাম ভায়োলেট',
    nameEnglish: 'Quantum Void Phantom',
    hex: '#a855f7',
    lightHex: '#c084fc',
    glowClass: 'glow-purple',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderClass: 'border-purple-500/40 focus:border-purple-500',
    gradientClass: 'from-purple-600 via-fuchsia-600 to-indigo-600',
  },
  emerald: {
    id: 'emerald',
    nameBengali: 'টক্সিক ম্যাট্রিক্স গ্রিন',
    nameEnglish: 'Toxic Matrix Overdrive',
    hex: '#10b981',
    lightHex: '#34d399',
    glowClass: 'glow-emerald',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderClass: 'border-emerald-500/40 focus:border-emerald-500',
    gradientClass: 'from-emerald-600 via-teal-600 to-cyan-600',
  },
  gold: {
    id: 'gold',
    nameBengali: 'সোলার প্লাজমা গোল্ড',
    nameEnglish: 'Solar Plasma Fusion',
    hex: '#f59e0b',
    lightHex: '#fbbf24',
    glowClass: 'glow-gold',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderClass: 'border-amber-500/40 focus:border-amber-500',
    gradientClass: 'from-amber-600 via-orange-600 to-yellow-500',
  },
};

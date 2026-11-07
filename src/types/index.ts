export type ThemeColor = 'inferno' | 'cyan' | 'purple' | 'emerald' | 'gold';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'master_admin' | 'admin' | 'operator';
  permissions: {
    canGenerateApps: boolean;
    canControlNetwork: boolean;
    canLookupCallers: boolean;
    canDeviceControl: boolean;
    canAccessDatabase: boolean;
  };
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
  spamScore: number;
  callType: 'Personal' | 'Business' | 'Suspected Scam' | 'Telemarketer' | 'Delivery/Logistics';
  riskLevel: 'Safe' | 'Moderate' | 'High Risk';
  lastLookedUp: string;
  notes: string;
  audioSpeechText: string;
}

export interface NetworkDevice {
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  status: 'online' | 'idle' | 'flagged';
  signalStrength: number;
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

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  category: 'auth' | 'app_generation' | 'network' | 'caller' | 'device' | 'database';
  status: 'success' | 'warning' | 'alert';
}

export interface SystemHealth {
  status: string;
  systemName: string;
  masterAdminEmail: string;
  geminiConnected: boolean;
  model: string;
  uptimeSeconds: number;
  database: {
    version: string;
    totalUsers: number;
    totalApps: number;
    totalCallerRecords: number;
    totalAuditLogs: number;
    totalNetworkDevices: number;
    status: string;
    storageEngine: string;
    dbFileSizeKb: number;
  };
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { generateWebApplication, processOmniCommand, lookupCallerInformation } from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.url}`);
  }
  next();
});

// ----------------------------------------------------
// System & Auth Endpoints
// ----------------------------------------------------

app.get('/api/system/health', (req, res) => {
  const stats = db.getDatabaseStats();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  res.json({
    status: 'online',
    systemName: 'OmniMind OS - সর্বশক্তিমান এআই মাস্টার হাব',
    masterAdminEmail: db.getMasterAdminEmail(),
    geminiConnected: hasGeminiKey,
    model: 'gemini-3.8-flash',
    uptimeSeconds: Math.floor(process.uptime()),
    database: stats,
    serverTime: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'জিমেইল এবং পাসওয়ার্ড প্রদান করুন' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const masterEmail = db.getMasterAdminEmail().toLowerCase();
  const masterPass = db.getMasterPassword();

  // Check Master Admin
  if (cleanEmail === masterEmail && password === masterPass) {
    db.addAuditLog('সুপার এডমিন লগইন', masterEmail, 'মাস্টার এডমিন প্যানেলে সফল প্রবেশাধিকার', 'auth', 'success');
    return res.json({
      success: true,
      user: {
        id: 'user_master_001',
        email: db.getMasterAdminEmail(),
        name: 'মুহাম্মদ রাহিম (সুপার এডমিন)',
        role: 'master_admin',
        permissions: {
          canGenerateApps: true,
          canControlNetwork: true,
          canLookupCallers: true,
          canDeviceControl: true,
          canAccessDatabase: true
        }
      },
      token: `omni_token_${Date.now()}_master`
    });
  }

  // Check authorized user registry
  const users = db.getUsers();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === password);

  if (found) {
    if (found.status === 'suspended') {
      db.addAuditLog('স্থগিত একাউন্টে লগইন ব্যর্থ', cleanEmail, 'সাসপেন্ডেড একাউন্ট থেকে প্রবেশের চেষ্টা', 'auth', 'warning');
      return res.status(403).json({ error: 'আপনার অ্যাক্সেস সুপার এডমিন কর্তৃক সাময়িকভাবে স্থগিত করা হয়েছে।' });
    }

    db.addAuditLog('ব্যবহারকারী লগইন', found.email, `ভূমিকা: ${found.role}`, 'auth', 'success');
    return res.json({
      success: true,
      user: {
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role,
        permissions: found.permissions
      },
      token: `omni_token_${Date.now()}_${found.id}`
    });
  }

  db.addAuditLog('অননুমোদিত প্রবেশের চেষ্টা', cleanEmail, 'ভুল পাসওয়ার্ড বা অননুমোদিত জিমেইল', 'auth', 'alert');
  return res.status(401).json({
    error: 'অ্যাক্সেস অস্বীকৃত! শুধুমাত্র মাস্টার এডমিন কর্তৃক অনুমোদিত জিমেইল এবং সঠিক পাসওয়ার্ড দ্বারা প্রবেশযোগ্য।'
  });
});

app.post('/api/auth/update-admin-pass', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'বর্তমান এবং নতুন পাসওয়ার্ড উভয়ই প্রয়োজন' });
  }

  if (currentPassword !== db.getMasterPassword()) {
    return res.status(401).json({ error: 'বর্তমান মাস্টার পাসওয়ার্ড সঠিক নয়' });
  }

  db.setMasterPassword(newPassword);
  res.json({ success: true, message: 'মাস্টার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।' });
});

// ----------------------------------------------------
// Admin Management (Users & Access Delegation)
// ----------------------------------------------------

app.get('/api/admin/users', (req, res) => {
  res.json({
    users: db.getUsers(),
    masterEmail: db.getMasterAdminEmail()
  });
});

app.post('/api/admin/users', (req, res) => {
  const { email, name, role, password, permissions } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'ইমেইল, নাম ও পাসওয়ার্ড আবশ্যক' });
  }

  const existing = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'এই জিমেইলটি ইতিমধ্যেই সিস্টেমে অনুমোদিত আছে।' });
  }

  const newUser = db.addUser({
    email,
    name,
    role: role || 'operator',
    passwordHash: password,
    permissions: permissions || {
      canGenerateApps: true,
      canControlNetwork: false,
      canLookupCallers: true,
      canDeviceControl: false,
      canAccessDatabase: false
    },
    status: 'active'
  });

  res.json({ success: true, user: newUser });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.removeUser(id);
  if (deleted) {
    res.json({ success: true, message: 'ব্যবহারকারীর প্রবেশাধিকার প্রত্যাহার করা হয়েছে।' });
  } else {
    res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });
  }
});

app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { permissions, status } = req.body;
  const updated = db.updateUserPermissions(id, permissions, status);
  if (updated) {
    res.json({ success: true, user: updated });
  } else {
    res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });
  }
});

// ----------------------------------------------------
// Executive Command & Gemini Intelligence
// ----------------------------------------------------

app.post('/api/ai/command', async (req, res) => {
  const { command, actorEmail } = req.body;
  if (!command || !command.trim()) {
    return res.status(400).json({ error: 'কমান্ড প্রদান করুন' });
  }

  try {
    const analysis = await processOmniCommand(command.trim());
    const actor = actorEmail || db.getMasterAdminEmail();

    // If command is to create an app, trigger generation right away!
    if (analysis.actionType === 'create_app') {
      const appPrompt = analysis.suggestedAppPrompt || command;
      const generated = await generateWebApplication(appPrompt);
      const savedApp = db.saveApp({
        title: generated.title,
        description: generated.description,
        category: generated.category,
        tags: generated.tags,
        htmlCode: generated.htmlCode,
        authorEmail: actor
      });

      return res.json({
        success: true,
        actionType: 'create_app',
        thoughtBengali: analysis.thoughtBengali || 'স্বয়ংক্রিয় এআই অ্যাপ জেনারেটর সক্রিয় করা হয়েছে।',
        executionSummary: `আপনার নির্দেশ মতো "${savedApp.title}" অ্যাপটি তৎক্ষণাৎ তৈরি করে লাইভ স্যান্ডবক্সে স্থাপন করা হয়েছে। কোনো গিটহ্যাব পোস্টিং ছাড়াই এটি এখন ব্যবহারের জন্য প্রস্তুত!`,
        app: savedApp
      });
    }

    if (analysis.actionType === 'caller_lookup') {
      const phone = analysis.phoneNumber || '+8801712345678';
      const callerInfo = await lookupCallerInformation(phone);
      const savedRecord = db.addCallerRecord(callerInfo);

      return res.json({
        success: true,
        actionType: 'caller_lookup',
        thoughtBengali: analysis.thoughtBengali,
        executionSummary: `নম্বর ${phone} এর তথ্য: ${callerInfo.name} (${callerInfo.location}, ক্যারিয়ার: ${callerInfo.carrier}, ঝুঁকি: ${callerInfo.riskLevel})`,
        caller: savedRecord
      });
    }

    if (analysis.actionType === 'device_control') {
      let telemetry = db.getTelemetry();
      if (analysis.deviceAction === 'battery_saver') {
        telemetry = db.updateTelemetry({ powerSaverMode: true, cpuUsage: 8 });
      } else if (analysis.deviceAction === 'clean_ram') {
        telemetry = db.updateTelemetry({ memoryUsage: 22, cpuUsage: 6 });
      } else if (analysis.deviceAction === 'flashlight_toggle') {
        telemetry = db.updateTelemetry({ flashlightOn: !telemetry.flashlightOn });
      } else if (analysis.deviceAction === 'lock_screen') {
        telemetry = db.updateTelemetry({ deviceLocked: true });
      } else if (analysis.deviceAction === 'trigger_alarm') {
        telemetry = db.updateTelemetry({ alarmActive: true });
      }

      db.addAuditLog('ডিভাইস নির্দেশ কার্যকর', actor, `নির্দেশ: ${analysis.deviceAction}`, 'device', 'success');

      return res.json({
        success: true,
        actionType: 'device_control',
        thoughtBengali: analysis.thoughtBengali,
        executionSummary: analysis.executionSummary,
        deviceAction: analysis.deviceAction,
        telemetry
      });
    }

    if (analysis.actionType === 'network_action') {
      db.addAuditLog('নেটওয়ার্ক ডিফেন্স অ্যাকশন', actor, 'ওয়াইফাই সেন্টিনেল স্ক্যান ও রুটিন চেক', 'network', 'success');
      return res.json({
        success: true,
        actionType: 'network_action',
        thoughtBengali: analysis.thoughtBengali,
        executionSummary: analysis.executionSummary,
        networkDevices: db.getNetworkDevices()
      });
    }

    // General AI response
    db.addAuditLog('এআই কোর কনভারসেশন', actor, `কমান্ড: ${command.substring(0, 40)}`, 'database', 'success');
    return res.json({
      success: true,
      actionType: 'general_qa',
      thoughtBengali: analysis.thoughtBengali,
      executionSummary: analysis.executionSummary
    });
  } catch (err: any) {
    console.error('Command processing error:', err);
    res.status(500).json({
      error: 'কমান্ড প্রসেস করতে ব্যর্থ হয়েছে',
      details: err.message
    });
  }
});

// ----------------------------------------------------
// Autonomous Web App Generator & Sandbox Hosting
// ----------------------------------------------------

app.get('/api/apps', (req, res) => {
  res.json({ apps: db.getApps() });
});

app.get('/api/apps/:id', (req, res) => {
  const appItem = db.getAppById(req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: 'অ্যাপ্লিকেশন পাওয়া যায়নি' });
  }
  res.json({ app: appItem });
});

app.post('/api/ai/generate-app', async (req, res) => {
  const { prompt, category, authorEmail } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'অ্যাপের বিবরণ বা প্রম্পট লিখুন' });
  }

  try {
    const generated = await generateWebApplication(prompt.trim(), category);
    const author = authorEmail || db.getMasterAdminEmail();
    const savedApp = db.saveApp({
      title: generated.title,
      description: generated.description,
      category: generated.category,
      tags: generated.tags,
      htmlCode: generated.htmlCode,
      authorEmail: author
    });

    res.json({
      success: true,
      app: savedApp,
      message: 'অ্যাপটি তৎক্ষণাৎ তৈরি করা হয়েছে এবং স্বয়ংক্রিয় স্যান্ডবক্সে হোস্ট করা হয়েছে!'
    });
  } catch (e: any) {
    console.error('App generation failure:', e);
    res.status(500).json({ error: 'অ্যাপ জেনারেট করতে সমস্যা হয়েছে', details: e.message });
  }
});

app.post('/api/apps/save', (req, res) => {
  const { id, title, description, category, tags, htmlCode, authorEmail } = req.body;
  if (!title || !htmlCode) {
    return res.status(400).json({ error: 'টাইটেল এবং এইচটিএমএল কোড আবশ্যক' });
  }

  const saved = db.saveApp({
    id,
    title,
    description: description || '',
    category: category || 'custom',
    tags: Array.isArray(tags) ? tags : ['Web App'],
    htmlCode,
    authorEmail: authorEmail || db.getMasterAdminEmail()
  });

  res.json({ success: true, app: saved });
});

app.delete('/api/apps/:id', (req, res) => {
  const success = db.deleteApp(req.params.id);
  if (success) {
    res.json({ success: true, message: 'অ্যাপ সফলভাবে মুছে ফেলা হয়েছে' });
  } else {
    res.status(404).json({ error: 'অ্যাপ পাওয়া যায়নি' });
  }
});

// ----------------------------------------------------
// Network Sentinel & WiFi Controller
// ----------------------------------------------------

app.post('/api/network/scan', (req, res) => {
  // Simulate active deep WiFi spectrum & ARP scan
  const sampleVendors = ['Apple Inc. (iPhone 16)', 'Samsung Electronics', 'Xiaomi IoT Router', 'TP-Link Wireless', 'Espressif Systems (IoT)', 'Intel Wireless Adapter', 'Raspberry Pi Foundation'];
  const newDevices = [
    {
      ip: '192.168.1.1',
      mac: '00:1A:2B:3C:4D:5E',
      hostname: 'Gateway-Router-AX73',
      vendor: 'TP-Link Wi-Fi 6 Archer',
      status: 'online' as const,
      signalStrength: 99,
      bandwidthUsage: '14.2 Mbps',
      isBlocked: false
    },
    {
      ip: '192.168.1.102',
      mac: 'A4:C3:F0:88:99:11',
      hostname: 'Rahim-Master-Workstation',
      vendor: 'Intel Core Ultra Device',
      status: 'online' as const,
      signalStrength: 95,
      bandwidthUsage: '26.8 Mbps',
      isBlocked: false
    },
    {
      ip: '192.168.1.108',
      mac: 'F4:F5:DB:88:12:34',
      hostname: 'Galaxy-S24-Ultra-Master',
      vendor: 'Samsung Mobile',
      status: 'online' as const,
      signalStrength: 89,
      bandwidthUsage: '8.4 Mbps',
      isBlocked: false
    },
    {
      ip: '192.168.1.189',
      mac: 'BC:DD:C2:55:66:77',
      hostname: 'Smart-Home-CCTV-01',
      vendor: 'Hikvision Digital Technology',
      status: 'online' as const,
      signalStrength: 82,
      bandwidthUsage: '3.1 Mbps',
      isBlocked: false
    },
    {
      ip: '192.168.1.240',
      mac: 'DC:A6:32:99:AA:BB',
      hostname: 'Unidentified-Probe-Node',
      vendor: 'Espressif Inc. (Rogue Node)',
      status: 'flagged' as const,
      signalStrength: 42,
      bandwidthUsage: '0.1 Mbps',
      isBlocked: true
    }
  ];

  db.addNetworkScanResult(newDevices);
  res.json({
    success: true,
    devices: newDevices,
    wifiDetails: {
      ssid: 'CyberSecure_5GHz_Enterprise',
      bssid: '00:1A:2B:3C:4D:5F',
      channel: 36,
      frequency: '5.180 GHz (WiFi 6 - 802.11ax)',
      security: 'WPA3-Personal SAE + AES-256',
      downloadSpeed: '124.5 Mbps',
      uploadSpeed: '88.2 Mbps',
      ping: '9 ms',
      jitter: '1.2 ms',
      gatewayIp: '192.168.1.1',
      dnsServers: ['8.8.8.8 (Google Primary)', '1.1.1.1 (Cloudflare)']
    }
  });
});

app.post('/api/network/toggle-block', (req, res) => {
  const { mac } = req.body;
  if (!mac) {
    return res.status(400).json({ error: 'ম্যাক অ্যাড্রেস দিন' });
  }
  const dev = db.toggleBlockDevice(mac);
  if (!dev) {
    return res.status(404).json({ error: 'ডিভাইস পাওয়া যায়নি' });
  }
  res.json({ success: true, device: dev });
});

// ----------------------------------------------------
// Caller ID & Geolocation Sentinel
// ----------------------------------------------------

app.post('/api/caller/lookup', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber || !phoneNumber.trim()) {
    return res.status(400).json({ error: 'ফোন নম্বর প্রদান করুন' });
  }

  try {
    const callerData = await lookupCallerInformation(phoneNumber.trim());
    const saved = db.addCallerRecord(callerData);
    res.json({ success: true, caller: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'কলার অনুসন্ধান ব্যর্থ হয়েছে', details: err.message });
  }
});

app.get('/api/caller/history', (req, res) => {
  res.json({ history: db.getCallerHistory() });
});

// ----------------------------------------------------
// Remote Phone / Device Control
// ----------------------------------------------------

app.get('/api/device/telemetry', (req, res) => {
  res.json({ telemetry: db.getTelemetry() });
});

app.post('/api/device/command', (req, res) => {
  const { action, value } = req.body;
  let telem = db.getTelemetry();

  switch (action) {
    case 'toggle_flashlight':
      telem = db.updateTelemetry({ flashlightOn: !telem.flashlightOn });
      db.addAuditLog('টর্চলাইট নিয়ন্ত্রণ', 'Device Controller', `টর্চ ${telem.flashlightOn ? 'অন' : 'অফ'} করা হয়েছে`, 'device');
      break;
    case 'toggle_dnd':
      telem = db.updateTelemetry({ dndMode: !telem.dndMode });
      db.addAuditLog('ডু-নট-ডিস্টার্ব (DND)', 'Device Controller', `DND মোড ${telem.dndMode ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`, 'device');
      break;
    case 'toggle_battery_saver':
      telem = db.updateTelemetry({ powerSaverMode: !telem.powerSaverMode, cpuUsage: telem.powerSaverMode ? 14 : 7 });
      db.addAuditLog('ব্যাটারি সেভার', 'Device Controller', `পাওয়ার সেভার মোড ${telem.powerSaverMode ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`, 'device');
      break;
    case 'clean_ram':
      telem = db.updateTelemetry({ memoryUsage: 24, cpuUsage: 9 });
      db.addAuditLog('র‍্যাম ও ক্যাশ মেমোরি ক্লিন', 'Device Controller', '১.৪ জিবি ব্যাকগ্রাউন্ড টাস্ক ক্যাশ মুক্ত করা হয়েছে', 'device');
      break;
    case 'lock_device':
      telem = db.updateTelemetry({ deviceLocked: true });
      db.addAuditLog('রিমোট ফোন লক', 'Device Controller', 'বায়োমেট্রিক স্ক্রিন সম্পূর্ণ লক করা হয়েছে', 'device', 'warning');
      break;
    case 'unlock_device':
      telem = db.updateTelemetry({ deviceLocked: false });
      db.addAuditLog('ফোন আনলক', 'Device Controller', 'মাস্টার পিন দ্বারা আনলক সম্পন্ন', 'device', 'success');
      break;
    case 'trigger_alarm':
      telem = db.updateTelemetry({ alarmActive: true });
      db.addAuditLog('জরুরি সাইরেন সক্রিয়', 'Device Controller', 'উচ্চ ডেসিবেল এলার্ম সংকেত শুরু', 'device', 'alert');
      break;
    case 'stop_alarm':
      telem = db.updateTelemetry({ alarmActive: false });
      db.addAuditLog('সাইরেন বন্ধ', 'Device Controller', 'এলার্ম মিউট করা হয়েছে', 'device', 'success');
      break;
    default:
      return res.status(400).json({ error: 'অপরিচিত ডিভাইস কমান্ড' });
  }

  res.json({ success: true, telemetry: telem });
});

// ----------------------------------------------------
// Autonomous Database Records & Backups
// ----------------------------------------------------

app.get('/api/database/records', (req, res) => {
  const stats = db.getDatabaseStats();
  const dump = db.getFullDump();
  res.json({
    stats,
    tables: {
      users: dump.users.length,
      apps: dump.apps.length,
      callerHistory: dump.callerHistory.length,
      networkDevices: dump.networkDevices.length,
      auditLogs: dump.auditLogs.length
    },
    sampleData: {
      appsSummary: dump.apps.map(a => ({ id: a.id, title: a.title, category: a.category, createdAt: a.createdAt })),
      usersSummary: dump.users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, status: u.status })),
      callerHistory: dump.callerHistory.slice(0, 10),
      networkDevices: dump.networkDevices
    }
  });
});

app.get('/api/database/download-backup', (req, res) => {
  const dump = db.getFullDump();
  res.setHeader('Content-Disposition', `attachment; filename=omnimind_backup_${Date.now()}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(dump, null, 2));
});

app.get('/api/audit-logs', (req, res) => {
  res.json({ logs: db.getAuditLogs() });
});

// ----------------------------------------------------
// Development & Production Vite Integration
// ----------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[Dev] Vite middleware mounted.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[Prod] Serving static files from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 OmniMind OS Running at http://localhost:${PORT}`);
    console.log(`🛡️ Master Admin: ${db.getMasterAdminEmail()}`);
    console.log(`🌐 Autonomous Database Engine: Active & Google Gemini Linked`);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

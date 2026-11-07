import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Lock, 
  Trash2, 
  UserCheck, 
  KeyRound, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Wifi, 
  PhoneCall, 
  Smartphone, 
  Database, 
  UserX, 
  RefreshCw 
} from 'lucide-react';
import { UserSession } from '../types';
import { soundFx } from '../utils/audio';

interface AdminPanelProps {
  currentUser: UserSession | null;
  onOpenLogin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onOpenLogin }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [masterEmail, setMasterEmail] = useState('info.rahim76@gmail.com');
  const [loading, setLoading] = useState(false);

  // Invite user form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'operator' | 'admin'>('operator');
  const [perms, setPerms] = useState({
    canGenerateApps: true,
    canControlNetwork: false,
    canLookupCallers: true,
    canDeviceControl: false,
    canAccessDatabase: false,
  });

  // Master password change form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        if (data.masterEmail) setMasterEmail(data.masterEmail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName || !newPassword) return;

    soundFx.playBeep(850, 0.08);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          password: newPassword,
          role: newRole,
          permissions: perms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ব্যবহারকারী যোগ করতে ব্যর্থ');

      soundFx.playBeep(1050, 0.1);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) {
      soundFx.playBeep(250, 0.15);
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে ${email} এর প্রবেশাধিকার চিরতরে প্রত্যাহার করতে চান?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        soundFx.playBeep(450, 0.1);
        setUsers(users.filter((u) => u.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: user.permissions,
          status: newStatus,
        }),
      });
      if (res.ok) {
        soundFx.playBeep(750, 0.05);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeMasterPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!currentPass || !newPass) return;

    try {
      const res = await fetch('/api/auth/update-admin-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ');

      soundFx.playBeep(1000, 0.12);
      setPassMsg({ text: 'মাস্টার পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!', isError: false });
      setCurrentPass('');
      setNewPass('');
    } catch (err: any) {
      soundFx.playBeep(250, 0.2);
      setPassMsg({ text: err.message, isError: true });
    }
  };

  const isMasterAdmin = currentUser?.role === 'master_admin';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 glow-cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>সুরক্ষিত মাস্টার অ্যাক্সেস গেটওয়ে</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              এডমিন ও ব্যবহারকারী পারমিশন প্যানেল
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              শুধুমাত্র আপনি (মাস্টার এডমিন) যাকে অনুমোদন দেবেন, সে-ই নির্দিষ্ট পারমিশন নিয়ে এই সিস্টেম ব্যবহার করতে পারবে। জিমেইল ও পাসওয়ার্ডের মাধ্যমে প্রত্যেক ব্যবহারকারীর প্রবেশাধিকার সম্পূর্ণভাবে নিয়ন্ত্রিত।
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">মাস্টার সুপার এডমিন জিমেইল</span>
              <span className="text-sm font-bold text-cyan-300 font-mono">{masterEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {!currentUser && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>
              আপনি বর্তমানে অতিথি অবস্থায় আছেন। এডমিন সেটিংসে পরিবর্তন করতে অনুগ্রহ করে মাস্টার পাসওয়ার্ড দিয়ে লগইন করুন।
            </span>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            এডমিন লগইন
          </button>
        </div>
      )}

      {/* Main Grid: User Creator + Master Password Changer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Invite / Authorize New User */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              নতুন ব্যবহারকারীকে অনুমতি দিন (Whitelist Gmail)
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">ব্যবহারকারীর নাম</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="যেমন: ইঞ্জিনিয়ার তানভীর"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">অনুমোদিত জিমেইল</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">প্রবেশ পাসওয়ার্ড</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">ভূমিকা (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="operator">অপারেটর (Operator - নিয়ন্ত্রিত অ্যাক্সেস)</option>
                    <option value="admin">সহকারী এডমিন (Co-Admin)</option>
                  </select>
                </div>
              </div>

              {/* Granular permissions checkboxes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  ব্যবহারকারীর জন্য প্রযোজ্য পারমিশন নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={perms.canGenerateApps}
                      onChange={(e) => setPerms({ ...perms, canGenerateApps: e.target.checked })}
                      className="rounded accent-cyan-500"
                    />
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>ওয়েব অ্যাপ তৈরি ও স্যান্ডবক্স ব্যবহার</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={perms.canControlNetwork}
                      onChange={(e) => setPerms({ ...perms, canControlNetwork: e.target.checked })}
                      className="rounded accent-cyan-500"
                    />
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ওয়াইফাই ও নেটওয়ার্ক নিয়ন্ত্রণ</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={perms.canLookupCallers}
                      onChange={(e) => setPerms({ ...perms, canLookupCallers: e.target.checked })}
                      className="rounded accent-cyan-500"
                    />
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    <span>অজানা কলার লোকেশন ও তথ্য ট্রেস</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={perms.canDeviceControl}
                      onChange={(e) => setPerms({ ...perms, canDeviceControl: e.target.checked })}
                      className="rounded accent-cyan-500"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>ফোন রিমোট অটোমেশন ও কন্ট্রোল</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={perms.canAccessDatabase}
                      onChange={(e) => setPerms({ ...perms, canAccessDatabase: e.target.checked })}
                      className="rounded accent-cyan-500"
                    />
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>অটোনোমাস ডাটাবেজ ব্যাকআপ ও রেকর্ড অ্যাক্সেস</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>ব্যবহারকারী অনুমোদন ও সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>

          {/* Active Users Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                অনুমোদিত ব্যবহারকারী রেজিস্ট্রি ({users.length})
              </h3>
              <button
                onClick={fetchUsers}
                className="text-slate-400 hover:text-cyan-400 p-1 rounded transition"
                title="রিফ্রেশ"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-3">ব্যবহারকারী</th>
                    <th className="pb-3">জিমেইল ও পাসওয়ার্ড</th>
                    <th className="pb-3">ভূমিকা ও স্থিতি</th>
                    <th className="pb-3">অনুমোদিত ফিচার</th>
                    <th className="pb-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => {
                    const isMaster = u.role === 'master_admin';
                    return (
                      <tr key={u.id} className="hover:bg-slate-850/40">
                        <td className="py-3 pr-2">
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{u.id}</span>
                        </td>
                        <td className="py-3 pr-2 font-mono">
                          <span className="text-cyan-300 block">{u.email}</span>
                          <span className="text-slate-500 text-[10px]">
                            {isMaster ? '•••••••• (মাস্টার)' : u.passwordHash}
                          </span>
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            isMaster
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {isMaster ? 'সুপার এডমিন' : u.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                          </span>
                        </td>
                        <td className="py-3 pr-2">
                          <div className="flex flex-wrap gap-1">
                            {u.permissions?.canGenerateApps && (
                              <span className="text-[9px] bg-blue-500/10 text-blue-300 px-1.5 py-0.2 rounded">অ্যাপস</span>
                            )}
                            {u.permissions?.canControlNetwork && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.2 rounded">নেটওয়ার্ক</span>
                            )}
                            {u.permissions?.canLookupCallers && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded">কলার</span>
                            )}
                            {u.permissions?.canDeviceControl && (
                              <span className="text-[9px] bg-purple-500/10 text-purple-300 px-1.5 py-0.2 rounded">ডিভাইস</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          {!isMaster && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded-lg border transition text-[11px] ${
                                  u.status === 'active'
                                    ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                                title={u.status === 'active' ? 'স্থগিত করুন' : 'পুনরায় সক্রিয় করুন'}
                              >
                                {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition"
                                title="প্রবেশাধিকার মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Master Security Settings */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              মাস্টার এডমিন পাসওয়ার্ড পরিবর্তন
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              সুপার এডমিন হিসেবে আপনার প্রাথমিক পাসওয়ার্ড পরিবর্তন করতে বর্তমান এবং নতুন পাসওয়ার্ড প্রদান করুন।
            </p>

            {passMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                passMsg.isError ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {passMsg.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangeMasterPass} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">বর্তমান মাস্টার পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">নতুন পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="নতুন শক্তিশালী পাসওয়ার্ড দিন"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>পাসওয়ার্ড আপডেট করুন</span>
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/40 border border-cyan-500/30 rounded-3xl p-5 text-xs space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              জিরো-ট্রাস্ট সিকিউরিটি প্রোটোকল
            </h4>
            <p className="text-slate-300 leading-relaxed">
              এই সিস্টেমে পাসওয়ার্ড এনক্রিপ্টেড ডাটাবেজে সংরক্ষিত থাকে। কোনো অননুমোদিত জিমেইল সাইটে ঢুকতে পারবে না এবং যে কোনো সময়ে এডমিন প্যানেল থেকে অ্যাক্সেস বাতিল করা যায়।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

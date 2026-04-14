import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';
import {
  LogOut, Bell, Settings, User, Check,
  X, Briefcase, Star, Shield,
  Phone, Mail, Edit3, Save, AlertCircle, CheckCircle,
  Info, Zap, Eye, EyeOff, Camera, Moon, Sun
} from 'lucide-react';

/* ─── Notification type ─── */
interface AppNotification {
  id: string;
  type: 'task' | 'project' | 'achievement' | 'system' | 'mention';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
}

/* ─── helpers ─── */
const timeAgo = (minutes: number) => {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

export default function Navbar() {
  const { user, logout, updateUser } = useAuthStore();
  const { isDark, accentColor, setAccentColor, toggleTheme, setTheme } = useThemeStore();
  const { tasks, projects } = useTaskStore();

  /* ── panel visibility ── */
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings]           = useState(false);
  const [showProfile, setShowProfile]             = useState(false);

  /* ── notification state ── */
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n1', type: 'task',        title: 'New Task Assigned',        message: 'Build User Authentication module has been assigned to you.',       time: timeAgo(15),   read: false, icon: '📋' },
    { id: 'n2', type: 'project',     title: 'Project Alpha Updated',    message: 'Project Alpha deadline has been moved to next Friday.',            time: timeAgo(45),   read: false, icon: '📁' },
    { id: 'n3', type: 'achievement', title: '🏆 Badge Earned!',         message: 'You earned the "Fast Finisher" badge for completing 5 tasks.',     time: timeAgo(120),  read: false, icon: '🏆' },
    { id: 'n4', type: 'mention',     title: 'Mentioned in Chat',        message: 'John Manager mentioned you in Project Beta discussion.',           time: timeAgo(180),  read: true,  icon: '💬' },
    { id: 'n5', type: 'system',      title: 'Weekly Report Ready',      message: 'Your weekly performance report is ready to view.',                 time: timeAgo(360),  read: true,  icon: '📊' },
    { id: 'n6', type: 'task',        title: 'Task Review Requested',    message: 'Sarah requested a review on "API Integration" task.',              time: timeAgo(720),  read: true,  icon: '🔍' },
  ]);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  /* ── settings state ── */
  const [settingsTab, setSettingsTab]                     = useState<'account' | 'notifications' | 'security' | 'appearance'>('account');
  const [emailNotifications, setEmailNotifications]       = useState(true);
  const [pushNotifications, setPushNotifications]         = useState(true);
  const [taskReminders, setTaskReminders]                 = useState(true);
  const [weeklyReport, setWeeklyReport]                   = useState(true);
  const [availability, setAvailability]                   = useState(user?.availability || 'available');
  const [settingsSaved, setSettingsSaved]                 = useState(false);

  /* ── profile edit state ── */
  const [editName, setEditName]   = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio]     = useState(user?.bio || '');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved]     = useState(false);

  /* ── security state ── */
  const [currentPwd, setCurrentPwd]   = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd]         = useState(false);
  const [pwdError, setPwdError]             = useState('');
  const [pwdSuccess, setPwdSuccess]         = useState('');

  /* ── outside-click refs ── */
  const notifRef   = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotifications(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
      if (profileRef.current  && !profileRef.current.contains(e.target as Node))  setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── derived data ── */
  const unread       = notifications.filter(n => !n.read).length;
  const userTasks    = tasks.filter(t => t.assignedTo === user?.id);
  const activeTasks  = userTasks.filter(t => t.status === 'in-progress').length;
  const doneTasks    = userTasks.filter(t => t.status === 'completed').length;
  const userProjects = projects.filter(p =>
    p.managerId === user?.id || p.teamMembers.includes(user?.id || '')
  ).length;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  /* ── notification helpers ── */
  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotification = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));
  const openNotificationDetail = (notification: AppNotification) => {
    markRead(notification.id);
    setSelectedNotification({ ...notification, read: true });
    setShowNotificationModal(true);
  };

  const notifBg = (type: AppNotification['type']) => {
    const map: Record<string, string> = {
      task: 'bg-blue-100 dark:bg-blue-900/40',
      project: 'bg-purple-100 dark:bg-purple-900/40',
      achievement: 'bg-yellow-100 dark:bg-yellow-900/40',
      mention: 'bg-green-100 dark:bg-green-900/40',
      system: 'bg-gray-100 dark:bg-gray-700',
    };
    return map[type] || 'bg-gray-100 dark:bg-gray-700';
  };

  /* ── save profile ── */
  const handleSaveProfile = () => {
    updateUser({ name: editName, phone: editPhone, bio: editBio });
    setEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  /* ── save settings ── */
  const handleSaveSettings = () => {
    updateUser({ availability });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  /* ── change password ── */
  const handleChangePassword = () => {
    setPwdError('');
    setPwdSuccess('');
    if (!currentPwd) { setPwdError('Enter your current password.'); return; }
    if (newPwd.length < 6) { setPwdError('New password must be at least 6 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setPwdSuccess('Password changed successfully!');
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setTimeout(() => setPwdSuccess(''), 3000);
  };

  const availColor = { available: 'bg-green-500', busy: 'bg-yellow-500', offline: 'bg-gray-400' };

  /* ═══════════════════════════════════════════ JSX ═══ */
  return (
    <>
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F5F0FF 100%)',
        borderBottom: isDark ? '1px solid #334155' : '1px solid #DDD6FE',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(99,102,241,0.08)',
      }}
    >
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg accent-bg">
            <span className="text-white font-bold text-sm">TT</span>
          </div>
          <span
            className="text-lg font-bold hidden sm:block tracking-tight"
            style={{ color: isDark ? '#F1F5F9' : '#1E1B4B' }}
          >
            TeamTrack Pro
          </span>
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1">

          {/* ── Theme Toggle ── */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl transition-all duration-200"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f0dbd8')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {isDark ? (
              <Sun className="w-5 h-5" style={{ color: '#facc15' }} />
            ) : (
              <Moon className="w-5 h-5" style={{ color: '#374151' }} />
            )}
          </button>

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(v => !v); setShowSettings(false); setShowProfile(false); }}
              title="Notifications"
              className="relative p-2 rounded-xl transition-all duration-200"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f0dbd8')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Bell className="w-5 h-5" style={{ color: isDark ? '#d1d5db' : '#374151' }} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1 animate-pulse">
                  {unread}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-96 rounded-2xl overflow-hidden z-50"
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '1px solid #334155' : '1px solid #DDD6FE',
                  boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(99,102,241,0.15)',
                }}
              >
                {/* header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{
                    borderColor: isDark ? '#334155' : '#EDE9FE',
                    background: isDark
                      ? 'linear-gradient(135deg, #1E293B, #334155)'
                      : 'linear-gradient(135deg, #EDE9FE, #F5F0FF)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" style={{ color: '#6366F1' }} />
                    <h3 className="font-bold text-sm" style={{ color: isDark ? '#F1F5F9' : '#1E1B4B' }}>Notifications</h3>
                    {unread > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">{unread} new</span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                {/* list */}
                <div className="max-h-[440px] overflow-y-auto" style={{ borderColor: isDark ? '#374151' : '#e8cfc9' }}>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12" style={{ color: isDark ? '#6b7280' : '#888888' }}>
                      <Bell className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => openNotificationDetail(n)}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b"
                      style={{
                        borderColor: isDark ? '#334155' : '#EDE9FE',
                        backgroundColor: !n.read
                          ? (isDark ? 'rgba(99,102,241,0.10)' : 'rgba(237,233,254,0.5)')
                          : 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#EDE9FE')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = !n.read ? (isDark ? 'rgba(99,102,241,0.10)' : 'rgba(237,233,254,0.6)') : 'transparent')}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${notifBg(n.type)}`}>
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold truncate" style={{ color: !n.read ? (isDark ? '#F1F5F9' : '#1E1B4B') : (isDark ? '#94A3B8' : '#6B7280') }}>
                            {n.title}
                          </p>
                          <button
                            onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>

                {/* footer */}
                <div
                  className="px-5 py-3 border-t"
                  style={{
                    borderColor: isDark ? '#334155' : '#EDE9FE',
                    background: isDark ? 'rgba(30,41,59,0.8)' : 'linear-gradient(135deg,#F5F0FF,#EDE9FE)',
                  }}
                >
                  <button className="text-xs font-medium hover:underline w-full text-center"
                    style={{ color: '#6366F1' }}>
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Settings ── */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => { setShowSettings(v => !v); setShowNotifications(false); setShowProfile(false); }}
              title="Settings"
              className="p-2 rounded-xl transition-all duration-200"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f0dbd8')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Settings
                className={`w-5 h-5 transition-transform duration-500 ${showSettings ? 'rotate-90' : ''}`}
                style={{ color: isDark ? '#d1d5db' : '#374151' }}
              />
            </button>

            {showSettings && (
              <div
                className="absolute right-0 mt-2 w-[480px] rounded-2xl overflow-hidden z-50"
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '1px solid #334155' : '1px solid #DDD6FE',
                  boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(99,102,241,0.15)',
                }}
              >
                {/* header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{
                    borderColor: isDark ? '#334155' : '#EDE9FE',
                    background: isDark
                      ? 'linear-gradient(135deg, #1E293B, #334155)'
                      : 'linear-gradient(135deg, #EDE9FE, #F5F0FF)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" style={{ color: '#6366F1' }} />
                    <h3 className="font-bold text-sm" style={{ color: isDark ? '#F1F5F9' : '#1E1B4B' }}>Settings</h3>
                  </div>
                  <button onClick={() => setShowSettings(false)}>
                    <X className="w-4 h-4" style={{ color: isDark ? '#94A3B8' : '#6B7280' }} />
                  </button>
                </div>

                {/* tabs */}
                <div
                  className="flex border-b"
                  style={{
                    borderColor: isDark ? '#334155' : '#EDE9FE',
                    background: isDark ? 'rgba(30,41,59,0.6)' : '#F5F0FF',
                  }}
                >
                  {(['account','notifications','security','appearance'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setSettingsTab(tab)}
                      className="flex-1 py-3 text-xs font-semibold capitalize transition-all"
                      style={
                        settingsTab === tab
                          ? {
                              color: 'var(--accent-primary)',
                              borderBottom: '2px solid var(--accent-primary)',
                              backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            }
                          : {
                              color: isDark ? '#9ca3af' : '#555555',
                              borderBottom: '2px solid transparent',
                            }
                      }
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-5 max-h-80 overflow-y-auto">

                  {/* Account Tab */}
                  {settingsTab === 'account' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeTasks}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Tasks</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{doneTasks}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userProjects}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Projects</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{user?.rating}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rating</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Availability Status</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {(['available','busy','offline'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => setAvailability(s)}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border-2 transition-all ${
                                availability === s
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${availColor[s]}`} />
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {settingsTab === 'notifications' && (
                    <div className="space-y-3">
                      {[
                        { label: 'Email Notifications', desc: 'Receive updates via email', value: emailNotifications, setter: setEmailNotifications },
                        { label: 'Push Notifications', desc: 'In-app real-time alerts', value: pushNotifications, setter: setPushNotifications },
                        { label: 'Task Reminders',     desc: 'Remind before due dates',  value: taskReminders,     setter: setTaskReminders },
                        { label: 'Weekly Report',      desc: 'Performance summary email', value: weeklyReport,       setter: setWeeklyReport },
                      ].map(({ label, desc, value, setter }) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                          </div>
                          <button
                            onClick={() => setter(!value)}
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Security Tab */}
                  {settingsTab === 'security' && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Change Password</p>
                      {[
                        { label: 'Current Password', value: currentPwd, setter: setCurrentPwd, show: showCurrentPwd, toggle: setShowCurrentPwd },
                        { label: 'New Password',     value: newPwd,     setter: setNewPwd,     show: showNewPwd,     toggle: setShowNewPwd },
                        { label: 'Confirm New Password', value: confirmPwd, setter: setConfirmPwd, show: showNewPwd,  toggle: setShowNewPwd },
                      ].map(({ label, value, setter, show, toggle }) => (
                        <div key={label} className="relative">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                          <div className="relative">
                            <input
                              type={show ? 'text' : 'password'}
                              value={value}
                              onChange={e => setter(e.target.value)}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <button type="button" onClick={() => toggle(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      {pwdError   && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{pwdError}</p>}
                      {pwdSuccess && <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{pwdSuccess}</p>}
                      <button onClick={handleChangePassword} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                        Update Password
                      </button>

                      <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Two-Factor Auth</p>
                            <p className="text-xs text-gray-500">Extra security layer</p>
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-lg font-medium">Coming Soon</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appearance Tab */}
                  {settingsTab === 'appearance' && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Theme</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setTheme(true)}
                            className={`rounded-xl border p-4 text-left transition-all ${
                              isDark
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Moon className="w-4 h-4 text-blue-500" />
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Preserves the current premium dashboard appearance.</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTheme(false)}
                            className={`rounded-xl border p-4 text-left transition-all ${
                              !isDark
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Sun className="w-4 h-4 text-amber-500" />
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Light</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Soft pastel surfaces with darker text for high readability.</p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Accent Color</p>
                        <div className="flex gap-3 flex-wrap">
                          {[
                            { key: 'blue', swatch: 'bg-blue-500', label: 'Blue' },
                            { key: 'purple', swatch: 'bg-purple-500', label: 'Purple' },
                            { key: 'green', swatch: 'bg-green-500', label: 'Green' },
                            { key: 'rose', swatch: 'bg-rose-500', label: 'Rose' },
                            { key: 'orange', swatch: 'bg-orange-500', label: 'Orange' },
                          ].map((color) => (
                            <button
                              key={color.key}
                              type="button"
                              onClick={() => setAccentColor(color.key as typeof accentColor)}
                              title={`${color.label} theme`}
                              className={`relative w-9 h-9 ${color.swatch} rounded-full hover:scale-110 transition-transform shadow-md border-2 ${accentColor === color.key ? 'border-white ring-2 ring-offset-2 ring-blue-400 dark:ring-blue-500 dark:ring-offset-gray-900' : 'border-transparent'}`}
                            >
                              {accentColor === color.key && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected Accent</p>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full accent-bg" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">{accentColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* footer */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                  {settingsSaved && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Saved!
                    </span>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveSettings} className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── User Profile Dropdown ── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(v => !v); setShowNotifications(false); setShowSettings(false); }}
              className="flex items-center gap-2.5 ml-1 pl-3 rounded-xl px-2 py-1.5 transition-all border-l"
              style={{ borderColor: isDark ? '#374151' : '#e8cfc9' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f0dbd8')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {/* avatar */}
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {initials}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${availColor[availability as keyof typeof availColor]} rounded-full border-2 border-white`} />
              </div>
              {/* name */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold leading-tight" style={{ color: isDark ? '#F1F5F9' : '#1E1B4B' }}>{user?.name}</p>
                <p className="text-xs capitalize" style={{ color: isDark ? '#94A3B8' : '#6366F1' }}>{user?.role}</p>
              </div>
            </button>

            {showProfile && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '1px solid #334155' : '1px solid #DDD6FE',
                  boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(99,102,241,0.18)',
                }}
              >
                {/* profile header */}
                <div className="p-5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                        {initials}
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Camera className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className={`absolute top-0 right-0 w-4 h-4 ${availColor[availability as keyof typeof availColor]} rounded-full border-2 border-white`} />
                    </div>
                    <div className="flex-1">
                      {editingProfile ? (
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-white/20 border border-white/40 rounded-lg px-2 py-1 text-white text-sm font-bold placeholder-white/60 outline-none"
                        />
                      ) : (
                        <p className="text-white font-bold text-lg leading-tight">{user?.name}</p>
                      )}
                      <p className="text-white/80 text-xs capitalize mt-0.5 flex items-center gap-1">
                        {user?.role === 'manager' ? <Shield className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        {user?.role} · {user?.experience}y exp
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= Math.round(user?.rating || 0) ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} />
                        ))}
                        <span className="text-white/80 text-xs ml-1">{user?.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                    >
                      {editingProfile ? <Save className="w-4 h-4 text-white" /> : <Edit3 className="w-4 h-4 text-white" />}
                    </button>
                  </div>

                  {profileSaved && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Saved!
                    </div>
                  )}
                </div>

                {/* editable fields */}
                {editingProfile && (
                  <div
                    className="px-4 pt-3 space-y-2 border-b pb-3"
                    style={{ borderColor: isDark ? '#374151' : '#e8cfc9' }}
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" style={{ color: isDark ? '#9ca3af' : '#888888' }} />
                      <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                        placeholder="Phone number"
                        className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none border"
                        style={{
                          backgroundColor: isDark ? '#374151' : '#fdf5f4',
                          color:           isDark ? '#f9fafb' : '#111111',
                          borderColor:     isDark ? '#4b5563' : '#e8cfc9',
                        }}
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 mt-1.5" style={{ color: isDark ? '#9ca3af' : '#888888' }} />
                      <textarea value={editBio} onChange={e => setEditBio(e.target.value)}
                        placeholder="Write a short bio..."
                        rows={2}
                        className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none border resize-none"
                        style={{
                          backgroundColor: isDark ? '#374151' : '#fdf5f4',
                          color:           isDark ? '#f9fafb' : '#111111',
                          borderColor:     isDark ? '#4b5563' : '#e8cfc9',
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1">
                        <Save className="w-3 h-3" /> Save Profile
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                        style={{
                          backgroundColor: isDark ? '#374151' : '#f0dbd8',
                          color:           isDark ? '#d1d5db' : '#374151',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* info rows */}
                <div className="px-4 py-3 space-y-2.5 border-b" style={{ borderColor: isDark ? '#334155' : '#EDE9FE' }}>
                  <div className="flex items-center gap-3 text-xs" style={{ color: isDark ? '#94A3B8' : '#4B5563' }}>
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: isDark ? '#94A3B8' : '#4B5563' }}>
                    <Phone className="w-3.5 h-3.5 text-green-400" />
                    <span>{editPhone || user?.phone || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: isDark ? '#94A3B8' : '#4B5563' }}>
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    <span>{user?.currentProjects?.length || 0} active projects</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                      style={
                        availability === 'available'
                          ? { backgroundColor: isDark ? 'rgba(22,163,74,0.2)' : '#dcfce7', color: isDark ? '#4ade80' : '#15803d' }
                          : availability === 'busy'
                          ? { backgroundColor: isDark ? 'rgba(202,138,4,0.2)' : '#fef9c3', color: isDark ? '#facc15' : '#a16207' }
                          : { backgroundColor: isDark ? '#374151' : '#f3f4f6', color: isDark ? '#9ca3af' : '#555555' }
                      }
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${availColor[availability as keyof typeof availColor]}`} />
                      {availability.charAt(0).toUpperCase() + availability.slice(1)}
                    </span>
                  </div>
                </div>

                {/* stats */}
                <div className="grid grid-cols-3 border-b" style={{ borderColor: isDark ? '#334155' : '#EDE9FE' }}>
                  {[
                    { label: 'Tasks',    value: doneTasks,    color: '#6366F1' },
                    { label: 'Projects', value: userProjects, color: '#8B5CF6' },
                    { label: 'Skills',   value: user?.skills?.length || 0, color: '#10B981' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="py-3 text-center border-r last:border-r-0" style={{ borderColor: isDark ? '#334155' : '#EDE9FE' }}>
                      <p className="text-lg font-bold" style={{ color }}>{value}</p>
                      <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* skills */}
                {user?.skills && user.skills.length > 0 && (
                  <div className="px-4 py-3 border-b" style={{ borderColor: isDark ? '#334155' : '#EDE9FE' }}>
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: isDark ? '#6366F1' : '#7C3AED' }}>Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.slice(0, 5).map(s => (
                        <span
                          key={s.name}
                          className="px-2 py-0.5 text-xs rounded-full font-medium"
                          style={{
                            backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#EDE9FE',
                            color:           isDark ? '#A5B4FC' : '#4F46E5',
                          }}
                        >
                          {s.name}
                        </span>
                      ))}
                      {user.skills.length > 5 && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: isDark ? '#334155' : '#F5F0FF',
                            color:           isDark ? '#94A3B8' : '#6B7280',
                          }}
                        >
                          +{user.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* quick actions */}
                <div className="px-4 py-3 border-b flex gap-2" style={{ borderColor: isDark ? '#374151' : '#e8cfc9' }}>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#dbeafe',
                      color: isDark ? '#93c5fd' : '#1d4ed8',
                    }}
                  >
                    <User className="w-3.5 h-3.5" /> View Full Profile
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); setShowSettings(true); setSettingsTab('account'); }}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f0dbd8',
                      color:           isDark ? '#d1d5db' : '#374151',
                    }}
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                </div>

                {/* logout */}
                <div className="px-4 py-3">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold transition-colors border border-red-200 dark:border-red-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Standalone Logout button (matches screenshot) */}
          <button
            onClick={logout}
            style={{ backgroundColor: 'var(--accent-primary)' }}
            className="hidden md:flex items-center gap-2 ml-2 px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:opacity-90 active:opacity-80"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>

    {showNotificationModal && selectedNotification && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Notification details">
        <button
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowNotificationModal(false)}
          aria-label="Close notification details"
        />
        <div
          className="relative w-full max-w-lg rounded-2xl border shadow-2xl p-5"
          style={{
            background: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#DDD6FE',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${notifBg(selectedNotification.type)}`}>
                {selectedNotification.icon}
              </div>
              <div>
                <h4 className="text-lg font-bold" style={{ color: isDark ? '#F1F5F9' : '#1E1B4B' }}>
                  {selectedNotification.title}
                </h4>
                <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                  {selectedNotification.time}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationModal(false)}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: isDark ? '#334155' : '#F3F4F6', color: isDark ? '#CBD5E1' : '#4B5563' }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className="mt-4 rounded-xl border p-4"
            style={{
              borderColor: isDark ? '#334155' : '#E5E7EB',
              background: isDark ? 'rgba(30,41,59,0.7)' : '#F9FAFB',
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: isDark ? '#E2E8F0' : '#1F2937' }}>
              {selectedNotification.message}
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setShowNotificationModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

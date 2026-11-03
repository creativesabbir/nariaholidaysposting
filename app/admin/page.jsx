'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FeedbackModal from '@/components/FeedbackModal';
import { 
  Users, 
  Webhook, 
  Share2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Power, 
  Key, 
  Settings,
  Sparkles,
  Radio,
  LogOut,
  ArrowLeft,
  Shield,
  Layers,
  X,
  Image as ImageIcon
} from 'lucide-react';
import ImageUploadModal from '@/components/ImageUploadModal';
import { 
  fetchUsers, 
  fetchCurrentUser, 
  createUser, 
  deleteUser, 
  fetchSettings, 
  updateSettings, 
  testN8nWebhook,
  logoutUser,
  fetchAuthSession,
  uploadMediaFile
} from '@/lib/api';
import { 
  TikTokIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  YoutubeIcon, 
  FacebookIcon, 
  TwitterIcon, 
  PinterestIcon, 
  RedditIcon, 
  ThreadsIcon, 
  BlueskyIcon, 
  DiscordIcon, 
  TelegramIcon, 
  GoogleBusinessIcon 
} from '@/components/SocialIcons';

const ALL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: 'text-blue-600', defaultEnabled: true },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'text-pink-600', defaultEnabled: true },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: 'text-red-600', defaultEnabled: true },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-slate-900', defaultEnabled: true },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, color: 'text-blue-600', defaultEnabled: true },
  { id: 'x', name: 'X / Twitter', icon: TwitterIcon, color: 'text-slate-900', defaultEnabled: true },
  { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: 'text-slate-900', defaultEnabled: true },
  { id: 'bluesky', name: 'Bluesky', icon: BlueskyIcon, color: 'text-sky-500', defaultEnabled: true },
  { id: 'discord', name: 'Discord', icon: DiscordIcon, color: 'text-indigo-600', defaultEnabled: true },
  { id: 'telegram', name: 'Telegram', icon: TelegramIcon, color: 'text-sky-500', defaultEnabled: true },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-red-600', defaultEnabled: true },
  { id: 'google_business', name: 'Google Business', icon: GoogleBusinessIcon, color: 'text-blue-500', defaultEnabled: true },
  { id: 'reddit', name: 'Reddit', icon: RedditIcon, color: 'text-orange-600', defaultEnabled: true }
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'n8n', 'platforms'
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    n8n: {
      webhookUrl: '',
      secretToken: '',
      autoDispatch: true,
      lastTestedAt: null,
      lastStatus: 'ready'
    },
    platforms: {}
  });

  // User creation form
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUploadingUserAvatar, setIsUploadingUserAvatar] = useState(false);
  const userAvatarInputRef = useRef(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserRole, setNewUserRole] = useState('Travel Consultant');
  const [newUserAvatar, setNewUserAvatar] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isGeneralUploadOpen, setIsGeneralUploadOpen] = useState(false);

  // n8n testing state
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [n8nTestResult, setN8nTestResult] = useState(null);

  // Status modal
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const loadAll = async () => {
    try {
      const [uList, uCurrent, sets, auth] = await Promise.all([
        fetchUsers(),
        fetchCurrentUser(),
        fetchSettings(),
        fetchAuthSession()
      ]);
      if (Array.isArray(uList)) setUsers(uList);
      if (uCurrent) setCurrentUser(uCurrent);
      if (auth?.user) {
        if (!auth.user.isAdmin) {
          window.location.href = '/';
          return;
        }
        setCurrentUser(auth.user);
      } else if (!auth?.authenticated) {
        window.location.href = '/login?redirect=/admin';
        return;
      }
      if (sets?.settings) {
        setSettings(sets.settings);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  };

  // User Actions
  const handleUserAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        title: 'Image Format Required',
        message: 'Please select a valid image file (PNG, JPG, WebP).'
      });
      return;
    }

    try {
      setIsUploadingUserAvatar(true);
      const res = await uploadMediaFile(file);
      if (res?.url) {
        setNewUserAvatar(res.url);
      } else {
        setAlertConfig({
          isOpen: true,
          type: 'error',
          title: 'Upload Failed',
          message: res?.error || 'Failed to upload photo.'
        });
      }
    } catch (err) {
      console.error(err);
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Upload Error',
        message: 'Could not upload photo.'
      });
    } finally {
      setIsUploadingUserAvatar(false);
      if (userAvatarInputRef.current) {
        userAvatarInputRef.current.value = '';
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        title: 'Missing Details',
        message: 'Name and email are required to add a team member.'
      });
      return;
    }

    try {
      setIsAddingUser(true);
      const res = await createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword.trim() || 'password123',
        role: newUserRole,
        avatar: newUserAvatar,
        isAdmin: newUserIsAdmin
      });
      if (res.success) {
        setIsAddUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('password123');
        setNewUserRole('Travel Consultant');
        setNewUserAvatar('');
        setNewUserIsAdmin(false);
        await loadAll();
        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'Member Added',
          message: `${res.user.name} has been successfully registered to Naria Holidays.`
        });
      } else {
        setAlertConfig({
          isOpen: true,
          type: 'error',
          title: 'Could Not Add Member',
          message: res.error || 'Failed to create user.'
        });
      }
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.message
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (users.length <= 1) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        title: 'Action Prohibited',
        message: 'You cannot delete the only team account remaining.'
      });
      return;
    }

    try {
      const res = await deleteUser(userId);
      if (res.success) {
        await loadAll();
        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'Member Removed',
          message: `${userName} has been removed from the account roster.`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };



  // n8n Actions
  const handleSaveN8n = async () => {
    try {
      const res = await updateSettings({
        n8n: settings.n8n
      });
      if (res.success) {
        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'n8n Configuration Saved',
          message: 'Webhook URL and trigger preferences have been updated successfully.'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestN8n = async () => {
    try {
      setIsTestingN8n(true);
      setN8nTestResult(null);
      const res = await testN8nWebhook(settings.n8n?.webhookUrl);
      setN8nTestResult(res);
      await loadAll();
    } catch (err) {
      setN8nTestResult({
        success: false,
        error: err.message || 'Webhook test request failed'
      });
    } finally {
      setIsTestingN8n(false);
    }
  };

  // Platform Toggle Action
  const handleTogglePlatform = async (platformId) => {
    const currentStatus = settings.platforms?.[platformId]?.enabled ?? true;
    const newStatus = !currentStatus;

    const updatedPlatforms = {
      ...settings.platforms,
      [platformId]: {
        name: ALL_PLATFORMS.find(p => p.id === platformId)?.name || platformId,
        enabled: newStatus,
        status: newStatus ? 'active' : 'inactive'
      }
    };

    setSettings(prev => ({
      ...prev,
      platforms: updatedPlatforms
    }));

    try {
      await updateSettings({ platforms: updatedPlatforms });
    } catch (err) {
      console.error('Failed to toggle platform:', err);
    }
  };

  const activePlatformsCount = ALL_PLATFORMS.filter(p => {
    if (settings.platforms?.[p.id] !== undefined) {
      return settings.platforms[p.id].enabled !== false;
    }
    return p.defaultEnabled;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* DEDICATED STANDALONE ADMIN HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Admin Brand / Title */}
            <div className="flex items-center space-x-4">
              <img
                src="/logo.png"
                alt="Naria Holidays"
                className="h-10 sm:h-11 w-auto object-contain"
              />
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </span>
              </div>
            </div>

            {/* Actions: Return to Posting & Log Out */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go to Posting App</span>
              </Link>

              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
                <img
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                  alt="Admin"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-bold text-slate-800 leading-tight">{currentUser?.name || "Administrator"}</p>
                  <p className="text-[10px] text-indigo-600 font-semibold">Master Admin</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Admin Dashboard Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Control & Administration
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Secure Route
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage team accounts, configure n8n automation webhook dispatches, and toggle social platform availability.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 mr-1.5">Active Users:</span>
              <span className="font-bold text-slate-800">{users.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 mr-1.5">Platforms Online:</span>
              <span className="font-bold text-emerald-600">{activePlatformsCount}/13</span>
            </div>
          </div>
        </div>

        {/* 3 CORE TABS: Users, n8n, Platforms */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team & User Accounts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('n8n')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'n8n'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <Webhook className="w-4 h-4" />
            <span>n8n Webhook Engine</span>
            <span className={`w-2 h-2 rounded-full ${settings.n8n?.webhookUrl ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          </button>

          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'platforms'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Platform Controls</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
              13 channels
            </span>
          </button>
        </div>

        {/* 1. USERS & TEAM CONTROL TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registered Team Members</h3>
                <p className="text-xs text-slate-500">Users who can publish social campaigns and view analytics.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGeneralUploadOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Upload Image</span>
                </button>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Team Member</span>
                </button>
              </div>
            </div>

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id;
                return (
                  <div
                    key={u.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-white shadow-sm ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="relative">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          {isCurrent && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-white flex items-center justify-center">
                              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{u.name}</h4>
                            {u.isAdmin && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {u.role}
                          </span>
                        </div>
                      </div>

                      {users.length > 1 && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Authorized Account
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add User Modal */}
            {isAddUserOpen && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsAddUserOpen(false);
                }}
              >
                <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">Add Team Member</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="tanvir@nariaholidays.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Designation / Role</label>
                      <input
                        type="text"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        placeholder="e.g. Travel Consultant / Visa Specialist"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Login Password</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">Profile Photo (Optional)</label>
                      <input
                        ref={userAvatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUserAvatarFileChange}
                        className="hidden"
                      />
                      <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        {newUserAvatar ? (
                          <img
                            src={newUserAvatar}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            {newUserAvatar ? 'Photo Selected' : 'Upload Member Photo'}
                          </p>
                          <p className="text-[11px] text-slate-400">Direct upload from device</p>
                        </div>
                        <button
                          type="button"
                          disabled={isUploadingUserAvatar}
                          onClick={() => userAvatarInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                        >
                          {isUploadingUserAvatar ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <span>{newUserAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newUserIsAdmin}
                          onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-semibold text-slate-700">Grant Admin Privileges (Can access this portal)</span>
                      </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingUser}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        {isAddingUser ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Member</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. N8N WEBHOOK CONTROL TAB */}
        {activeTab === 'n8n' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">n8n Workflow Automation Webhook</h3>
                <p className="text-xs text-slate-500">Every published or scheduled post sends an automated payload to this endpoint.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${settings.n8n?.webhookUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-slate-700">
                  {settings.n8n?.webhookUrl ? 'Webhook Ready' : 'Endpoint Not Set'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Production n8n Webhook URL
                </label>
                <div className="relative">
                  <Webhook className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="url"
                    value={settings.n8n?.webhookUrl || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      n8n: { ...settings.n8n, webhookUrl: e.target.value }
                    })}
                    placeholder="https://n8n.your-domain.com/webhook/naria-holidays-post"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Secret Token / Authorization Header (Optional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={settings.n8n?.secretToken || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      n8n: { ...settings.n8n, secretToken: e.target.value }
                    })}
                    placeholder="nh_secret_token_key..."
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Auto-Dispatch on Publish</p>
                  <p className="text-[11px] text-slate-500">Automatically trigger n8n workflow whenever someone publishes or schedules a post.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.n8n?.autoDispatch ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      n8n: { ...settings.n8n, autoDispatch: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Action Buttons: Save & Test */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveN8n}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Save Webhook Configuration
                </button>

                <button
                  type="button"
                  onClick={handleTestN8n}
                  disabled={isTestingN8n || !settings.n8n?.webhookUrl}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isTestingN8n ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Testing Webhook Connection...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5 text-blue-600" />
                      <span>Test Webhook Ping (Diagnostic)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Result Display */}
              {n8nTestResult && (
                <div className={`p-4 rounded-2xl border text-xs ${
                  n8nTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    {n8nTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{n8nTestResult.success ? 'Webhook Responded Successfully' : 'Webhook Ping Failed'}</span>
                  </div>
                  <p className="text-[11px] font-mono">
                    Status: {n8nTestResult.statusCode || (n8nTestResult.success ? '200 OK' : 'Failed')} | Latency: {n8nTestResult.latencyMs || 0}ms
                  </p>
                  {n8nTestResult.error && (
                    <p className="text-[11px] mt-1 text-rose-700">Error: {n8nTestResult.error}</p>
                  )}
                </div>
              )}

              {/* Sample Payload */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  Payload Sent to n8n Webhook:
                </span>
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`{
  "event": "post.publish",
  "postId": "post_1793708821",
  "caption": "Special Luxury Tour in Sylhet...",
  "mediaUrls": ["/uploads/tea-resort.jpg"],
  "platforms": ["facebook", "instagram", "tiktok"],
  "publishedBy": "Sabbir Ahmed",
  "publishedByEmail": "sabbir@nariaholidays.com",
  "timestamp": "${new Date().toISOString()}"
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 3. PLATFORM CONTROLS TAB */}
        {activeTab === 'platforms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Social Media Platforms Switchboard</h3>
                <p className="text-xs text-slate-500">Toggle platforms on or off. Disabled platforms will be grayed out in Post Composer.</p>
              </div>
              <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                {activePlatformsCount} of 13 Platforms Enabled
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {ALL_PLATFORMS.map((plat) => {
                const Icon = plat.icon;
                const isEnabled = settings.platforms?.[plat.id] !== undefined 
                  ? settings.platforms[plat.id].enabled !== false
                  : plat.defaultEnabled;

                return (
                  <div
                    key={plat.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isEnabled
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        : 'bg-slate-100/70 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${isEnabled ? 'bg-slate-50' : 'bg-slate-200'}`}>
                        <Icon className={`w-5 h-5 ${isEnabled ? plat.color : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                          {plat.name}
                        </h4>
                        <span className={`text-[10px] font-semibold ${isEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isEnabled ? '● Active in Composer' : '○ Disabled'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePlatform(plat.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modern Alert Modal */}
      <FeedbackModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText="Done"
        onConfirm={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Modal for Member Avatar Upload - strictly file upload, no URL */}
      <ImageUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSuccess={(url) => setNewUserAvatar(url)}
        title="Upload Member Avatar"
        description="Choose a photo from your computer for this team member"
      />

      {/* Modal for General Image Assets Upload - strictly file upload, no URL */}
      <ImageUploadModal
        isOpen={isGeneralUploadOpen}
        onClose={() => setIsGeneralUploadOpen(false)}
        onSuccess={() => {
          setAlertConfig({
            isOpen: true,
            type: 'success',
            title: 'Image Uploaded',
            message: 'Your image has been hosted and the link has been generated.'
          });
        }}
        title="Upload Image"
        description="Upload photos directly from device (No URL required)"
      />
    </div>
  );
}

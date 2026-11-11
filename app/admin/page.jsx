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
  Image as ImageIcon,
  Copy,
  Check,
  Palette,
  RotateCcw,
  Upload
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
import { ALL_SOCIAL_PLATFORMS as ALL_PLATFORMS } from '@/components/SocialIcons';

const N8N_PAYLOAD_EXAMPLES = {
  image: {
    event: "post.publish",
    postId: "post-1793717687359",
    type: "image",
    caption: "🌍 ইউরোপ-আমেরিকাসহ জনপ্রিয় গন্তব্যের ভিসা—সাশ্রয়ী রেটে, সহজ প্রসেসে! ✨\n\nভিসা নিয়ে আর দুশ্চিন্তা নয়! আপনার পছন্দের গন্তব্যের Visa Processing-এর পুরো প্রক্রিয়ায় পাশে আছে Naria Holidays। 🧳✈️\n\n#NariaHolidays #TravelBangladesh #HolidayPackages",
    mediaUrls: [
      "https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg",
      "https://i.ibb.co/C3bbTVr6/sajek-valley-tour.jpg"
    ],
    mediaUrl: "https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg",
    platforms: ["facebook", "instagram", "linkedin", "tiktok"],
    author: {
      id: "d2854f01-aeb1-4d99-9908-86bdf0380044",
      name: "Abir Hasan Sabbir",
      email: "excreative.info@gmail.com",
      role: "Founder & Travel Consultant",
      avatar: "https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg"
    },
    publishedBy: "Abir Hasan Sabbir",
    publishedByEmail: "excreative.info@gmail.com",
    scheduledAt: null,
    timestamp: "2026-11-04T10:45:00.000Z"
  },
  video: {
    event: "post.publish",
    postId: "post-1793711339918",
    type: "video",
    caption: "Experience Cox's Bazar Sunset like never before with Naria Holidays Premium Tour Package! 🌅🏝️ #CoxsBazar #ExploreWithNaria",
    mediaUrls: [
      "https://litter.catbox.moe/5avjkc.mp4"
    ],
    mediaUrl: "https://litter.catbox.moe/5avjkc.mp4",
    platforms: ["tiktok", "youtube", "facebook", "instagram"],
    author: {
      id: "d2854f01-aeb1-4d99-9908-86bdf0380044",
      name: "Abir Hasan Sabbir",
      email: "excreative.info@gmail.com",
      role: "Founder & Travel Consultant",
      avatar: "https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg"
    },
    publishedBy: "Abir Hasan Sabbir",
    publishedByEmail: "excreative.info@gmail.com",
    scheduledAt: null,
    timestamp: "2026-11-04T10:45:00.000Z"
  },
  scheduled: {
    event: "post.scheduled",
    postId: "post-1793720491024",
    type: "image",
    caption: "Exclusive Early Bird Offer for Sajek Valley Winter Tour 2026! 🌄 Book your seat today! #SajekValley #NariaHolidays",
    mediaUrls: [
      "https://i.ibb.co/C3bbTVr6/sajek-valley-tour.jpg"
    ],
    mediaUrl: "https://i.ibb.co/C3bbTVr6/sajek-valley-tour.jpg",
    platforms: ["facebook", "instagram", "threads"],
    author: {
      id: "d2854f01-aeb1-4d99-9908-86bdf0380044",
      name: "Abir Hasan Sabbir",
      email: "excreative.info@gmail.com",
      role: "Founder & Travel Consultant",
      avatar: "https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg"
    },
    publishedBy: "Abir Hasan Sabbir",
    publishedByEmail: "excreative.info@gmail.com",
    scheduledAt: "2026-11-08T19:30:00",
    timestamp: "2026-11-04T10:45:00.000Z"
  },
  text: {
    event: "post.publish",
    postId: "post-1793859123456",
    type: "text",
    caption: "✈️ Flash Update: Sajek & Cox's Bazar Group Tour early-bird seats are now open! Message us or check Slack/Listmonk updates for agency rates. #NariaHolidays #TravelBangladesh",
    mediaUrls: [],
    mediaUrl: "",
    platforms: ["x", "slack", "whop", "listmonk", "facebook", "linkedin"],
    author: {
      id: "d2854f01-aeb1-4d99-9908-86bdf0380044",
      name: "Abir Hasan Sabbir",
      email: "excreative.info@gmail.com",
      role: "Founder & Travel Consultant",
      avatar: "https://i.ibb.co/21vvfcbS/abir-hasan-avatar.jpg"
    },
    publishedBy: "Abir Hasan Sabbir",
    publishedByEmail: "excreative.info@gmail.com",
    scheduledAt: null,
    timestamp: "2026-11-11T06:30:00.000Z"
  }
};

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

  // n8n testing & payload example states
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [n8nTestResult, setN8nTestResult] = useState(null);
  const [activePayloadTab, setActivePayloadTab] = useState('image'); // 'image' | 'video' | 'scheduled'
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Brand & Logo Customization state
  const [brandLogo, setBrandLogo] = useState('/logo.png');
  const [brandIcon, setBrandIcon] = useState('/logo-icon.png');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const logoInputRef = useRef(null);
  const iconInputRef = useRef(null);

  const handleCopyPayload = (text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch (e) {}
  };

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
        if (sets.settings.branding?.logoUrl) {
          setBrandLogo(sets.settings.branding.logoUrl);
        }
        if (sets.settings.branding?.iconUrl) {
          setBrandIcon(sets.settings.branding.iconUrl);
        }
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

  // Brand & Logo Customization Handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const res = await uploadMediaFile(file);
      if (res?.url) {
        setBrandLogo(res.url);
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not upload the new logo. Please try again.'
      });
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingIcon(true);
      const res = await uploadMediaFile(file);
      if (res?.url) {
        setBrandIcon(res.url);
      }
    } catch (err) {
      console.error('Icon upload error:', err);
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not upload the square icon. Please try again.'
      });
    } finally {
      setIsUploadingIcon(false);
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  };

  const handleSaveBranding = async () => {
    try {
      setIsSavingBranding(true);
      const updatedBranding = {
        logoUrl: brandLogo || '/logo.png',
        iconUrl: brandIcon || '/logo-icon.png',
        updatedAt: new Date().toISOString()
      };

      const res = await updateSettings({
        ...settings,
        branding: updatedBranding
      });

      if (res?.success) {
        setSettings(prev => ({ ...prev, branding: updatedBranding }));
        try {
          localStorage.setItem('nh_brand_logo', updatedBranding.logoUrl);
          localStorage.setItem('nh_brand_icon', updatedBranding.iconUrl);
        } catch (e) {}
        window.dispatchEvent(new Event('nh_brand_updated'));

        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'Brand Updated!',
          message: 'Website logo and branding assets have been updated successfully across the entire app.'
        });
      } else {
        throw new Error(res?.error || 'Failed to save brand settings');
      }
    } catch (err) {
      console.error('Save branding error:', err);
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update branding. Please try again.'
      });
    } finally {
      setIsSavingBranding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* DEDICATED STANDALONE ADMIN HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Admin Brand / Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="hover:opacity-95 transition-opacity">
                <img
                  src={brandLogo || '/logo.png'}
                  alt="Naria Holidays"
                  className="h-10 sm:h-11 w-auto object-contain max-w-[200px]"
                  onError={() => setBrandLogo('/logo.png')}
                />
              </Link>
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
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
                  }}
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
              {ALL_PLATFORMS.length} channels
            </span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'branding'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Brand & Logo</span>
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
                            src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                            alt={u.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
                            }}
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

              {/* Comprehensive n8n Payload Examples Section */}
              <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Expected n8n Webhook Payload Schema
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Select an event type below to see the exact JSON structure dispatched to your n8n automation node.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPayload(JSON.stringify(N8N_PAYLOAD_EXAMPLES[activePayloadTab], null, 2))}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sub-tab pills for Image, Video, and Scheduled examples */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl space-x-1">
                  <button
                    type="button"
                    onClick={() => setActivePayloadTab('image')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePayloadTab === 'image'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Image Post (Publish)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePayloadTab('video')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePayloadTab === 'video'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Video Post (Publish)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePayloadTab('text')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePayloadTab === 'text'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Text Post (Publish)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePayloadTab('scheduled')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activePayloadTab === 'scheduled'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Scheduled Post
                  </button>
                </div>

                {/* Interactive JSON viewer */}
                <pre className="p-4 sm:p-5 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner max-h-96">
{JSON.stringify(N8N_PAYLOAD_EXAMPLES[activePayloadTab], null, 2)}
                </pre>

                {/* Field Dictionary / Key Reference Table */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
                  <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    n8n Payload Field Dictionary
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">event</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string</div>
                      <div className="sm:col-span-6 text-slate-600">Event type: <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px]">post.publish</code> (instant) or <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px]">post.scheduled</code></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">postId</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string</div>
                      <div className="sm:col-span-6 text-slate-600">Unique timestamp-based post identifier in Supabase database.</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">type</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">&apos;image&apos; | &apos;video&apos; | &apos;text&apos;</div>
                      <div className="sm:col-span-6 text-slate-600">Content type indicator to branch workflows in n8n (e.g. IF node).</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">caption</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string</div>
                      <div className="sm:col-span-6 text-slate-600">Full promotional message including line breaks, emojis, and hashtags.</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">mediaUrls</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string[]</div>
                      <div className="sm:col-span-6 text-slate-600">Array of direct public CDN URLs (ImgBB direct image links or MP4 stream link).</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">mediaUrl</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string</div>
                      <div className="sm:col-span-6 text-slate-600">Primary cover image or video URL string for easy single-value mapping.</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">platforms</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string[]</div>
                      <div className="sm:col-span-6 text-slate-600">Selected target social accounts (e.g. <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px]">[&quot;facebook&quot;, &quot;instagram&quot;, &quot;tiktok&quot;]</code>).</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">publishedBy</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string</div>
                      <div className="sm:col-span-6 text-slate-600">Name of the logged-in team member who authored and submitted the post.</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">publishedByEmail</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string</div>
                      <div className="sm:col-span-6 text-slate-600">Email address of the author for tracking and team notifications.</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">scheduledAt</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string | null</div>
                      <div className="sm:col-span-6 text-slate-600">Target publication ISO string (e.g. 2026-11-08T19:30:00) or null if published now.</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 gap-2">
                      <div className="sm:col-span-3 font-mono font-bold text-blue-600">timestamp</div>
                      <div className="sm:col-span-3 font-mono text-slate-500">string (ISO)</div>
                      <div className="sm:col-span-6 text-slate-600">Exact UTC timestamp when the post was dispatched to n8n.</div>
                    </div>
                  </div>
                </div>
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
                {activePlatformsCount} of {ALL_PLATFORMS.length} Platforms Enabled
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
                          {plat.adminName || plat.name}
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

        {/* 4. BRAND & LOGO CUSTOMIZATION TAB */}
        {activeTab === 'branding' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-blue-600" />
                  <span>Agency Brand & Logo Customization</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your company logo and icon. Updates take effect immediately across Navbar, Login screen, and Live Feeds.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveBranding}
                disabled={isSavingBranding}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
              >
                {isSavingBranding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Save Brand Settings</span>
                  </>
                )}
              </button>
            </div>

            {/* Grid for Logo & Icon Customization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Main Horizontal Header Logo */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">Main Website Logo</h4>
                      <p className="text-[11px] text-slate-400">Displayed in Navbar, Admin Header & Login screen</p>
                    </div>
                  </div>
                  {brandLogo !== '/logo.png' && (
                    <button
                      type="button"
                      onClick={() => setBrandLogo('/logo.png')}
                      className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-rose-600 font-semibold cursor-pointer"
                      title="Reset to default brand logo"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Logo Preview Container */}
                <div className="h-32 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 flex items-center justify-center relative overflow-hidden group">
                  <img
                    src={brandLogo || '/logo.png'}
                    alt="Main Brand Logo"
                    className="max-h-20 w-auto object-contain transition-transform group-hover:scale-105"
                    onError={() => setBrandLogo('/logo.png')}
                  />
                  <span className="absolute bottom-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-500 shadow-2xs">
                    Live Preview
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingLogo ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading & hosting to ImgBB...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Logo</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Or direct logo image URL:
                    </label>
                    <input
                      type="url"
                      value={brandLogo}
                      onChange={(e) => setBrandLogo(e.target.value)}
                      placeholder="https://.../logo.png"
                      className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 shadow-2xs font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 <strong>Tip:</strong> Transparent PNG or WebP format with horizontal ratio (e.g. 300x80px) works best.
                  </p>
                </div>
              </div>

              {/* 2. Square Brand Icon (Avatars, Favicon, Feeds) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">Square App Icon / Avatar</h4>
                      <p className="text-[11px] text-slate-400">Used for Social Feed mockups, profile avatars & favicon</p>
                    </div>
                  </div>
                  {brandIcon !== '/logo-icon.png' && (
                    <button
                      type="button"
                      onClick={() => setBrandIcon('/logo-icon.png')}
                      className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-rose-600 font-semibold cursor-pointer"
                      title="Reset to default icon"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Square Icon Preview */}
                <div className="h-32 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 flex items-center justify-center space-x-6 relative">
                  {/* Square Box Preview */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center overflow-hidden">
                      <img
                        src={brandIcon || '/logo-icon.png'}
                        alt="Square Icon"
                        className="w-full h-full object-contain"
                        onError={() => setBrandIcon('/logo-icon.png')}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Rounded</span>
                  </div>

                  {/* Circular Avatar Preview */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-16 h-16 rounded-full bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center overflow-hidden ring-2 ring-blue-100">
                      <img
                        src={brandIcon || '/logo-icon.png'}
                        alt="Circular Avatar"
                        className="w-full h-full object-contain"
                        onError={() => setBrandIcon('/logo-icon.png')}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Feed Avatar</span>
                  </div>

                  <span className="absolute bottom-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-500 shadow-2xs">
                    Preview
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={iconInputRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleIconUpload}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      disabled={isUploadingIcon}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingIcon ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading & hosting to ImgBB...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Square Icon</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Or direct icon image URL:
                    </label>
                    <input
                      type="url"
                      value={brandIcon}
                      onChange={(e) => setBrandIcon(e.target.value)}
                      placeholder="https://.../logo-icon.png"
                      className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 shadow-2xs font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 <strong>Tip:</strong> 1:1 aspect ratio (e.g. 512x512px) with transparent or solid background.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Navigation Simulation */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Navbar Live Simulation</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Realtime Preview
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                This is exactly how your website navigation header looks right now with this logo:
              </p>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                <img
                  src={brandLogo || '/logo.png'}
                  alt="Simulated Logo"
                  className="h-10 sm:h-12 w-auto object-contain max-w-[200px]"
                  onError={() => setBrandLogo('/logo.png')}
                />
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs border border-blue-200">
                    + Create Post
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white text-slate-600 font-bold text-xs border border-slate-200">
                    History
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Admin Footer Credit */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400 mt-auto">
        <p>
          Powered by -{' '}
          <a
            href="https://goaivisibility.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-600 hover:text-blue-600 transition-colors no-underline"
          >
            goAI Visibility Agency
          </a>
        </p>
      </footer>

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

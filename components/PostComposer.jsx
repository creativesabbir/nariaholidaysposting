'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Send, 
  X, 
  Check, 
  Calendar, 
  Clock, 
  Sparkles, 
  Hash, 
  ChevronRight, 
  Plus,
  RefreshCw,
  Film
} from 'lucide-react';
import { 
  ALL_SOCIAL_PLATFORMS as SOCIAL_ACCOUNTS,
  getPlatformCapabilityStatus
} from './SocialIcons';
import FeedbackModal from './FeedbackModal';
import CalendarModal from './CalendarModal';
import TimePickerModal from './TimePickerModal';
import { createPost, uploadMediaFile, fetchSettings } from '@/lib/api';
import { compressImageIfNeeded } from '@/lib/imageOptimizer';

const SUGGESTED_TAGS = [
  '#NariaHolidays',
  '#TravelBangladesh',
  '#CoxsBazar',
  '#SajekValley',
  '#HolidayPackages',
  '#ExploreWithNaria'
];

export default function PostComposer({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  caption, 
  setCaption, 
  mediaUrl, 
  setMediaUrl, 
  mediaUrls = [],
  setMediaUrls,
  mediaFile,
  setMediaFile,
  onPostCreated 
}) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({});
  const [isScheduled, setIsScheduled] = useState(false);

  // Dedicated Video Upload & Processing System states
  const [videoUploadState, setVideoUploadState] = useState({
    isUploading: false,
    progress: 0,
    loadedMB: '0.0 MB',
    totalMB: '0.0 MB',
    phase: 'idle',
    fileName: '',
    previewBlobUrl: null
  });

  // Dedicated Image Upload & Processing System states
  const [imageUploadState, setImageUploadState] = useState({
    isUploading: false,
    progress: 0,
    loadedMB: '0.0 MB',
    totalMB: '0.0 MB',
    phase: 'idle',
    fileName: '',
    previewBlobUrl: null
  });

  useEffect(() => {
    const loadPlatformSettings = () => {
      fetchSettings(true).then(data => {
        if (data?.settings?.platforms) {
          setPlatformSettings(data.settings.platforms);
        }
      }).catch(() => {});
    };

    loadPlatformSettings();

    const handleVisibilityOrFocus = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        loadPlatformSettings();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('nh_settings_updated', loadPlatformSettings);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('nh_settings_updated', loadPlatformSettings);
    };
  }, []);
  
  // Custom Date and Time states for high-end schedule picker
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('19:30'); // 7:30 PM default prime time
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const formatDisplayDate = (dStr) => {
    if (!dStr) return 'Pick Date';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dStr;
  };

  const formatDisplayTime = (tStr) => {
    if (!tStr) return 'Pick Time';
    const [hStr, mStr] = tStr.split(':');
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return tStr;
    const isPM = h >= 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${mStr || '00'} ${isPM ? 'PM' : 'AM'}`;
  };

  // Auto-fitting caption textarea (min 160px, max 350px, internal scroll beyond 350px)
  const captionTextareaRef = useRef(null);

  const adjustCaptionHeight = () => {
    const el = captionTextareaRef.current;
    if (el) {
      el.style.height = 'auto';
      const targetHeight = Math.min(Math.max(el.scrollHeight, 160), 350);
      el.style.height = `${targetHeight}px`;
      if (el.scrollHeight > 350) {
        el.style.overflowY = 'auto';
      } else {
        el.style.overflowY = 'hidden';
      }
    }
  };

  useEffect(() => {
    adjustCaptionHeight();
  }, [caption]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modern Feedback Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    confirmText: 'Done',
    secondaryAction: null
  });

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    if (activeTab === 'image') {
      const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setModalConfig({
          isOpen: true,
          type: 'warning',
          title: 'Image Format Required',
          message: 'Please select only valid image file formats (PNG, JPG, or WebP).',
          confirmText: 'Got it'
        });
        return;
      }

      const hasLargeFiles = files.some(f => f.size > 2.5 * 1024 * 1024 && f.type !== 'image/gif');
      const localPreviewUrl = URL.createObjectURL(files[0]);

      if (hasLargeFiles) {
        setImageUploadState({
          isUploading: true,
          progress: 5,
          loadedMB: '0.0 MB',
          totalMB: `${(files.reduce((a, b) => a + b.size, 0) / (1024 * 1024)).toFixed(1)} MB`,
          phase: 'compressing',
          fileName: files.length === 1 ? files[0].name : `${files.length} Photos`,
          previewBlobUrl: localPreviewUrl
        });
      }

      // Automatically compress any large photos before uploading
      const optimizedFiles = await Promise.all(files.map(f => compressImageIfNeeded(f)));

      const totalBytes = optimizedFiles.reduce((acc, f) => acc + f.size, 0);
      const totalMbStr = (totalBytes / (1024 * 1024)).toFixed(1);

      setImageUploadState({
        isUploading: true,
        progress: 8,
        loadedMB: '0.1 MB',
        totalMB: `${totalMbStr} MB`,
        phase: 'uploading',
        fileName: optimizedFiles.length === 1 ? optimizedFiles[0].name : `${optimizedFiles.length} Photos`,
        previewBlobUrl: localPreviewUrl
      });

      try {
        setIsUploading(true);
        const loadedMap = new Array(optimizedFiles.length).fill(0);

        const uploadPromises = optimizedFiles.map((file, idx) => {
          return uploadMediaFile(file, ({ loaded }) => {
            loadedMap[idx] = loaded;
            const sumLoaded = loadedMap.reduce((a, b) => a + b, 0);
            const percent = Math.min(Math.round((sumLoaded / totalBytes) * 100), 98);
            const loadedMbStr = (sumLoaded / (1024 * 1024)).toFixed(1);
            setImageUploadState(prev => ({
              ...prev,
              progress: Math.max(percent, 8),
              loadedMB: `${loadedMbStr} MB`,
              phase: percent >= 95 ? 'processing' : 'uploading'
            }));
          });
        });

        const results = await Promise.all(uploadPromises);
        const validUrls = results.map(r => r?.url).filter(Boolean);

        if (validUrls.length > 0) {
          const currentList = mediaUrls || [];
          const updatedList = [...currentList, ...validUrls];
          if (setMediaUrls) setMediaUrls(updatedList);
          setMediaUrl(updatedList[0]);
          setMediaFile({
            name: `${updatedList.length} photo${updatedList.length > 1 ? 's' : ''}`,
            size: `${totalMbStr} MB`,
            type: 'image'
          });
          setImageUploadState(prev => ({
            ...prev,
            isUploading: false,
            progress: 100,
            phase: 'ready'
          }));
        }
      } catch (err) {
        console.error('Image upload error:', err);
        setImageUploadState(prev => ({
          ...prev,
          isUploading: false,
          phase: 'error'
        }));
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Image Upload Failed',
          message: 'Could not upload selected photos. Please try again.',
          confirmText: 'Close'
        });
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Video Tab (single video)
    const file = files[0];
    if (!file.type.startsWith('video/')) {
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Video Format Required',
        message: 'Please select a valid video file format (MP4, MOV, or WebM).',
        confirmText: 'Got it'
      });
      return;
    }

    // Video size validation: max 200 MB (100% Free Cloud Hosting supports up to 1GB)
    const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
    if (file.size > MAX_VIDEO_BYTES) {
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Video Exceeds 200 MB',
        message: `The selected video is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The maximum supported video size is 200 MB. Please trim or compress your video.`,
        confirmText: 'Understood'
      });
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    const totalMbNum = (file.size / (1024 * 1024)).toFixed(1);

    setVideoUploadState({
      isUploading: true,
      progress: 5,
      loadedMB: '0.1 MB',
      totalMB: `${totalMbNum} MB`,
      phase: 'uploading',
      fileName: file.name,
      previewBlobUrl: localPreviewUrl
    });

    try {
      setIsUploading(true);
      const res = await uploadMediaFile(file, ({ percent, loaded, total }) => {
        const loadedMb = (loaded / (1024 * 1024)).toFixed(1);
        const totalMbCalc = (total / (1024 * 1024)).toFixed(1);
        setVideoUploadState(prev => ({
          ...prev,
          progress: percent,
          loadedMB: `${loadedMb} MB`,
          totalMB: `${totalMbCalc} MB`,
          phase: percent >= 98 ? 'processing' : 'uploading'
        }));
      });

      if (res?.url) {
        setMediaUrl(res.url);
        if (setMediaUrls) setMediaUrls([res.url]);
        setMediaFile({
          name: file.name,
          size: `${totalMbNum} MB`,
          type: 'video'
        });
        setVideoUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
          phase: 'ready'
        }));
      } else {
        throw new Error(res?.error || 'Could not process video');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      setVideoUploadState(prev => ({
        ...prev,
        isUploading: false,
        phase: 'error'
      }));
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Video Upload Failed',
        message: err.message || 'Could not upload media file. Please check file size and try again.',
        confirmText: 'Close'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeImageAt = (index) => {
    const current = mediaUrls || [];
    const updated = current.filter((_, idx) => idx !== index);
    if (setMediaUrls) setMediaUrls(updated);
    setMediaUrl(updated[0] || '');
    if (updated.length === 0) {
      setMediaFile(null);
    } else {
      setMediaFile({
        name: `${updated.length} photo${updated.length > 1 ? 's' : ''}`,
        size: '',
        type: 'image'
      });
    }
  };

  const removeAllMedia = () => {
    if (videoUploadState.previewBlobUrl) {
      try { URL.revokeObjectURL(videoUploadState.previewBlobUrl); } catch (e) {}
    }
    setVideoUploadState({
      isUploading: false,
      progress: 0,
      loadedMB: '0.0 MB',
      totalMB: '0.0 MB',
      phase: 'idle',
      fileName: '',
      previewBlobUrl: null
    });
    if (imageUploadState.previewBlobUrl) {
      try { URL.revokeObjectURL(imageUploadState.previewBlobUrl); } catch (e) {}
    }
    setImageUploadState({
      isUploading: false,
      progress: 0,
      loadedMB: '0.0 MB',
      totalMB: '0.0 MB',
      phase: 'idle',
      fileName: '',
      previewBlobUrl: null
    });
    if (setMediaUrls) setMediaUrls([]);
    setMediaUrl('');
    setMediaFile(null);
  };

  // Determine whether a platform is currently disabled based on Admin settings & Post Type rules
  const getPlatformStatus = (platformId) => {
    const imgCount = mediaUrls ? mediaUrls.length : (mediaUrl ? 1 : 0);
    return getPlatformCapabilityStatus(platformId, activeTab, imgCount, platformSettings);
  };

  // Auto-deselect platforms that become disabled based on post type / media rules
  useEffect(() => {
    setSelectedPlatforms(prev => {
      const next = prev.filter(id => !getPlatformStatus(id).isOff);
      return next.length === prev.length ? prev : next;
    });
  }, [activeTab, mediaUrls, mediaUrl, platformSettings]);

  const togglePlatform = (id) => {
    const status = getPlatformStatus(id);
    if (status.isOff) return;
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const selectAllPlatforms = () => {
    const allAvailable = SOCIAL_ACCOUNTS.filter(a => {
      const status = getPlatformStatus(a.id);
      return !status.isOff && !a.unavailable;
    }).map(a => a.id);
    setSelectedPlatforms(allAvailable);
  };

  const clearPlatforms = () => {
    setSelectedPlatforms([]);
  };

  const addTag = (tag) => {
    if (caption.includes(tag)) return;
    setCaption(prev => prev.trim() ? `${prev.trim()} ${tag}` : tag);
  };

  // Quick Date Helpers for modern schedule picker
  const setQuickDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setScheduleDate(`${yyyy}-${mm}-${dd}`);
  };

  const setQuickTime = (timeStr) => {
    setScheduleTime(timeStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasMedia = activeTab === 'text'
      ? false
      : activeTab === 'image'
        ? ((mediaUrls && mediaUrls.length > 0) || !!mediaUrl)
        : !!mediaUrl;

    if (activeTab === 'text' && !caption.trim()) {
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Text Content Required',
        message: 'Please write your post text before publishing.',
        confirmText: 'Understood'
      });
      return;
    }

    if (!caption.trim() && !hasMedia) {
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Content Required',
        message: 'Please write a caption or upload an image/video asset before publishing.',
        confirmText: 'Understood'
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Select Social Platforms',
        message: 'Please select at least one social media channel from the Social Accounts list.',
        confirmText: 'Understood'
      });
      return;
    }

    let finalScheduledAt = null;
    if (isScheduled) {
      if (!scheduleDate || !scheduleTime) {
        setModalConfig({
          isOpen: true,
          type: 'warning',
          title: 'Schedule Date & Time Required',
          message: 'Please pick both a date and time for when you want this post to be published.',
          confirmText: 'Set Time'
        });
        return;
      }
      finalScheduledAt = `${scheduleDate}T${scheduleTime}:00`;
    }

    try {
      setIsSubmitting(true);

      const finalMediaUrls = activeTab === 'text'
        ? []
        : activeTab === 'image'
          ? ((mediaUrls && mediaUrls.length > 0) ? mediaUrls : (mediaUrl ? [mediaUrl] : []))
          : (mediaUrl ? [mediaUrl] : []);

      const finalPlatforms = selectedPlatforms.filter(id => !getPlatformStatus(id).isOff);

      const postData = {
        type: activeTab,
        caption: caption.trim(),
        mediaUrls: finalMediaUrls,
        platforms: finalPlatforms,
        scheduledAt: finalScheduledAt
      };

      const res = await createPost(postData);
      if (res.success) {
        if (isScheduled) {
          const dateObj = new Date(finalScheduledAt);
          const formatted = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          setModalConfig({
            isOpen: true,
            type: 'scheduled',
            title: 'Campaign Successfully Scheduled!',
            message: `Your post is scheduled to publish on ${formatted} across ${selectedPlatforms.length} social channels.`,
            confirmText: 'Create Another Post',
            secondaryAction: {
              label: 'View in History',
              href: '/history'
            }
          });
        } else {
          setModalConfig({
            isOpen: true,
            type: 'success',
            title: 'Post Published Successfully!',
            message: `Your campaign has been successfully published across ${selectedPlatforms.length} social media channels.`,
            confirmText: 'Create Another Post',
            secondaryAction: {
              label: 'View in History',
              href: '/history'
            }
          });
        }

        // Reset composer
        setCaption('');
        setMediaUrl('');
        if (setMediaUrls) setMediaUrls([]);
        setMediaFile(null);
        setSelectedPlatforms([]);
        setIsScheduled(false);
        setScheduleDate('');

        if (onPostCreated) onPostCreated();
      }
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Publishing Error',
        message: 'Failed to publish post. Please check your network connection and try again.',
        confirmText: 'Close'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      {/* Header bar indicating active composer mode */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {activeTab === 'video' ? (
            <Video className="w-4 h-4 text-blue-600" />
          ) : activeTab === 'text' ? (
            <FileText className="w-4 h-4 text-blue-600" />
          ) : (
            <ImageIcon className="w-4 h-4 text-blue-600" />
          )}
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {activeTab === 'video'
              ? 'Video Post Composer'
              : activeTab === 'text'
                ? 'Text Post Composer'
                : 'Image Post Composer'}
          </span>
        </div>

        <span className="text-xs text-slate-500">
          {activeTab === 'video'
            ? 'Reels, Shorts & Feed Clips'
            : activeTab === 'text'
              ? 'Updates, X, Slack, Whop & Newsletters'
              : 'Photos, Flyers & Banners'}
        </span>
      </div>

      {/* Main Composer Form */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
        {/* 1. Media Upload Area (Hidden in Text Post mode) */}
        {activeTab !== 'text' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {activeTab === 'video' ? 'Video File' : `Images (${(mediaUrls && mediaUrls.length) || 0})`}
              </label>
              <span className="text-[11px] text-slate-400">
                {activeTab === 'video' ? 'MP4, MOV, WebM' : 'Multiple PNG, JPG, WebP supported'}
              </span>
            </div>

          {activeTab === 'image' ? (
            imageUploadState.isUploading ? (
              /* CLEAN NORMAL USER-FRIENDLY IMAGE UPLOAD SYSTEM */
              <div className="border border-blue-200 bg-blue-50/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Local Thumbnail Preview */}
                  <div className="relative w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                    {imageUploadState.previewBlobUrl ? (
                      <img 
                        src={imageUploadState.previewBlobUrl} 
                        alt="Uploading preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-blue-400" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-white animate-spin drop-shadow-md" />
                    </div>
                  </div>

                  {/* Progress Tracking Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {imageUploadState.fileName || 'Uploading Photos'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {imageUploadState.phase === 'compressing' ? (
                            <span className="text-amber-600 font-semibold flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                              <span>Compressing & optimizing photo...</span>
                            </span>
                          ) : imageUploadState.phase === 'processing' ? (
                            <span className="text-blue-600 font-semibold flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
                              <span>Processing & saving to ImgBB cloud...</span>
                            </span>
                          ) : (
                            <span>
                              Uploading: <strong className="text-slate-700 font-semibold">{imageUploadState.loadedMB}</strong> of {imageUploadState.totalMB}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs">
                          {imageUploadState.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Clean Progress Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden p-0.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(imageUploadState.progress, 5)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {imageUploadState.phase === 'compressing'
                        ? 'High-res photo is automatically optimized for fast upload...'
                        : imageUploadState.phase === 'processing' 
                        ? 'Finishing up cloud processing...' 
                        : 'Please keep this window open while uploading'}
                    </p>
                  </div>
                </div>
              </div>
            ) : mediaUrls && mediaUrls.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/80">
                      {mediaUrls.length} {mediaUrls.length === 1 ? 'Photo' : 'Photos'} selected
                    </span>
                    <span className="text-[11px] text-slate-400">First photo is cover</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAllMedia}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
                  >
                    Clear All
                  </button>
                </div>

                {/* Multi-Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {mediaUrls.map((url, idx) => (
                    <div 
                      key={url + idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs"
                    >
                      <img 
                        src={url} 
                        alt={`Upload ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-blue-600/90 text-[10px] font-bold text-white shadow-xs">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add More Tile */}
                  <label 
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors aspect-square p-2 text-center group shadow-2xs ${
                      isDragging 
                        ? 'border-blue-600 bg-blue-100/50 ring-2 ring-blue-500 scale-[1.02]' 
                        : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 flex items-center justify-center mb-1 transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">
                      {isDragging ? 'Drop Here' : 'Add More'}
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <label 
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-600 bg-blue-50/80 ring-4 ring-blue-500/10 scale-[0.99] shadow-inner' 
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 shadow-xs transition-all ${
                  isDragging 
                    ? 'bg-blue-600 text-white scale-110' 
                    : 'bg-white border border-slate-200 text-blue-600'
                }`}>
                  <Upload className="w-5 h-5" />
                </div>
                <p className={`text-xs font-semibold transition-colors ${isDragging ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
                  {isDragging ? 'Drop photos here to upload' : isUploading ? 'Uploading photos...' : 'Click to browse or drag & drop multiple photos'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports multiple image upload: PNG, JPG, WebP
                </p>
              </label>
            )
          ) : (
            /* Video Tab (Single Video) */
            videoUploadState.isUploading ? (
              /* CLEAN NORMAL USER-FRIENDLY VIDEO UPLOAD SYSTEM */
              <div className="border border-blue-200 bg-blue-50/30 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Local Thumbnail Preview */}
                  <div className="relative w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                    {videoUploadState.previewBlobUrl ? (
                      <video 
                        src={videoUploadState.previewBlobUrl} 
                        className="w-full h-full object-cover opacity-75"
                        muted
                        playsInline
                      />
                    ) : (
                      <Film className="w-8 h-8 text-blue-400" />
                    )}
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-white animate-spin drop-shadow-md" />
                    </div>
                  </div>

                  {/* Progress Tracking Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {videoUploadState.fileName || 'Uploading Video'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {videoUploadState.phase === 'processing' ? (
                            <span className="text-blue-600 font-semibold flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
                              <span>Processing video, almost ready...</span>
                            </span>
                          ) : (
                            <span>
                              Uploading: <strong className="text-slate-700 font-semibold">{videoUploadState.loadedMB}</strong> of {videoUploadState.totalMB}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs">
                          {videoUploadState.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Clean Progress Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden p-0.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(videoUploadState.progress, 5)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {videoUploadState.phase === 'processing' 
                        ? 'Finishing up processing...' 
                        : 'Please keep this window open while uploading'}
                    </p>
                  </div>
                </div>
              </div>
            ) : mediaUrl ? (
              /* COMPLETED READY VIDEO CARD */
              <div className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                <div className="flex items-center space-x-3.5 overflow-hidden">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-200 flex items-center justify-center shadow-xs">
                    <video src={mediaUrl} className="w-full h-full object-cover" controls />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {mediaFile?.name || 'Selected Video'}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {mediaFile?.size ? `${mediaFile.size} • ` : ''}Video is ready to post
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
                  <label className="text-xs text-slate-700 hover:text-blue-600 font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-200 bg-white shadow-2xs">
                    Change Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={removeAllMedia}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors border border-rose-200 bg-white shadow-2xs cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              /* IDLE DROP ZONE */
              <label 
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-600 bg-blue-50/80 ring-4 ring-blue-500/10 scale-[0.99] shadow-inner' 
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                } group`}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 shadow-xs transition-all ${
                  isDragging 
                    ? 'bg-blue-600 text-white scale-110' 
                    : 'bg-white border border-slate-200 group-hover:border-blue-300 text-blue-600 group-hover:scale-105'
                }`}>
                  <Video className="w-6 h-6" />
                </div>
                <p className={`text-xs font-bold transition-colors ${isDragging ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'}`}>
                  {isDragging ? 'Drop video here to upload' : 'Click to browse or drag & drop video clip'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports MP4, MOV, WebM up to 200 MB (100% Free Hosting)
                </p>
              </label>
            )
          )}
        </div>
        )}

        {/* 2. Caption / Text Content Area */}
        <div>
          {activeTab === 'text' && (
            <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-center justify-between gap-2 text-xs text-blue-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>Text-Only Mode:</strong> Enabled for X / Twitter, Slack, Whop, Listmonk, Facebook, LinkedIn &amp; text-supported channels.
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {activeTab === 'text' ? 'Post Text Content' : 'Post Caption'}
            </label>
            <div className="flex items-center space-x-2">
              {selectedPlatforms.includes('x') && caption.length > 280 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  X standard limit: 280 chars
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-mono">
                {caption.length} / 2,200
              </span>
            </div>
          </div>
          <textarea
            ref={captionTextareaRef}
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              adjustCaptionHeight();
            }}
            placeholder={
              activeTab === 'text'
                ? 'Write your text update, tweet, Slack announcement, or newsletter copy...'
                : 'Write caption...'
            }
            className={`w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors leading-relaxed resize-none max-h-[350px] ${
              activeTab === 'text' ? 'min-h-[200px]' : 'min-h-[160px]'
            }`}
          />

          {/* Quick Hashtags Chips */}
          <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 mr-1">
              <Hash className="w-3 h-3" />
              <span>Suggested:</span>
            </span>
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-[11px] font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded-md transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 3. SOCIAL ACCOUNTS SELECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                SOCIAL ACCOUNTS
              </span>
              {selectedPlatforms.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
                  {selectedPlatforms.length} Selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                type="button"
                onClick={selectAllPlatforms}
                className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={clearPlatforms}
                className="text-slate-500 hover:text-slate-700 text-[11px] hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {SOCIAL_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = selectedPlatforms.includes(acc.id);
              const status = getPlatformStatus(acc.id);
              const isUnavailable = acc.unavailable || status.isOff;

              if (isUnavailable) {
                return (
                  <div
                    key={acc.id}
                    className="h-11 rounded-full border border-slate-200 bg-slate-100/70 px-4 flex items-center justify-between text-xs text-slate-400 opacity-60 cursor-not-allowed select-none transition-all"
                    title={status.reason || `${acc.name} is unavailable`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-400">{acc.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-500 font-semibold">
                      {status.badge || 'Unavailable'}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => togglePlatform(acc.id)}
                  className={`h-11 rounded-full border px-4 flex items-center justify-between transition-all text-xs ${
                    isSelected
                      ? 'border-2 border-blue-600 bg-blue-50/80 text-blue-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : acc.color}`} />
                    <span>{acc.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Scheduling & Date/Time Selector */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Publishing Mode</span>
            <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsScheduled(false)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  !isScheduled ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Publish Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsScheduled(true);
                  if (!scheduleDate) setQuickDate(1); // Default to tomorrow
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isScheduled ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Schedule Post
              </button>
            </div>
          </div>

          {/* MINIMALIST & ELEGANT SCHEDULE DATE & TIME PICKER */}
          {isScheduled && (
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Set Date & Time</h4>
                    <p className="text-[11px] text-slate-500">Auto-publish across selected channels</p>
                  </div>
                </div>

                {scheduleDate && scheduleTime && (
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleDate('');
                      setScheduleTime('19:30');
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Clean Two-Column Modal Trigger Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Picker Button */}
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-400 transition-all text-left group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Date</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                        {formatDisplayDate(scheduleDate)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-white border border-blue-200/80 px-2.5 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs flex-shrink-0 ml-2">
                    {scheduleDate ? 'Change' : 'Pick Date'}
                  </span>
                </button>

                {/* Time Picker Button */}
                <button
                  type="button"
                  onClick={() => setIsTimePickerOpen(true)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-400 transition-all text-left group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100/70 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Time</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono group-hover:text-indigo-600 transition-colors truncate block">
                        {formatDisplayTime(scheduleTime)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-white border border-indigo-200/80 px-2.5 py-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs flex-shrink-0 ml-2">
                    {scheduleTime ? 'Change' : 'Pick Time'}
                  </span>
                </button>
              </div>

              {/* Sleek One-Click Presets */}
              <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Suggested:</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuickDate(1);
                    setQuickTime('10:00');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                >
                  Tomorrow 10:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickDate(1);
                    setQuickTime('19:30');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                >
                  Tomorrow 7:30 PM (Peak)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickDate(2);
                    setQuickTime('18:00');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                >
                  In 2 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickDate(5);
                    setQuickTime('20:00');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                >
                  Weekend
                </button>
              </div>

              {/* Schedule Confirmation Pill */}
              {scheduleDate && scheduleTime && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900 font-medium flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>
                    Will be posted on <strong>{formatDisplayDate(scheduleDate)}</strong> at <strong>{formatDisplayTime(scheduleTime)}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? 'Processing...' 
                : isScheduled 
                  ? (selectedPlatforms.length > 0 ? `Schedule Post for ${selectedPlatforms.length} Channel${selectedPlatforms.length > 1 ? 's' : ''}` : 'Schedule Post')
                  : (selectedPlatforms.length > 0 ? `Publish Now to ${selectedPlatforms.length} Channel${selectedPlatforms.length > 1 ? 's' : ''}` : 'Publish Now')
              }
            </span>
          </button>
        </div>
      </form>

      {/* Calendar Picker Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={scheduleDate}
        onSelectDate={(newDate) => setScheduleDate(newDate)}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        selectedTime={scheduleTime}
        onSelectTime={(newTime) => setScheduleTime(newTime)}
      />

      {/* Modern Feedback Modal */}
      <FeedbackModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        secondaryAction={modalConfig.secondaryAction}
      />
    </div>
  );
}

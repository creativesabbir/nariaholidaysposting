'use client';

import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Heart, 
  Bookmark, 
  Send as SendIcon, 
  MoreHorizontal,
  Sparkles,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, FacebookGlobeIcon } from './SocialIcons';
import VerifiedBadge from './VerifiedBadge';

export default function LivePreview({ 
  caption = '', 
  mediaUrl = '', 
  mediaUrls = [],
  type = 'image', 
  currentUser,
  isLoadingUser = false 
}) {
  const [platform, setPlatform] = useState('fb'); // 'fb' or 'ig'
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [brandIcon, setBrandIcon] = useState('/logo-icon.png');

  useEffect(() => {
    try {
      const cached = localStorage.getItem('nh_brand_icon');
      if (cached) setBrandIcon(cached);
    } catch (e) {}

    const loadIcon = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data?.settings?.branding?.iconUrl) {
          setBrandIcon(data.settings.branding.iconUrl);
          try {
            localStorage.setItem('nh_brand_icon', data.settings.branding.iconUrl);
          } catch (e) {}
        }
      } catch (e) {}
    };

    loadIcon();
    const handleUpdate = () => loadIcon();
    window.addEventListener('nh_brand_updated', handleUpdate);
    return () => window.removeEventListener('nh_brand_updated', handleUpdate);
  }, []);

  useEffect(() => {
    setIsExpanded(false);
  }, [caption]);

  useEffect(() => {
    setActiveSlide(0);
  }, [mediaUrls, mediaUrl]);

  const imageList = (mediaUrls && mediaUrls.length > 0) ? mediaUrls : (mediaUrl ? [mediaUrl] : []);

  const renderFBCaption = () => {
    if (!caption?.trim()) return null;

    const trimmed = caption.trim();
    const lines = trimmed.split('\n');
    const hasMoreThan3Lines = lines.length > 3;
    const isLongContinuous = lines.length <= 3 && trimmed.length > 140;
    const shouldTruncate = (hasMoreThan3Lines || isLongContinuous) && !isExpanded;

    if (!shouldTruncate) {
      return (
        <div className="px-3.5 pb-3 text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
          {trimmed}
          {(hasMoreThan3Lines || isLongContinuous) && isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="ml-1.5 font-bold text-slate-900 hover:underline cursor-pointer"
            >
              See less
            </button>
          )}
        </div>
      );
    }

    if (hasMoreThan3Lines) {
      const line1 = lines[0];
      const line2 = lines[1];
      const line3 = lines[2].length > 40 ? lines[2].slice(0, 40).trim() : lines[2];

      return (
        <div className="px-3.5 pb-3 text-xs sm:text-sm text-slate-900 leading-relaxed">
          <div>{line1}</div>
          <div>{line2}</div>
          <div>
            <span>{line3}.... </span>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="font-bold text-slate-900 hover:underline cursor-pointer inline"
            >
              See more
            </button>
          </div>
        </div>
      );
    }

    // Long continuous text truncated to ~3 lines
    const truncated = trimmed.slice(0, 130).trim();
    return (
      <div className="px-3.5 pb-3 text-xs sm:text-sm text-slate-900 leading-relaxed">
        <span>{truncated}.... </span>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="font-bold text-slate-900 hover:underline cursor-pointer inline"
        >
          See more
        </button>
      </div>
    );
  };

  const renderIGCaption = () => {
    if (!caption?.trim()) return null;

    const trimmed = caption.trim();
    const lines = trimmed.split('\n');
    const hasMoreThan3Lines = lines.length > 3;
    const isLongContinuous = lines.length <= 3 && trimmed.length > 140;
    const shouldTruncate = (hasMoreThan3Lines || isLongContinuous) && !isExpanded;

    if (!shouldTruncate) {
      return (
        <span className="whitespace-pre-wrap">
          {trimmed}
          {(hasMoreThan3Lines || isLongContinuous) && isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="ml-1.5 font-bold text-slate-900 hover:underline cursor-pointer"
            >
              See less
            </button>
          )}
        </span>
      );
    }

    if (hasMoreThan3Lines) {
      const line1 = lines[0];
      const line2 = lines[1];
      const line3 = lines[2].length > 40 ? lines[2].slice(0, 40).trim() : lines[2];

      return (
        <span>
          <span className="block">{line1}</span>
          <span className="block">{line2}</span>
          <span className="block">
            <span>{line3}.... </span>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="font-bold text-slate-900 hover:underline cursor-pointer inline"
            >
              See more
            </button>
          </span>
        </span>
      );
    }

    const truncated = trimmed.slice(0, 130).trim();
    return (
      <span>
        <span>{truncated}.... </span>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="font-bold text-slate-900 hover:underline cursor-pointer inline"
        >
          See more
        </button>
      </span>
    );
  };

  const renderMediaPlaceholder = (isSquare = false) => (
    <div className={`w-full ${isSquare ? 'py-16' : 'py-14'} px-4 bg-slate-50/70 border-y border-dashed border-slate-200 flex flex-col items-center justify-center text-center select-none`}>
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-2.5 shadow-2xs">
        {type === 'video' ? (
          <Video className="w-6 h-6 text-slate-400" />
        ) : (
          <ImageIcon className="w-6 h-6 text-slate-400" />
        )}
      </div>
      <p className="text-xs font-semibold text-slate-700">
        Select {type === 'video' ? 'video' : 'images'} for preview
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">
        Upload {type === 'video' ? 'a video file' : 'one or multiple photos'} to see the live feed mockup
      </p>
    </div>
  );

  const renderFBMedia = () => {
    if (type === 'video') {
      if (!mediaUrl) return renderMediaPlaceholder();
      return (
        <div className="w-full bg-slate-100 flex items-center justify-center border-y border-slate-100">
          <video src={mediaUrl} className="w-full h-auto block" controls playsInline />
        </div>
      );
    }

    if (imageList.length === 0) {
      return renderMediaPlaceholder();
    }

    if (imageList.length === 1) {
      return (
        <div className="w-full bg-slate-100 flex items-center justify-center border-y border-slate-100">
          <img src={imageList[0]} alt="Post media" className="w-full h-auto block object-contain" />
        </div>
      );
    }

    if (imageList.length === 2) {
      return (
        <div className="w-full grid grid-cols-2 gap-0.5 bg-slate-200 border-y border-slate-100">
          <div className="aspect-square overflow-hidden bg-slate-100">
            <img src={imageList[0]} alt="Media 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden bg-slate-100">
            <img src={imageList[1]} alt="Media 2" className="w-full h-full object-cover" />
          </div>
        </div>
      );
    }

    if (imageList.length === 3) {
      return (
        <div className="w-full bg-slate-200 border-y border-slate-100 space-y-0.5">
          <div className="w-full h-52 overflow-hidden bg-slate-100">
            <img src={imageList[0]} alt="Media 1" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-0.5">
            <div className="aspect-square overflow-hidden bg-slate-100">
              <img src={imageList[1]} alt="Media 2" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square overflow-hidden bg-slate-100">
              <img src={imageList[2]} alt="Media 3" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    if (imageList.length === 4) {
      return (
        <div className="w-full grid grid-cols-2 gap-0.5 bg-slate-200 border-y border-slate-100">
          {imageList.slice(0, 4).map((url, idx) => (
            <div key={idx} className="aspect-square overflow-hidden bg-slate-100">
              <img src={url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      );
    }

    // 5 or more images (Matches user's exact Facebook 2-top, 3-bottom collage layout)
    return (
      <div className="w-full space-y-0.5 bg-slate-200 border-y border-slate-100">
        {/* Top row: 2 images */}
        <div className="grid grid-cols-2 gap-0.5">
          <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-slate-100">
            <img src={imageList[0]} alt="Media 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-slate-100">
            <img src={imageList[1]} alt="Media 2" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Bottom row: 3 images */}
        <div className="grid grid-cols-3 gap-0.5">
          <div className="aspect-square overflow-hidden bg-slate-100">
            <img src={imageList[2]} alt="Media 3" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden bg-slate-100">
            <img src={imageList[3]} alt="Media 4" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden bg-slate-100 relative">
            <img src={imageList[4]} alt="Media 5" className="w-full h-full object-cover" />
            {imageList.length > 5 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold tracking-tight select-none">
                +{imageList.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderIGMedia = () => {
    if (type === 'video') {
      if (!mediaUrl) return renderMediaPlaceholder(true);
      return (
        <div className="w-full bg-slate-100 flex items-center justify-center">
          <video src={mediaUrl} className="w-full h-auto block" controls playsInline />
        </div>
      );
    }

    if (imageList.length === 0) {
      return renderMediaPlaceholder(true);
    }

    if (imageList.length === 1) {
      return (
        <div className="w-full bg-slate-100 flex items-center justify-center">
          <img src={imageList[0]} alt="Post media" className="w-full h-auto block object-contain" />
        </div>
      );
    }

    // Carousel for multiple Instagram photos
    return (
      <div className="w-full aspect-square bg-slate-100 relative overflow-hidden group select-none">
        <img 
          src={imageList[activeSlide]} 
          alt={`Slide ${activeSlide + 1}`} 
          className="w-full h-full object-cover" 
        />

        {/* Counter Pill */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold">
          {activeSlide + 1}/{imageList.length}
        </div>

        {/* Previous Button */}
        {activeSlide > 0 && (
          <button
            type="button"
            onClick={() => setActiveSlide(prev => prev - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Next Button */}
        {activeSlide < imageList.length - 1 && (
          <button
            type="button"
            onClick={() => setActiveSlide(prev => prev + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Dot Indicators */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1">
          {imageList.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeSlide === idx ? 'bg-blue-600 scale-125' : 'bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header with Platform Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Live Feed Preview
          </span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setPlatform('fb')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              platform === 'fb' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Facebook</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('ig')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              platform === 'ig' ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
            <span>Instagram</span>
          </button>
        </div>
      </div>

      {/* Preview Card Body */}
      <div className="p-4 sm:p-5 flex-1">
        {platform === 'fb' ? (
          /* FACEBOOK PREVIEW */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
            {/* FB Header */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
                    <img 
                      src={brandIcon || '/logo-icon.png'} 
                      alt="Naria Holidays" 
                      className="w-full h-full object-contain" 
                      onError={() => setBrandIcon('/logo-icon.png')}
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-900">Naria Holidays</span>
                    <VerifiedBadge className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                    {isLoadingUser ? (
                      <span className="inline-block h-2.5 w-24 bg-slate-200 animate-pulse rounded" />
                    ) : (
                      <span>
                        Published by <strong className="font-bold text-slate-800">{currentUser?.name || 'Naria Holidays'}</strong>
                      </span>
                    )}
                    <span>•</span>
                    <span>Just now</span>
                    <span>•</span>
                    <FacebookGlobeIcon className="w-3.5 h-3.5 text-[#65676B]" />
                  </div>
                </div>
              </div>

              <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* FB Caption - Truncated to 3 lines with ".... See more" in bold */}
            {renderFBCaption()}

            {/* FB Media Display - AUTO HEIGHT, MULTI-PHOTO SUPPORT + PLACEHOLDER */}
            {renderFBMedia()}

            {/* FB Action Bar 1: Insights & Boost Post (matching official post) */}
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-slate-100 bg-white">
              <span className="text-[12px] text-[#1877F2] hover:underline font-medium cursor-pointer">
                See insights and ads
              </span>
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs transition-colors shadow-2xs"
              >
                Boost post
              </button>
            </div>

            {/* FB Action Bar 2: Exact Facebook Reactions & Engagement Row */}
            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[#65676B] bg-white">
              <div className="flex items-center space-x-4 text-[13px]">
                <div className="flex items-center space-x-1.5 hover:text-slate-900 cursor-pointer">
                  <ThumbsUp className="w-4 h-4 stroke-[1.75] text-[#1877F2]" />
                  <span className="font-bold text-xs text-slate-700">2k</span>
                </div>
                <div className="flex items-center space-x-1.5 hover:text-slate-900 cursor-pointer">
                  <MessageSquare className="w-4 h-4 stroke-[1.75]" />
                  <span className="font-medium text-xs">1.5k</span>
                </div>
                <div className="flex items-center space-x-1.5 hover:text-slate-900 cursor-pointer">
                  <Share2 className="w-4 h-4 stroke-[1.75]" />
                  <span className="font-medium text-xs">500</span>
                </div>
              </div>

              {/* Overlapping Like & Love Reaction Icons on the right */}
              <div className="flex items-center -space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] shadow-xs ring-1 ring-white">
                  <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-white">
                    <path d="M4 14.5V7.5H1.5V14.5H4ZM14 8C14 7.2 13.3 6.5 12.5 6.5H9.5L10 4C10.2 3.2 9.8 2.3 9 2L5 7V14.5H12C12.6 14.5 13.1 14.1 13.3 13.6L14.7 10.1C14.9 9.8 15 9.4 15 9V8H14Z"/>
                  </svg>
                </span>
                <span className="w-4 h-4 rounded-full bg-[#FA383E] text-white flex items-center justify-center text-[9px] shadow-xs ring-1 ring-white">
                  <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-white">
                    <path d="M8 14S1.5 9.8 1.5 5.5A3.5 3.5 0 0 1 8 3.3 3.5 3.5 0 0 1 14.5 5.5C14.5 9.8 8 14 8 14Z"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* INSTAGRAM PREVIEW */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800 max-w-sm mx-auto">
            {/* IG Header */}
            <div className="p-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center">
                    <img 
                      src={brandIcon || '/logo-icon.png'} 
                      alt="Naria Holidays" 
                      className="w-full h-full object-contain" 
                      onError={() => setBrandIcon('/logo-icon.png')}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-900">nariaholidays</span>
                    <VerifiedBadge className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-500">Dhaka, Bangladesh</span>
                </div>
              </div>
              <button type="button" className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* IG Media Display - AUTO HEIGHT, MULTI-PHOTO CAROUSEL + PLACEHOLDER */}
            {renderIGMedia()}

            {/* IG Actions Bar */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Heart className="w-5 h-5 text-slate-700 hover:text-rose-600 cursor-pointer transition-colors" />
                  <MessageSquare className="w-5 h-5 text-slate-700 hover:text-slate-900 cursor-pointer" />
                  <SendIcon className="w-5 h-5 text-slate-700 hover:text-slate-900 cursor-pointer" />
                </div>
                <Bookmark className="w-5 h-5 text-slate-700 hover:text-slate-900 cursor-pointer" />
              </div>

              <div className="text-xs font-bold text-slate-900">
                2,000 likes
              </div>

              {caption?.trim() ? (
                <div className="text-xs text-slate-900 leading-snug">
                  <span className="font-bold mr-1.5">nariaholidays</span>
                  {renderIGCaption()}
                </div>
              ) : null}

              <div className="text-[11px] text-slate-400 uppercase tracking-wider pt-1">
                Just now
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

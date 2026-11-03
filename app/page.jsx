'use client';

import React, { useState } from 'react';
import PostComposer from '@/components/PostComposer';
import LivePreview from '@/components/LivePreview';
import { Video, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState('image'); // 'video' or 'image'
  const { currentUser, isLoadingUser } = useAuth();

  // Clean empty state by default - no pre-selected media or caption
  const [caption, setCaption] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState(null);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Two Main Tabs (Video & Image) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Social Media Posting Automation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish or schedule promotional content across Naria Holidays social channels simultaneously.
          </p>
        </div>

        {/* TWO MAIN TABS (Image on Left, Video on Right) */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl max-w-xs self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('image');
              if (mediaFile?.type === 'video') {
                setMediaUrl('');
                setMediaUrls([]);
                setMediaFile(null);
              }
            }}
            className={`flex items-center space-x-2 py-2 px-5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'image'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('video');
              if (mediaFile?.type === 'image' || mediaUrls.length > 0) {
                setMediaUrl('');
                setMediaUrls([]);
                setMediaFile(null);
              }
            }}
            className={`flex items-center space-x-2 py-2 px-5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Left Composer, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Post Composer */}
        <div className="lg:col-span-7">
          <PostComposer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            caption={caption}
            setCaption={setCaption}
            mediaUrl={mediaUrl}
            setMediaUrl={setMediaUrl}
            mediaUrls={mediaUrls}
            setMediaUrls={setMediaUrls}
            mediaFile={mediaFile}
            setMediaFile={setMediaFile}
          />
        </div>

        {/* Right Column: Live Social Media Preview (Auto-Height, No Cropping, Multi-Photo Support) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <LivePreview
            caption={caption}
            mediaUrl={mediaUrl}
            mediaUrls={mediaUrls}
            type={activeTab}
            currentUser={currentUser}
            isLoadingUser={isLoadingUser}
          />
        </div>
      </div>
    </div>
  );
}

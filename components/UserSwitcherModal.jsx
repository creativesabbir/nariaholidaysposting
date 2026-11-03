'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, User, LogOut, Edit3, Camera, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { logoutUser, uploadMediaFile, updateCurrentUser } from '@/lib/api';

export default function UserSwitcherModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    role: currentUser?.role || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        role: currentUser.role || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || ''
      });
    }
  }, [currentUser, isOpen]);

  // Direct file upload to ImgBB -> sets URL & saves to Supabase
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setErrorMsg('');
      setUploadSuccessMsg('');

      // 1. Upload to ImgBB
      const res = await uploadMediaFile(file);

      if (res?.url) {
        const newAvatarUrl = res.url;
        setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));

        // 2. Persist to Supabase Database & Session immediately
        const updateRes = await updateCurrentUser({
          name: formData.name || currentUser?.name,
          role: formData.role || currentUser?.role,
          email: currentUser?.email,
          avatar: newAvatarUrl
        });

        if (updateRes?.success && updateRes?.user) {
          if (onUpdateUser) onUpdateUser(updateRes.user);
        }

        setUploadSuccessMsg('Avatar updated successfully!');
        setTimeout(() => setUploadSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res?.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setErrorMsg('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveTextData = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCurrentUser({
        name: formData.name,
        role: formData.role,
        email: currentUser?.email,
        avatar: formData.avatar || currentUser?.avatar
      });
      if (res?.success && res?.user) {
        if (onUpdateUser) onUpdateUser(res.user);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">User Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[3]" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Profile Card (Clean Display) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <img
                  src={formData.avatar || currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                  alt={currentUser?.name || "Avatar"}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
                  {currentUser?.isAdmin && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
                <p className="text-[10px] text-blue-700 font-semibold mt-0.5">{currentUser?.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-1.5 border border-blue-200 bg-white cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {/* Edit Form & Photo Upload Box - ONLY VISIBLE WHEN isEditing IS TRUE */}
          {isEditing && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              {/* Dedicated Image Upload Box inside Edit Form */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Change Profile Photo</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select a photo from your computer to update your avatar.
                </p>

                <label className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-600 cursor-pointer transition-colors shadow-2xs">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                  {isUploadingPhoto ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Uploading photo...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Choose Photo from Device</span>
                    </>
                  )}
                </label>
              </div>

              {/* Edit Text Info Form (Name, Designation) */}
              <form onSubmit={handleSaveTextData} className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200/90 font-semibold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Logout</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

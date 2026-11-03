'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Check, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadMediaFile } from '@/lib/api';

export default function ImageUploadModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Upload Image",
  description = "Select a photo directly from your device"
}) {
  if (!isOpen) return null;

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    setError('');
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError('');
      const res = await uploadMediaFile(selectedFile);

      if (res?.url) {
        if (onSuccess) {
          onSuccess(res.url);
        }
        handleClose();
      } else {
        setError(res?.error || 'Failed to upload photo. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Image upload failed. Please check network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {previewUrl ? (
            /* Selected File Preview before confirming */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-white">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[260px]">
                    {selectedFile?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Choose Different
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading photo...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Apply Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* File Upload Zone - strictly file-based, ZERO URL options */
            <div>
              <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/20 group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-300 flex items-center justify-center text-blue-600 mb-3 shadow-xs group-hover:scale-105 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Click to select photo from device
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPG, JPEG, WebP
                </p>
                <span className="mt-3.5 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs group-hover:bg-blue-700 transition-colors">
                  Browse Files
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

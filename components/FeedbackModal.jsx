'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Trash2, 
  X, 
  CalendarCheck
} from 'lucide-react';

export default function FeedbackModal({
  isOpen,
  onClose,
  type = 'success', // 'success', 'warning', 'error', 'confirm_delete'
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  secondaryAction
}) {
  if (!isOpen) return null;

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else if (onConfirm) {
      onConfirm();
    }
  };

  const handleConfirmAction = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="p-6 text-center relative">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="mx-auto mb-4 flex items-center justify-center">
            {type === 'success' && (
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}

            {type === 'scheduled' && (
              <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <CalendarCheck className="w-8 h-8" />
              </div>
            )}

            {type === 'warning' && (
              <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
                <AlertTriangle className="w-8 h-8" />
              </div>
            )}

            {type === 'error' && (
              <div className="w-16 h-16 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}

            {type === 'confirm_delete' && (
              <div className="w-16 h-16 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
                <Trash2 className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h3>

          {/* Message */}
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-5 pt-0 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {type === 'confirm_delete' ? (
            <>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-sm shadow-rose-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </button>
            </>
          ) : type === 'success' || type === 'scheduled' ? (
            <>
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  onClick={handleDismiss}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors text-center cursor-pointer"
                >
                  {secondaryAction.label}
                </Link>
              )}
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                {confirmText || 'Done'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              {confirmText || 'Understood'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

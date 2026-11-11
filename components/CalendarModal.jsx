'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toDateStr(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getOffsetDateStr(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return toDateStr(d);
}

export default function CalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [tempSelected, setTempSelected] = useState(selectedDate || toDateStr(today));

  useEffect(() => {
    if (!isOpen) return;

    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        setViewYear(Number(parts[0]));
        setViewMonth(Number(parts[1]) - 1);
        setTempSelected(selectedDate);
        return;
      }
    }

    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setTempSelected(toDateStr(now));
  }, [selectedDate, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isViewingCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;

  const prevMonth = () => {
    if (isViewingCurrentMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const selectPreset = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setTempSelected(toDateStr(d));
  };

  const handleConfirm = () => {
    if (tempSelected) {
      onSelectDate(tempSelected);
    }
    onClose();
  };

  const formatDisplay = (dStr) => {
    if (!dStr) return 'Select a date';
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

  const presets = [
    { label: 'Today', date: getOffsetDateStr(0), days: 0 },
    { label: 'Tomorrow', date: getOffsetDateStr(1), days: 1 },
    { label: 'Next Week', date: getOffsetDateStr(7), days: 7 }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-[340px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Select schedule date"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Select Date</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5">
          {/* Quick Segmented Presets */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            {presets.map((p) => {
              const active = tempSelected === p.date;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => selectPreset(p.days)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isViewingCurrentMonth}
              className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                isViewingCurrentMonth
                  ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
              }`}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-semibold text-slate-900">
              {MONTHS[viewMonth]} {viewYear}
            </h4>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center">
            {DAYS.map((d) => (
              <span key={d} className="text-[11px] font-semibold text-slate-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const cellDate = new Date(viewYear, viewMonth, day);
              cellDate.setHours(0, 0, 0, 0);

              const isPast = cellDate < today;
              const isToday = cellDate.getTime() === today.getTime();
              const cellDateStr = toDateStr(cellDate);
              const isSelected = tempSelected === cellDateStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => setTempSelected(cellDateStr)}
                  className={`relative h-9 w-9 mx-auto rounded-full text-xs tabular-nums flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30 cursor-pointer'
                      : isToday
                      ? 'bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 cursor-pointer'
                      : isPast
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100 font-medium cursor-pointer'
                  }`}
                >
                  {day}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean Footer */}
        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 truncate">
            {formatDisplay(tempSelected)}
          </span>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

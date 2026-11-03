'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onSelectDate 
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [tempSelected, setTempSelected] = useState(selectedDate || '');

  // Sync state whenever modal is opened
  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        setViewYear(Number(parts[0]));
        setViewMonth(Number(parts[1]) - 1);
        setTempSelected(selectedDate);
        return;
      }
    }
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    if (!selectedDate) {
      const mm = String(t.getMonth() + 1).padStart(2, '0');
      const dd = String(t.getDate()).padStart(2, '0');
      setTempSelected(`${t.getFullYear()}-${mm}-${dd}`);
    }
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Days in current view month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handleDayClick = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    setTempSelected(dateStr);
  };

  const handleConfirm = () => {
    if (tempSelected) {
      onSelectDate(tempSelected);
    }
    onClose();
  };

  const selectPreset = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setTempSelected(dateStr);
  };

  const formatDisplay = (dStr) => {
    if (!dStr) return 'No date chosen';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Select Date</h3>
              <p className="text-[11px] text-slate-500">Pick publication date</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-5 space-y-4">
          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              {MONTHS[viewMonth]} {viewYear}
            </h4>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => selectPreset(0)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => selectPreset(1)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors whitespace-nowrap"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => selectPreset(2)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors whitespace-nowrap"
            >
              In 2 Days
            </button>
            <button
              type="button"
              onClick={() => selectPreset(7)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors whitespace-nowrap"
            >
              Next Week
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center">
            {DAYS.map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Prev month trailing days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => {
              const dayNum = prevMonthDays - firstDayIndex + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="h-9 flex items-center justify-center text-xs text-slate-300 select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const cellDate = new Date(viewYear, viewMonth, day);
              cellDate.setHours(0, 0, 0, 0);

              const isPast = cellDate < today;
              const isToday = cellDate.getTime() === today.getTime();

              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const cellDateStr = `${viewYear}-${mm}-${dd}`;
              const isSelected = tempSelected === cellDateStr;

              return (
                <button
                  key={`cur-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDayClick(day)}
                  className={`h-9 w-9 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600/20'
                      : isToday
                      ? 'border border-blue-600 text-blue-600 font-bold hover:bg-blue-50'
                      : isPast
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            {formatDisplay(tempSelected)}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Select Date</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

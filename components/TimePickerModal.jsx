'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, X, Check } from 'lucide-react';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const BASE_MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const QUICK_TIMES = [
  { label: '9:00 AM', time: '09:00' },
  { label: '1:30 PM', time: '13:30' },
  { label: '7:30 PM', time: '19:30' }
];

function parse24HourTime(tStr) {
  const [hStr, mStr] = (tStr || '19:30').split(':');
  const hNum = parseInt(hStr, 10);
  if (isNaN(hNum)) return { hour: 7, minute: '30', period: 'PM' };
  const period = hNum >= 12 ? 'PM' : 'AM';
  const hour = hNum % 12 === 0 ? 12 : hNum % 12;
  const minute = String(parseInt(mStr || '0', 10) || 0).padStart(2, '0');
  return { hour, minute, period };
}

function to24HourTime(hour, minute, period) {
  let h24 = hour;
  if (period === 'PM') {
    h24 = hour === 12 ? 12 : hour + 12;
  } else {
    h24 = hour === 12 ? 0 : hour;
  }
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function TimePickerModal({
  isOpen,
  onClose,
  selectedTime = '19:30',
  onSelectTime
}) {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState('30');
  const [period, setPeriod] = useState('PM');

  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  const minuteOptions = useMemo(() => {
    if (BASE_MINUTES.includes(minute)) return BASE_MINUTES;
    return [...BASE_MINUTES, minute].sort((a, b) => Number(a) - Number(b));
  }, [minute]);

  useEffect(() => {
    if (!isOpen) return;
    const parsed = parse24HourTime(selectedTime);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  }, [selectedTime, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollActive = (container) => {
      const active = container?.querySelector('[data-active="true"]');
      if (active) {
        active.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    const timer = setTimeout(() => {
      scrollActive(hourListRef.current);
      scrollActive(minuteListRef.current);
    }, 30);
    return () => clearTimeout(timer);
  }, [isOpen, hour, minute]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current24 = to24HourTime(hour, minute, period);
  const displayTime = `${String(hour).padStart(2, '0')}:${minute} ${period}`;

  const handlePreset = (presetTime) => {
    const parsed = parse24HourTime(presetTime);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  };

  const handleConfirm = () => {
    onSelectTime(current24);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-[320px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Select schedule time"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Select Time</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold font-mono tabular-nums">
              {displayTime}
            </span>
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5">
          {/* Quick Time Segmented Bar */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            {QUICK_TIMES.map((q) => {
              const active = current24 === q.time;
              return (
                <button
                  key={q.time}
                  type="button"
                  onClick={() => handlePreset(q.time)}
                  className={`py-1.5 rounded-lg text-xs font-medium tabular-nums transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* 3 Clean Scrollable Columns: Hour | Minute | AM/PM */}
          <div className="grid grid-cols-[1fr_1fr_72px] gap-2 bg-slate-50/70 border border-slate-200/80 rounded-xl p-2">
            {/* Hours */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center pb-1.5">
                Hour
              </span>
              <div
                ref={hourListRef}
                className="h-44 overflow-y-auto space-y-1 pr-0.5"
              >
                {HOURS.map((h) => {
                  const isSelected = hour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-active={isSelected}
                      onClick={() => setHour(h)}
                      className={`w-full py-1.5 rounded-lg text-xs font-mono tabular-nums transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col border-l border-slate-200/70 pl-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center pb-1.5">
                Min
              </span>
              <div
                ref={minuteListRef}
                className="h-44 overflow-y-auto space-y-1 pr-0.5"
              >
                {minuteOptions.map((m) => {
                  const isSelected = minute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-active={isSelected}
                      onClick={() => setMinute(m)}
                      className={`w-full py-1.5 rounded-lg text-xs font-mono tabular-nums transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AM / PM */}
            <div className="flex flex-col border-l border-slate-200/70 pl-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center pb-1.5">
                Period
              </span>
              <div className="flex-1 flex flex-col justify-center space-y-1.5">
                {['AM', 'PM'].map((p) => {
                  const isSelected = period === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Clean Footer */}
        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end space-x-2">
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
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, X, Check, Sparkles } from 'lucide-react';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const PRESETS = [
  { label: 'Morning Rush', time: '09:00', display: '09:00 AM' },
  { label: 'Lunch Break', time: '13:30', display: '01:30 PM' },
  { label: 'Peak Reach 🔥', time: '19:30', display: '07:30 PM' },
  { label: 'Night Owl', time: '21:00', display: '09:00 PM' }
];

export default function TimePickerModal({
  isOpen,
  onClose,
  selectedTime = '19:30',
  onSelectTime
}) {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState('30');
  const [period, setPeriod] = useState('PM');

  // Parse incoming 24h time into 12h + AM/PM
  useEffect(() => {
    if (selectedTime) {
      const [hStr, mStr] = selectedTime.split(':');
      const hNum = parseInt(hStr, 10);
      if (!isNaN(hNum)) {
        const isPM = hNum >= 12;
        const displayH = hNum % 12 === 0 ? 12 : hNum % 12;
        setHour(displayH);
        setMinute(mStr || '00');
        setPeriod(isPM ? 'PM' : 'AM');
      }
    }
  }, [selectedTime, isOpen]);

  if (!isOpen) return null;

  const handlePreset = (presetTime) => {
    const [hStr, mStr] = presetTime.split(':');
    const hNum = parseInt(hStr, 10);
    const isPM = hNum >= 12;
    const displayH = hNum % 12 === 0 ? 12 : hNum % 12;
    setHour(displayH);
    setMinute(mStr);
    setPeriod(isPM ? 'PM' : 'AM');
  };

  const handleConfirm = () => {
    let h24 = hour;
    if (period === 'PM') {
      h24 = hour === 12 ? 12 : hour + 12;
    } else {
      h24 = hour === 12 ? 0 : hour;
    }
    const formatted = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onSelectTime(formatted);
    onClose();
  };

  const displayTime = `${String(hour).padStart(2, '0')}:${minute} ${period}`;

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
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Select Time</h3>
              <p className="text-[11px] text-slate-500">Pick publication hour & minute</p>
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

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Big Digital Clock Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center space-x-3">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                {String(hour).padStart(2, '0')}
              </span>
              <span className="text-3xl font-bold text-blue-600 animate-pulse">:</span>
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                {minute}
              </span>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col space-y-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPeriod('AM')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  period === 'AM'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod('PM')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  period === 'PM'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Peak Engagement Presets */}
          <div>
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 mb-2">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Recommended Engagement Times</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.time}
                  type="button"
                  onClick={() => handlePreset(p.time)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-left transition-colors group flex items-center justify-between"
                >
                  <span className="text-[11px] font-medium text-slate-600 group-hover:text-blue-700">
                    {p.label}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 font-mono">
                    {p.display}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hour Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Hour
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {HOURS.map((h) => {
                const isSelected = hour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHour(h)}
                    className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-2 ring-blue-600/20 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minute Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Minute
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {MINUTES.map((m) => {
                const isSelected = minute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinute(m)}
                    className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all font-mono ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-2 ring-blue-600/20 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    :{m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400">Scheduled:</span>
            <span className="font-bold text-slate-800 font-mono">{displayTime}</span>
          </div>

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
              <span>Set Time</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


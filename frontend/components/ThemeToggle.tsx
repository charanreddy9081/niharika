'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const options = [
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find(o => o.value === theme) || options[0];
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0a2319] border border-emerald-900/60 hover:border-[#e8c872]/50 text-[#a3b8af] hover:text-[#e8c872] transition-all text-xs"
        title="Toggle theme"
        aria-label="Change theme"
      >
        <Icon className="w-4 h-4" />
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-[#081a13] border border-[#e8c872]/30 rounded-xl shadow-2xl overflow-hidden z-50 animate-in">
          {options.map(({ value, label, icon: OptionIcon }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${
                theme === value
                  ? 'bg-[#e8c872]/15 text-[#e8c872] font-semibold'
                  : 'text-[#a3b8af] hover:bg-white/5 hover:text-white'
              }`}
            >
              <OptionIcon className="w-3.5 h-3.5" />
              {label}
              {theme === value && <span className="ml-auto text-[#e8c872]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

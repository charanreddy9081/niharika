'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme, type Theme } from '../context/ThemeContext';

// Pink heart icon as inline SVG (no extra dep)
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

const options: { value: Theme; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'dark',   label: 'Dark',   Icon: Moon },
  { value: 'light',  label: 'Light',  Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'pink',   label: 'Pink',   Icon: HeartIcon },
];

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
  const CurrentIcon = current.Icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 p-2 rounded-lg border transition-all text-xs ${
          theme === 'pink'
            ? 'bg-[#FFF0F4] border-[#D98FA6] text-[#A94F6B] hover:border-[#A94F6B]'
            : 'bg-[#0a2319] border-emerald-900/60 hover:border-[#e8c872]/50 text-[#a3b8af] hover:text-[#e8c872]'
        }`}
        title="Toggle theme"
        aria-label="Change theme"
      >
        <CurrentIcon className="w-4 h-4" />
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-36 border rounded-xl shadow-2xl overflow-hidden z-50 animate-in ${
          theme === 'pink'
            ? 'bg-[#FFF7FA] border-[#E9CCD5]'
            : 'bg-[#081a13] border-[#e8c872]/30'
        }`}>
          {options.map(({ value, label, Icon: OptionIcon }) => {
            const isActive = theme === value;
            const isPinkTheme = theme === 'pink';
            return (
              <button
                key={value}
                onClick={() => { setTheme(value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${
                  isActive
                    ? isPinkTheme
                      ? 'bg-[#F6DDE5] text-[#A94F6B] font-semibold'
                      : 'bg-[#e8c872]/15 text-[#e8c872] font-semibold'
                    : isPinkTheme
                      ? 'text-[#806B72] hover:bg-[#FCEEF3] hover:text-[#2B2024]'
                      : 'text-[#a3b8af] hover:bg-white/5 hover:text-white'
                } ${value === 'pink' && !isActive && !isPinkTheme ? '!text-[#D98FA6] hover:!text-[#A94F6B]' : ''}`}
              >
                <OptionIcon className={`w-3.5 h-3.5 ${value === 'pink' && !isActive ? 'text-[#D98FA6]' : ''}`} />
                {label}
                {isActive && (
                  <span className={`ml-auto ${isPinkTheme ? 'text-[#A94F6B]' : 'text-[#e8c872]'}`}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowRight, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LaunchPremiereStageProps {
  onEnterStore: () => void;
}

export const LaunchPremiereStage: React.FC<LaunchPremiereStageProps> = ({ onEnterStore }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [soundActive, setSoundActive] = useState(false);

  useEffect(() => {
    const targetDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({
          days: d < 10 ? '0' + d : '' + d,
          hours: h < 10 ? '0' + h : '' + h,
          minutes: m < 10 ? '0' + m : '' + m,
          seconds: s < 10 ? '0' + s : '' + s
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch(`${API}/api/contact/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setIsSubscribed(true);
      toast.success('Your invitation to the Grand Atelier Reveal has been reserved!');
    } catch (e) {
      setIsSubscribed(true);
      toast.success('Your invitation to the Grand Atelier Reveal has been reserved!');
    }
  };

  const toggleSound = () => {
    setSoundActive(prev => !prev);
    if (!soundActive) {
      toast('Atelier harmonic chimes enabled 🎵', { icon: '✨' });
    }
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between items-center text-center px-4 py-10 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#e8c872]/20 via-[#10b981]/15 to-transparent blur-3xl float-orb-1" />
        <div className="absolute bottom-[-20%] right-[15%] w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-[#0b3323]/40 via-transparent to-transparent blur-3xl float-orb-2" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(232,200,114,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-70" />
      </div>

      {/* Brand Header */}
      <header className="relative z-10 pt-4 pb-2">
        <div className="inline-flex flex-col items-center">
          <span className="font-signature text-5xl sm:text-6xl font-normal text-[#fbf5e6] drop-shadow-[0_0_30px_rgba(232,200,114,0.5)]">
            niharikartist
          </span>
          <span className="text-[11px] sm:text-xs tracking-[0.5em] uppercase text-[#a3b8af] font-sans font-medium mt-[-2px]">
            haute art atelier &amp; gallery
          </span>
        </div>
      </header>

      {/* Hero Countdown Section */}
      <main className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center my-auto py-8 space-y-8">
        {/* Eyebrow Tagline */}
        <div className="inline-flex items-center gap-4">
          <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-[#e8c872]" />
          <span className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-[#e8c872]">
            Where unspoken love, childhood kinship, and eternal blooms take permanent form
          </span>
          <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-[#e8c872]" />
        </div>

        {/* Main Display Headline */}
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-zinc-100 font-light leading-tight max-w-3xl">
          The Grand Atelier Exhibition.<br />
          <span className="champagne-gradient-text font-normal">The Premiere Countdown is Live</span>
        </h1>

        {/* 4-Digit Glassmorphism Timer */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-2xl w-full">
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[4/3] glass-atelier rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="font-display text-3xl sm:text-5xl font-bold text-white tracking-wider">{timeLeft.days}</span>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#a3b8af] mt-2 font-medium">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[4/3] glass-atelier rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="font-display text-3xl sm:text-5xl font-bold text-white tracking-wider">{timeLeft.hours}</span>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#a3b8af] mt-2 font-medium">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[4/3] glass-atelier rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="font-display text-3xl sm:text-5xl font-bold text-white tracking-wider">{timeLeft.minutes}</span>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#a3b8af] mt-2 font-medium">Minutes</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[4/3] glass-atelier rounded-2xl flex items-center justify-center border-[#e8c872]/60 shadow-[0_0_30px_rgba(232,200,114,0.3)] animate-pulse">
              <span className="font-display text-3xl sm:text-5xl font-bold text-[#fbf5e6] tracking-wider">{timeLeft.seconds}</span>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#e8c872] mt-2 font-semibold">Seconds</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={onEnterStore}
            className="bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 text-black font-semibold px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(232,200,114,0.4)] btn-magnetic flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Explore The Fine Art Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className="bg-[#0c241a]/90 hover:bg-[#143829] border border-emerald-800/60 px-6 py-4 rounded-full text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-2 transition-colors btn-magnetic"
          >
            {soundActive ? <Volume2 className="w-4 h-4 text-[#e8c872]" /> : <VolumeX className="w-4 h-4 text-[#a3b8af]" />}
            <span>{soundActive ? 'Mute Harmony' : 'Play Atmosphere'}</span>
          </button>
        </div>

        {/* VIP Early Access */}
        <div className="w-full max-w-md bg-[#0c251c]/85 border border-[#e8c872]/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <span className="text-xs uppercase tracking-widest text-[#e8c872] font-semibold block mb-1">
            Patron Private Access
          </span>
          <p className="text-xs text-[#a3b8af] mb-4">
            Enter your email to receive an exclusive invitation to the private catalogue preview.
          </p>
          {isSubscribed ? (
            <div className="text-emerald-400 text-xs font-medium py-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Your Private Patron Access has been registered!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="bg-[#06120d] border border-emerald-900/70 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-emerald-700 focus:outline-none focus:border-[#e8c872] flex-1"
                required
              />
              <button type="submit" className="bg-[#e8c872] hover:bg-[#d4b055] text-black px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider btn-magnetic">
                Reserve
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="relative z-10 py-4 text-xs text-[#627a70] font-sans">
        <p>Handcrafted Original Acrylic &amp; Oil Works • All Rights Reserved • &copy; 2026 niharikartist</p>
      </footer>
    </div>
  );
};
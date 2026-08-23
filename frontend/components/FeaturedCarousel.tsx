'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const AUTO_INTERVAL = 3500; // ms between auto-advances

interface Artwork {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  slug?: string;
}

export default function FeaturedCarousel() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API}/api/gallery?featured=true`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length) {
          // Use up to 10 featured gallery items
          setArtworks(d.data.slice(0, 10));
        }
      })
      .catch(() => {});
  }, []);

  const go = useCallback((dir: 'next' | 'prev') => {
    if (animating || artworks.length < 2) return;
    setAnimating(true);
    setCurrent(prev => {
      if (dir === 'next') return (prev + 1) % artworks.length;
      return (prev - 1 + artworks.length) % artworks.length;
    });
    setTimeout(() => setAnimating(false), 600);
  }, [animating, artworks.length]);

  // Auto-advance
  useEffect(() => {
    if (artworks.length <= 1) return;
    timerRef.current = setInterval(() => go('next'), AUTO_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [artworks.length, go]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go('next'), AUTO_INTERVAL);
  };

  const handlePrev = () => { go('prev'); resetTimer(); };
  const handleNext = () => { go('next'); resetTimer(); };

  if (artworks.length === 0) return null;

  // Build visible positions: [..., prev2, prev1, CENTER, next1, next2, ...]
  const getIndex = (offset: number) =>
    (current + offset + artworks.length * 10) % artworks.length;

  // Each card's transform based on its offset from center
  const cardStyle = (offset: number): React.CSSProperties => {
    const absOff = Math.abs(offset);
    if (absOff > 2) return { opacity: 0, pointerEvents: 'none', position: 'absolute' };

    const xMap:  Record<number, string> = { 0: '0%', 1: '62%', 2: '108%' };
    const xVal = offset >= 0 ? xMap[offset] : `-${xMap[-offset]}`;
    const scaleMap: Record<number, number> = { 0: 1, 1: 0.78, 2: 0.6 };
    const scale = scaleMap[absOff];
    const opacity = absOff === 0 ? 1 : absOff === 1 ? 0.75 : 0.45;
    const zIndex = 10 - absOff * 3;
    const blur = absOff > 1 ? 'blur(1px)' : 'none';
    const rotY = offset < 0 ? '12deg' : offset > 0 ? '-12deg' : '0deg';

    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translateX(calc(-50% + ${xVal})) translateY(-50%) scale(${scale}) perspective(1200px) rotateY(${rotY})`,
      opacity,
      zIndex,
      filter: blur,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: absOff > 0 ? 'pointer' : 'default',
    };
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#050f0b] to-[#081d14] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14 space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#e8c872] font-semibold block">Selected Work</span>
          <h2 className="font-display text-3xl sm:text-4xl text-zinc-100 font-light">Featured Artwork</h2>
          <p className="text-xs text-[#a3b8af]">A glimpse into recent paintings, portraits and commissions.</p>
        </div>

        {/* Carousel stage */}
        <div className="relative h-[380px] sm:h-[420px] select-none">

          {/* Cards */}
          {[-2, -1, 0, 1, 2].map(offset => {
            const idx = getIndex(offset);
            const art = artworks[idx];
            if (!art) return null;
            return (
              <div
                key={`${idx}-${offset}`}
                style={cardStyle(offset)}
                onClick={() => {
                  if (offset !== 0) {
                    if (offset > 0) handleNext();
                    else handlePrev();
                  }
                }}
              >
                <div className="w-[200px] sm:w-[240px] bg-[#0a2319] rounded-2xl overflow-hidden border border-[#e8c872]/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                  <div className="relative aspect-[3/4] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/studio_hero.jpg'; }}
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050f0b]/80 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Prev button */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#0a2319]/90 border border-[#e8c872]/40 text-[#e8c872] hover:bg-[#e8c872] hover:text-black transition-all shadow-xl flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#0a2319]/90 border border-[#e8c872]/40 text-[#e8c872] hover:bg-[#e8c872] hover:text-black transition-all shadow-xl flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Active card info */}
        {artworks[current] && (
          <div className="text-center mt-6 space-y-1 transition-all duration-500">
            <h3 className="font-display text-xl text-zinc-100">{artworks[current].title}</h3>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#e8c872] font-semibold">
              {artworks[current].category}
            </span>
          </div>
        )}

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {artworks.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); resetTimer(); }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-[#e8c872]'
                  : 'w-2 h-2 bg-emerald-800/60 hover:bg-emerald-700'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-[#0a2319] hover:bg-[#123627] border border-[#e8c872]/40 text-[#fbf5e6] px-7 py-3 rounded-full text-xs uppercase tracking-[0.2em] transition-all btn-magnetic"
          >
            View Full Gallery →
          </Link>
        </div>

      </div>
    </section>
  );
}

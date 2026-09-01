'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const AUTO_INTERVAL = 5000;

interface Artwork {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export default function FeaturedCarousel() {
  const { c } = useSiteContent('gallery');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/api/gallery?featured=true`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length) {
          setArtworks(d.data.slice(0, 12));
        }
      })
      .catch(() => {});
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % (artworks.length || 1));
    }, AUTO_INTERVAL);
  }, [artworks.length]);

  useEffect(() => {
    if (artworks.length > 1) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [artworks.length, startTimer]);

  const goTo = (idx: number) => {
    setCurrent((idx + artworks.length) % artworks.length);
    startTimer();
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Touch / drag support
  const onDragStart = (x: number) => { setIsDragging(true); setDragStart(x); };
  const onDragEnd   = (x: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = dragStart - x;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  if (artworks.length === 0) return null;

  // Card dimensions and spacing
  const CARD_W  = 200; // px — center card
  const GAP     = 20;  // px between cards

  return (
    <section className="py-20 bg-gradient-to-b from-[#050f0b] to-[#081d14] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#e8c872] font-semibold block">
            {c('carousel_label', 'Selected Work')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-zinc-100 font-light">
            {c('carousel_title', 'Featured Artwork')}
          </h2>
          <p className="text-xs text-[#a3b8af]">
            {c('carousel_subtitle', 'A glimpse into recent paintings, portraits and commissions.')}
          </p>
        </div>

        {/* Carousel wrapper */}
        <div
          className="relative overflow-hidden"
          style={{ height: 320 }}
          onMouseDown={e => onDragStart(e.clientX)}
          onMouseUp={e => onDragEnd(e.clientX)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchEnd={e => onDragEnd(e.changedTouches[0].clientX)}
        >
          {/* Track — slides via CSS transform */}
          <div
            ref={trackRef}
            className="flex items-center h-full"
            style={{
              gap: GAP,
              // Centre the active card: offset = -(current * (CARD_W + GAP)) + centreOffset
              transform: `translateX(calc(50% - ${CARD_W / 2}px - ${current * (CARD_W + GAP)}px))`,
              transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}
          >
            {artworks.map((art, i) => {
              const offset = i - current;
              const absOff = Math.abs(offset);
              const scale  = absOff === 0 ? 1 : absOff === 1 ? 0.82 : 0.65;
              const opacity = absOff === 0 ? 1 : absOff === 1 ? 0.7 : absOff === 2 ? 0.45 : 0.2;
              const rotY   = offset < 0 ? '14deg' : offset > 0 ? '-14deg' : '0deg';

              return (
                <div
                  key={art.id}
                  onClick={() => absOff > 0 && goTo(i)}
                  style={{
                    width: CARD_W,
                    flexShrink: 0,
                    transform: `scale(${scale}) perspective(900px) rotateY(${rotY})`,
                    opacity,
                    transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease',
                    cursor: absOff > 0 ? 'pointer' : 'default',
                    transformOrigin: offset < 0 ? 'right center' : offset > 0 ? 'left center' : 'center',
                    zIndex: 10 - absOff,
                    position: 'relative',
                  }}
                >
                  <div
                    className="rounded-2xl overflow-hidden border shadow-2xl"
                    style={{
                      borderColor: absOff === 0 ? 'rgba(232,200,114,0.6)' : 'rgba(232,200,114,0.15)',
                      boxShadow: absOff === 0
                        ? '0 25px 60px rgba(0,0,0,0.85), 0 0 30px rgba(232,200,114,0.15)'
                        : '0 10px 30px rgba(0,0,0,0.6)',
                      background: '#0a2319',
                    }}
                  >
                    <div style={{ position: 'relative', width: CARD_W, aspectRatio: '3/4' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        fetchPriority={i === 0 ? 'high' : 'low'}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/studio_hero.jpg'; }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(5,15,11,0.75) 0%, transparent 60%)'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prev button */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
              bg-[#0a2319]/90 border border-[#e8c872]/40 text-[#e8c872] hover:bg-[#e8c872] hover:text-black shadow-xl backdrop-blur-md"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next button */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
              bg-[#0a2319]/90 border border-[#e8c872]/40 text-[#e8c872] hover:bg-[#e8c872] hover:text-black shadow-xl backdrop-blur-md"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Active card info */}
        <div className="text-center mt-5 space-y-1 min-h-[44px]">
          <p className="font-display text-xl text-zinc-100 transition-all duration-300">
            {artworks[current]?.title}
          </p>
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#e8c872] font-semibold">
            {artworks[current]?.category}
          </span>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-5">
          {artworks.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                background: i === current ? '#e8c872' : 'rgba(52,100,70,0.6)',
              }}
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

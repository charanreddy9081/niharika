'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const FALLBACK = '/images/studio_hero.jpg';
const INTERVAL_MS = 4000;   // change interval — edit here only
const DURATION_MS = 900;    // cinematic slide duration — matches CSS

export interface HomeTransitionImage {
  id: string;
  title: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  is_active: boolean;
}

export type SlideDirection = 'next' | 'prev' | 'none';

export function useHomeTransition() {
  const [images, setImages]           = useState<HomeTransitionImage[]>([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [nextIdx, setNextIdx]         = useState<number | null>(null);
  const [direction, setDirection]     = useState<SlideDirection>('none');
  const [animating, setAnimating]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef   = useRef(false); // prevent overlapping transitions

  // Fetch active images once
  useEffect(() => {
    fetch(`${API}/api/home-transition`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setImages(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Slide to a specific index
  const slideTo = useCallback((toIdx: number, dir: SlideDirection) => {
    if (lockRef.current || images.length <= 1) return;
    lockRef.current = true;
    setNextIdx(toIdx);
    setDirection(dir);
    setAnimating(true);

    setTimeout(() => {
      setCurrentIdx(toIdx);
      setNextIdx(null);
      setDirection('none');
      setAnimating(false);
      lockRef.current = false;
    }, DURATION_MS);
  }, [images.length]);

  const slideNext = useCallback(() => {
    if (images.length <= 1) return;
    slideTo((currentIdx + 1) % images.length, 'next');
  }, [images.length, currentIdx, slideTo]);

  const slidePrev = useCallback(() => {
    if (images.length <= 1) return;
    slideTo((currentIdx - 1 + images.length) % images.length, 'prev');
  }, [images.length, currentIdx, slideTo]);

  // Auto-rotate timer — cleaned up on unmount
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(slideNext, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, slideNext]);

  const current = images[currentIdx] ?? null;
  const next    = nextIdx !== null ? images[nextIdx] : null;

  return {
    images,
    current,
    next,
    direction,
    animating,
    loading,
    slideNext,
    slidePrev,
    // Simple fallback values
    currentSrc: current?.image_url || FALLBACK,
    currentAlt: current?.title     || 'niharikartist fine art',
    hasFallback: images.length === 0,
    DURATION_MS,
  };
}

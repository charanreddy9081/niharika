'use client';

import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ArtistImage {
  id: string;
  title: string;
  description: string;
  storage_path: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

const FALLBACK_IMAGE = '/images/studio_hero.jpg';

/**
 * useArtistImage(autoRotate, intervalMs)
 *
 * @param autoRotate  true = auto-cycle every `intervalMs` (for home page hero)
 *                    false = pick one randomly on mount and stay (for about page)
 * @param intervalMs  rotation interval in ms (default 3000)
 */
export function useArtistImage(autoRotate = false, intervalMs = 3000) {
  const [images, setImages] = useState<ArtistImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch images once on mount
  useEffect(() => {
    fetch(`${API}/api/artist-images`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setImages(d.data);
          // Start at a random index
          const start = Math.floor(Math.random() * d.data.length);
          setCurrentIndex(start);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate timer
  useEffect(() => {
    if (!autoRotate || images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setImages(imgs => {
        setCurrentIndex(prev => {
          const next = (prev + 1) % imgs.length;
          setNextIndex(next);
          setTransitioning(true);
          // After crossfade completes, swap current → next
          setTimeout(() => {
            setCurrentIndex(next);
            setNextIndex(null);
            setTransitioning(false);
          }, 800); // match CSS transition duration
          return prev; // keep prev during transition
        });
        return imgs;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRotate, images.length, intervalMs]);

  const current = images[currentIndex] ?? null;
  const next = nextIndex !== null ? images[nextIndex] : null;

  return {
    images,
    current,
    next,
    transitioning,
    loading,
    // Convenience for simple single-image usage (about page)
    src: current?.image_url || FALLBACK_IMAGE,
    alt: current?.title || 'Artist Niharika at Studio Easel',
  };
}

'use client';

import { useState, useEffect } from 'react';

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
const LAST_SHOWN_KEY = 'nha_last_artist_img';

/**
 * Hook: useArtistImage()
 *
 * Fetches active artist images, picks one on mount, avoids immediate repetition.
 * Image only changes when the page/component is mounted — NOT on a timer.
 *
 * Returns: { image, allImages, loading }
 */
export function useArtistImage() {
  const [image, setImage] = useState<ArtistImage | null>(null);
  const [allImages, setAllImages] = useState<ArtistImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/artist-images`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          const imgs: ArtistImage[] = d.data;
          setAllImages(imgs);

          if (imgs.length === 1) {
            setImage(imgs[0]);
          } else {
            // Avoid showing the same image twice in a row
            const lastId = typeof window !== 'undefined'
              ? sessionStorage.getItem(LAST_SHOWN_KEY)
              : null;

            const candidates = imgs.filter(i => i.id !== lastId);
            const pool = candidates.length > 0 ? candidates : imgs;
            const picked = pool[Math.floor(Math.random() * pool.length)];

            if (typeof window !== 'undefined') {
              sessionStorage.setItem(LAST_SHOWN_KEY, picked.id);
            }
            setImage(picked);
          }
        }
      })
      .catch(() => { /* fallback image used */ })
      .finally(() => setLoading(false));
  }, []);

  return {
    image,
    allImages,
    loading,
    src: image?.image_url || FALLBACK_IMAGE,
    alt: image?.title || 'Artist Niharika at Studio Easel',
  };
}

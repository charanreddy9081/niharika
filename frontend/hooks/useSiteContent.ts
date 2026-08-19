'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Cache content in module scope so all components share one fetch per session
let _cache: Record<string, Record<string, string>> | null = null;
let _fetchPromise: Promise<Record<string, Record<string, string>>> | null = null;

async function fetchContent(): Promise<Record<string, Record<string, string>>> {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(`${API}/api/content`)
    .then(r => r.json())
    .then(d => {
      _cache = d.success ? (d.data as Record<string, Record<string, string>>) : {};
      _fetchPromise = null;
      return _cache!;
    })
    .catch(() => {
      _fetchPromise = null;
      return {} as Record<string, Record<string, string>>;
    });

  return _fetchPromise;
}

// Invalidate cache — called after admin saves content
export function invalidateContentCache() {
  _cache = null;
  _fetchPromise = null;
}

/**
 * Hook: useSiteContent(section)
 *
 * Returns a `c(key, fallback)` helper that looks up content_key within section.
 * Falls back to the provided string while loading or if key is missing.
 *
 * Usage:
 *   const { c, loading } = useSiteContent('artist');
 *   <h2>{c('origin_title', 'Every Brushstroke is a Gentle Embrace')}</h2>
 */
export function useSiteContent(section: string) {
  const [sectionData, setSectionData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchContent().then(all => {
      if (!cancelled) {
        setSectionData(all[section] || {});
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [section]);

  const c = useCallback(
    (key: string, fallback: string): string => {
      return sectionData[key] !== undefined ? sectionData[key] : fallback;
    },
    [sectionData]
  );

  return { c, loading, sectionData };
}

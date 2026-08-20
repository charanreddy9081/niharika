'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CACHE_KEY = 'nha_site_content';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: Record<string, Record<string, string>>;
  timestamp: number;
}

// Module-level memory cache — shared across all hook instances in one session
let _memCache: Record<string, Record<string, string>> | null = null;
let _fetchPromise: Promise<Record<string, Record<string, string>>> | null = null;

function readLocalCache(): Record<string, Record<string, string>> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch { return null; }
}

function writeLocalCache(data: Record<string, Record<string, string>>) {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

async function fetchContent(): Promise<Record<string, Record<string, string>>> {
  // Return memory cache immediately if fresh
  if (_memCache) return _memCache;

  // Deduplicate parallel calls
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(`${API}/api/content`, { cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      const result = d.success ? (d.data as Record<string, Record<string, string>>) : {};
      _memCache = result;
      writeLocalCache(result);
      _fetchPromise = null;
      return result;
    })
    .catch(() => {
      _fetchPromise = null;
      return _memCache || {};
    });

  return _fetchPromise;
}

export function invalidateContentCache() {
  _memCache = null;
  _fetchPromise = null;
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

/**
 * useSiteContent(section)
 *
 * Stale-while-revalidate:
 * 1. Instantly returns cached content (localStorage) while fetching fresh data.
 * 2. Updates the UI when fresh data arrives.
 * 3. Falls back to hardcoded strings if the backend is unreachable.
 */
export function useSiteContent(section: string) {
  const [sectionData, setSectionData] = useState<Record<string, string>>(() => {
    // Synchronously read localStorage on first render to avoid flash
    if (typeof window === 'undefined') return {};
    const cached = readLocalCache();
    return cached?.[section] || {};
  });
  const [loading, setLoading] = useState(Object.keys(sectionData).length === 0);

  useEffect(() => {
    let cancelled = false;

    // If we already have stale cache, show it immediately and revalidate in background
    const staleCache = readLocalCache();
    if (staleCache?.[section]) {
      setSectionData(staleCache[section]);
      setLoading(false);
    }

    fetchContent().then(all => {
      if (!cancelled) {
        setSectionData(all[section] || {});
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [section]);

  const c = useCallback(
    (key: string, fallback: string): string =>
      sectionData[key] !== undefined ? sectionData[key] : fallback,
    [sectionData]
  );

  return { c, loading, sectionData };
}

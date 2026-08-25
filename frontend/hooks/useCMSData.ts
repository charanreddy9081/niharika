'use client';

import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

// Cache in module scope — shared across all hook instances
const _cache: Record<string, { data: any; ts: number }> = {};
const TTL = 5 * 60 * 1000; // 5 min

async function fetchCMS(path: string) {
  const now = Date.now();
  if (_cache[path] && now - _cache[path].ts < TTL) return _cache[path].data;
  const r = await fetch(`${API}${path}`).then(r => r.json());
  if (r.success) { _cache[path] = { data: r.data, ts: now }; return r.data; }
  return null;
}

export function useSocialLinks() {
  const [links, setLinks] = useState<any[]>([]);
  useEffect(() => {
    fetchCMS('/api/cms/social-links').then(d => { if (d) setLinks(d); }).catch(() => {});
  }, []);
  return links;
}

export function useWebsiteSettings() {
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    fetchCMS('/api/cms/settings').then(d => { if (d) setSettings(d); }).catch(() => {});
  }, []);
  return settings;
}

export function useFaqs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchCMS('/api/cms/faqs')
      .then(d => { if (d) setFaqs(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { faqs, loading };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchCMS('/api/cms/testimonials')
      .then(d => { if (d) setTestimonials(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { testimonials, loading };
}

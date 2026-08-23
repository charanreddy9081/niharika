'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ArrowRight, User } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const FALLBACK = '/images/product_1_1.jpg';

interface JournalStory {
  id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  category?: string;
  author: string;
  article_date?: string;
  excerpt: string;
  content?: string;
  image_url: string;
  is_featured?: boolean;
  is_published?: boolean;
  is_active?: boolean;
  display_order: number;
  created_at: string;
}

function storyUrl(s: JournalStory) {
  return `/journal/${s.slug || s.id}`;
}

function cleanExcerpt(text: string, max = 200) {
  return text.replace(/\*/g, '').replace(/\n/g, ' ').trim().substring(0, max) + (text.length > max ? '…' : '');
}

export default function JournalPage() {
  const { c } = useSiteContent('community');
  const [stories, setStories] = useState<JournalStory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(() => {
    fetch(`${API}/api/journal`)
      .then(r => r.json())
      .then(d => { if (d.success) setStories(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);
  useAutoRefresh(fetchStories);

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#e8c872] font-semibold block">
            {c('page_label', 'The Atelier Journal')}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-zinc-100 font-light leading-tight">
            {c('page_title', 'Patron Reflections & Stories')}
          </h1>
          <p className="text-sm text-[#a3b8af] max-w-xl mx-auto leading-relaxed">
            {c('page_subtitle', 'Behind every handpainted frame is an intimate tale of reunions, whispered gratitude, and quiet love.')}
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="w-16 h-px bg-[#e8c872]/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#e8c872]/50" />
            <div className="w-16 h-px bg-[#e8c872]/30" />
          </div>
        </div>

        {/* ── Articles ────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-6">

          {loading ? (
            /* Skeletons */
            [1, 2, 3].map(i => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 rounded-2xl overflow-hidden border border-white/[0.06] animate-pulse">
                <div className="aspect-[4/3] sm:aspect-auto sm:h-56 bg-emerald-950/40" />
                <div className="bg-[#0a2319]/60 p-8 space-y-3">
                  <div className="h-3 w-24 bg-emerald-900/60 rounded" />
                  <div className="h-6 w-3/4 bg-emerald-900/40 rounded" />
                  <div className="h-3 w-full bg-emerald-900/30 rounded" />
                  <div className="h-3 w-5/6 bg-emerald-900/30 rounded" />
                  <div className="h-3 w-2/3 bg-emerald-900/30 rounded" />
                </div>
              </div>
            ))
          ) : stories.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#a3b8af] text-sm">No journal articles yet. Check back soon.</p>
            </div>
          ) : (
            stories.map((story, idx) => (
              <article
                key={story.id}
                className="group grid grid-cols-1 sm:grid-cols-2 rounded-2xl overflow-hidden border border-[#e8c872]/10 hover:border-[#e8c872]/30 transition-all duration-500 shadow-[0_8px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_50px_rgba(0,0,0,0.7)]"
              >
                {/* Image — always on left for odd, right for even on larger screens */}
                <div className={`relative overflow-hidden ${idx % 2 !== 0 ? 'sm:order-2' : ''}`}>
                  <div className="aspect-[4/3] sm:aspect-auto sm:h-full" style={{ minHeight: 220 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.image_url || FALLBACK}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`bg-[#0a2319]/70 p-8 sm:p-10 flex flex-col justify-center space-y-4 ${idx % 2 !== 0 ? 'sm:order-1' : ''}`}>

                  {/* Category */}
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#e8c872] font-semibold">
                    {story.category || 'Patron Chronicle'}
                  </span>

                  {/* Title */}
                  <Link href={storyUrl(story)}>
                    <h2 className="font-display text-2xl sm:text-3xl text-zinc-100 font-light leading-snug hover:text-[#e8c872] transition-colors duration-200">
                      {story.title}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-sm text-[#a3b8af] leading-relaxed line-clamp-4">
                    {cleanExcerpt(story.excerpt, 220)}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-xs text-[#627a70] pt-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{story.author}</span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={storyUrl(story)}
                    className="inline-flex items-center gap-2 text-sm text-[#e8c872] font-semibold uppercase tracking-[0.15em] hover:gap-3 transition-all duration-200 group/cta pt-1"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        {!loading && stories.length > 0 && (
          <div className="border-t border-white/[0.06] py-16 text-center space-y-4">
            <p className="text-xs text-[#627a70] uppercase tracking-[0.3em]">
              {c('cta_title', 'Share Your Atelier Memory')}
            </p>
            <p className="text-sm text-[#a3b8af] max-w-md mx-auto">
              {c('cta_description', 'Did your niharikartist frame create a cherished moment? Send us your story.')}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#e8c872] hover:bg-[#d4b055] text-black px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-colors btn-magnetic mt-2"
            >
              {c('cta_btn', 'Submit Chronicle')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ArrowRight, Calendar, User } from 'lucide-react';
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

function formatDate(d?: string) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return d; }
}

function storyUrl(s: JournalStory) {
  return `/journal/${s.slug || s.id}`;
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

  const featured = stories.find(s => s.is_featured) || stories[0] || null;
  const rest = stories.filter(s => s.id !== featured?.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#e8c872] font-semibold block">
            {c('page_label', 'The Atelier Journal')}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-zinc-100 font-light leading-tight">
            {c('page_title', 'Patron Reflections & Stories')}
          </h1>
          <p className="text-sm text-[#a3b8af] max-w-xl mx-auto leading-relaxed">
            {c('page_subtitle', 'Behind every handpainted frame is an intimate tale of reunions, whispered gratitude, and quiet love.')}
          </p>
          {/* Decorative rule */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="w-16 h-px bg-[#e8c872]/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#e8c872]/50" />
            <div className="w-16 h-px bg-[#e8c872]/30" />
          </div>
        </div>

        {loading ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-12">
            {/* Skeleton featured */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden border border-white/[0.06] animate-pulse">
              <div className="lg:col-span-7 aspect-[4/3] bg-emerald-950/40" />
              <div className="lg:col-span-5 bg-[#0a2319]/60 p-10 space-y-4">
                <div className="h-3 w-24 bg-emerald-900/60 rounded" />
                <div className="h-8 w-3/4 bg-emerald-900/40 rounded" />
                <div className="h-4 w-full bg-emerald-900/30 rounded" />
                <div className="h-4 w-5/6 bg-emerald-900/30 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[4/3] bg-emerald-950/40 rounded-xl" />
                  <div className="h-3 w-20 bg-emerald-900/50 rounded" />
                  <div className="h-5 w-4/5 bg-emerald-900/40 rounded" />
                  <div className="h-3 w-full bg-emerald-900/30 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : stories.length === 0 ? (
          <div className="max-w-4xl mx-auto px-4 py-24 text-center">
            <p className="text-[#a3b8af] text-sm">No journal articles yet. Check back soon.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">

            {/* ── Featured Article ──────────────────────────────────── */}
            {featured && (
              <article className="group grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-[#e8c872]/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:border-[#e8c872]/30 transition-all duration-500">
                {/* Image — 55% */}
                <div className="lg:col-span-7 relative overflow-hidden">
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.image_url || FALLBACK}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                      style={{ minHeight: 320 }}
                      onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#06120d]/60 hidden lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06120d]/70 to-transparent lg:hidden" />
                  </div>
                </div>

                {/* Content — 45% */}
                <div className="lg:col-span-5 bg-[#0a2319]/80 p-8 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]">
                      <span className="text-[#e8c872] font-semibold">{featured.category || 'Patron Chronicle'}</span>
                      {featured.article_date && (
                        <>
                          <span className="text-[#627a70]">·</span>
                          <span className="text-[#627a70]">{formatDate(featured.article_date)}</span>
                        </>
                      )}
                    </div>
                    <div className="w-8 h-px bg-[#e8c872]/40" />
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-zinc-100 font-light leading-tight">
                    {featured.title}
                  </h2>

                  {featured.subtitle && (
                    <p className="text-sm text-[#e8c872]/80 font-editorial italic">{featured.subtitle}</p>
                  )}

                  <p className="text-sm text-[#a3b8af] leading-relaxed line-clamp-4">
                    {featured.excerpt?.replace(/\*/g, '').replace(/\n/g, ' ').substring(0, 200)}
                    {featured.excerpt?.length > 200 ? '…' : ''}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#627a70]">
                      <User className="w-3.5 h-3.5" />
                      <span>{featured.author}</span>
                    </div>
                  </div>

                  <Link
                    href={storyUrl(featured)}
                    className="inline-flex items-center gap-2 text-sm text-[#e8c872] font-semibold uppercase tracking-[0.15em] hover:gap-3 transition-all duration-200 group/cta"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            )}

            {/* ── Section divider ─────────────────────────────────── */}
            {rest.length > 0 && (
              <div className="flex items-center gap-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-[#627a70] font-semibold whitespace-nowrap">
                  More from the Journal
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            )}

            {/* ── Journal Grid ─────────────────────────────────────── */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {rest.map(story => (
                  <article key={story.id} className="group flex flex-col">
                    {/* Image */}
                    <Link href={storyUrl(story)} className="block relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.06] group-hover:border-[#e8c872]/30 transition-colors duration-300 mb-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.image_url || FALLBACK}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                        loading="lazy"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06120d]/50 to-transparent" />
                    </Link>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] uppercase tracking-[0.28em] text-[#e8c872] font-semibold">
                        {story.category || 'Patron Chronicle'}
                      </span>
                      {story.article_date && (
                        <>
                          <span className="text-[#3a5a4a]">·</span>
                          <span className="text-[10px] text-[#627a70] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(story.article_date)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={storyUrl(story)}>
                      <h3 className="font-display text-xl sm:text-2xl text-zinc-100 font-light leading-snug group-hover:text-[#e8c872] transition-colors duration-200 mb-3 line-clamp-2">
                        {story.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-[#a3b8af] leading-relaxed line-clamp-3 flex-1 mb-4">
                      {story.excerpt?.replace(/\*/g, '').replace(/\n/g, ' ').substring(0, 160)}
                      {story.excerpt?.length > 160 ? '…' : ''}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <span className="text-[11px] text-[#627a70] flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {story.author}
                      </span>
                      <Link
                        href={storyUrl(story)}
                        className="text-[11px] text-[#e8c872] font-semibold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Read <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* ── CTA ─────────────────────────────────────────────── */}
            <div className="border-t border-white/[0.06] pt-16 text-center space-y-4">
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

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

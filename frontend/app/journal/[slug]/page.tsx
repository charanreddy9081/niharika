'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { ArrowLeft, ArrowRight, User, Calendar, Tag } from 'lucide-react';

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
  quote?: string;
  is_featured?: boolean;
  created_at: string;
}

function formatDate(d?: string) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return d; }
}

export default function JournalArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [story, setStory] = useState<JournalStory | null>(null);
  const [related, setRelated] = useState<JournalStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      fetch(`${API}/api/journal/${slug}`).then(r => r.json()),
      fetch(`${API}/api/journal`).then(r => r.json()),
    ])
      .then(([articleRes, allRes]) => {
        if (articleRes.success && articleRes.data) {
          setStory(articleRes.data);
          if (allRes.success) {
            setRelated((allRes.data || []).filter((s: JournalStory) => s.id !== articleRes.data.id).slice(0, 3));
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#06120d]">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-24 w-full space-y-8 animate-pulse">
          <div className="h-4 w-32 bg-emerald-900/40 rounded" />
          <div className="h-12 w-3/4 bg-emerald-900/30 rounded" />
          <div className="aspect-[16/9] bg-emerald-950/40 rounded-2xl" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-emerald-900/20 rounded" style={{ width: `${85 + i * 2}%` }} />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <div className="min-h-screen flex flex-col bg-[#06120d]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-24 text-center">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-zinc-200">Article not found</h2>
            <Link href="/community" className="text-[#e8c872] underline text-sm">← Back to Journal</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const content = story.content || story.excerpt || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1">

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
          <Link href="/community" className="inline-flex items-center gap-2 text-[11px] text-[#627a70] uppercase tracking-wider hover:text-[#e8c872] transition-colors">
            <ArrowLeft className="w-3 h-3" />
            The Atelier Journal
          </Link>
        </div>

        {/* ── Article Header ──────────────────────────────────────── */}
        <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">
          {/* Category */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#e8c872] font-semibold flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {story.category || 'Patron Chronicle'}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-zinc-100 font-light leading-[1.2]">
            {story.title}
          </h1>

          {/* Subtitle */}
          {story.subtitle && (
            <p className="text-lg text-[#a3b8af] font-editorial italic leading-relaxed">
              {story.subtitle}
            </p>
          )}

          {/* Author + Date */}
          <div className="flex items-center gap-5 text-xs text-[#627a70] border-t border-white/[0.06] pt-5">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="text-[#a3b8af]">{story.author}</span>
            </span>
            {story.article_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(story.article_date)}</span>
              </span>
            )}
          </div>
        </header>

        {/* ── Hero Image ──────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden border border-[#e8c872]/15 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.image_url || FALLBACK}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06120d]/30 to-transparent" />
          </div>
        </div>

        {/* ── Article Body ────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

          {/* Pull quote */}
          {story.quote && (
            <blockquote className="border-l-2 border-[#e8c872] pl-6 mb-10 py-2">
              <p className="font-editorial italic text-xl sm:text-2xl text-zinc-200 leading-relaxed">
                &ldquo;{story.quote}&rdquo;
              </p>
            </blockquote>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-sm sm:prose-base max-w-none
            prose-headings:font-display prose-headings:font-light prose-headings:text-zinc-100
            prose-p:text-[#c4bfb0] prose-p:leading-[1.9] prose-p:text-base
            prose-strong:text-zinc-200 prose-em:text-[#a3b8af]
            prose-hr:border-white/[0.08]
            space-y-5">
            {content.split('\n').map((para, i) => {
              if (!para.trim()) return null;
              const cleaned = para.replace(/\*/g, '').trim();
              if (!cleaned) return null;
              return (
                <p key={i} className="text-[#c4bfb0] leading-[1.9] text-base sm:text-[17px]">
                  {cleaned}
                </p>
              );
            })}
          </div>

          {/* Author signature */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-px bg-[#e8c872]/40" />
            <span className="text-sm text-[#a3b8af] font-editorial italic">— {story.author}</span>
          </div>
        </div>

        {/* ── Related Stories ─────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="bg-[#081d14] border-t border-white/[0.06] py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-8 h-px bg-[#e8c872]/40" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-[#e8c872] font-semibold">
                  More from the Journal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {related.map(rel => (
                  <Link key={rel.id} href={`/journal/${rel.slug || rel.id}`} className="group space-y-4 block">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.06] group-hover:border-[#e8c872]/30 transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rel.image_url || FALLBACK}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        loading="lazy"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#e8c872]">
                        {rel.category || 'Patron Chronicle'}
                      </span>
                      <h4 className="font-display text-lg text-zinc-100 font-light group-hover:text-[#e8c872] transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/community" className="inline-flex items-center gap-2 text-sm text-[#a3b8af] hover:text-[#e8c872] transition-colors uppercase tracking-wider">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Journal
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}

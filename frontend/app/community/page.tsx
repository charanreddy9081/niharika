'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Story {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  image_url: string;
  display_order: number;
}

export default function CommunityPage() {
  const { c } = useSiteContent('community');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/journal`)
      .then(r => r.json())
      .then(d => { if (d.success) setStories(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d] font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">
            {c('page_label', 'The Atelier Journal')}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-zinc-100 font-light">
            {c('page_title', 'Patron Reflections & Stories')}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3b8af] max-w-lg mx-auto">
            {c('page_subtitle', 'Behind every handpainted frame is an intimate tale of reunions, whispered gratitude, and quiet love.')}
          </p>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#0c241a]/80 border border-[#e8c872]/10 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-emerald-950/40" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-emerald-950/60 rounded w-1/3" />
                  <div className="h-4 bg-emerald-950/40 rounded w-3/4" />
                  <div className="h-3 bg-emerald-950/30 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16 text-[#a3b8af] text-sm mb-20">
            No stories published yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {stories.map(story => (
              <div key={story.id} className="bg-[#0c241a]/80 border border-[#e8c872]/20 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#e8c872]/50 transition-all duration-300 shadow-xl">
                <div>
                  <div className="relative aspect-[4/3] bg-[#06120d]">
                    <Image
                      src={story.image_url}
                      alt={story.title}
                      fill
                      className="object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/product_1_1.jpg'; }}
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] uppercase tracking-wider text-[#e8c872] font-semibold block">Patron Chronicle</span>
                    <h3 className="font-display text-xl text-zinc-100">{story.title}</h3>
                    <p className="text-xs text-[#a3b8af] leading-relaxed">{story.excerpt}</p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 border-t border-emerald-900/60 text-xs text-[#627a70] flex items-center justify-between">
                  <span>By {story.author}</span>
                  <Heart className="w-4 h-4 text-red-400 fill-red-400/40" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#0b1f16] border border-[#e8c872]/25 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
          <Sparkles className="w-8 h-8 text-[#e8c872] mx-auto" />
          <h3 className="font-display text-3xl text-zinc-100 font-light">
            {c('cta_title', 'Share Your Atelier Memory')}
          </h3>
          <p className="text-xs text-[#a3b8af] leading-relaxed">
            {c('cta_description', 'Did your niharikartist frame create a cherished moment? Send us your story or photo to be archived in our exhibition annals.')}
          </p>
          <div className="pt-2">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#e8c872] hover:bg-[#d4b055] text-black px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-colors btn-magnetic">
              <span>{c('cta_btn', 'Submit Chronicle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

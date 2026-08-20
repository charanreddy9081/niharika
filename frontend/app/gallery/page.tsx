'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import {
  Sparkles, Search, X, ChevronLeft, ChevronRight,
  Maximize2, ArrowRight, Send
} from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface GalleryItem {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  description?: string;
  year?: string;
  sortOrder?: number;
  isFeatured?: boolean;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { c } = useSiteContent('gallery');

  const fetchGallery = useCallback(() => {
    fetch(`${API}/api/gallery`)
      .then(res => res.json())
      .then(data => { if (data.success && Array.isArray(data.data)) setItems(data.data); })
      .catch(err => console.error('Failed to fetch gallery:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);
  useAutoRefresh(fetchGallery);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(it => {
      if (it.category) cats.add(it.category.trim());
    });
    return ['All', ...Array.from(cats)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchCat =
        selectedCategory === 'All' ||
        it.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery ||
        it.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.description && it.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        it.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050f0b] text-[#fbf5e6] font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a2319] border border-[#e8c872]/35 text-[#fbf5e6] text-xs uppercase tracking-[0.25em] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
            <span>{c('page_label', 'Masterworks Exhibition • Contemporary Portfolio')}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-zinc-100 font-light tracking-tight">
            {c('page_title', 'The Fine Art')} <span className="font-signature text-5xl sm:text-7xl text-[#fbf5e6] drop-shadow-[0_0_25px_rgba(232,200,114,0.45)]">Gallery</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#a3b8af] leading-relaxed">
            {c('page_subtitle', 'Explore authentic handpainted works, graphite & colour pencil portraits, live caricature studies, and live wedding paintings created by artist Niharika.')}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 border-b border-emerald-950/80 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              const count = cat === 'All' ? items.length : items.filter(it => it.category?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] text-black font-semibold shadow-[0_0_20px_rgba(232,200,114,0.35)]'
                      : 'bg-[#0a2319]/80 border border-emerald-900/60 text-[#a3b8af] hover:text-white hover:border-[#e8c872]/40'
                  }`}
                >
                  {cat} <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search artworks by title..."
              className="w-full bg-[#0a2319]/80 border border-emerald-900/80 rounded-full pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-emerald-700 focus:outline-none focus:border-[#e8c872] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-emerald-950/40 rounded-3xl animate-pulse border border-emerald-900/40" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-[#0a2319]/40 border border-emerald-900/60 rounded-3xl space-y-3">
            <p className="text-sm text-zinc-400">No gallery artworks found matching your selection.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-xs uppercase tracking-wider text-[#e8c872] underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id || item._id || item.slug}
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-3xl overflow-hidden bg-[#0a2319] border border-emerald-900/60 hover:border-[#e8c872]/80 transition-all duration-500 shadow-xl hover:shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer flex flex-col"
              >
                {/* Artwork Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050f0b] via-[#050f0b]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Hover Overlay Pill */}
                  <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="p-2 rounded-full bg-[#050f0b]/90 border border-[#e8c872]/60 text-[#e8c872] inline-flex items-center justify-center shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Year Tag */}
                  {item.year && (
                    <div className="absolute top-3.5 left-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#050f0b]/80 backdrop-blur-md border border-white/10 text-[10px] tracking-wider text-[#a3b8af]">
                        {item.year}
                      </span>
                    </div>
                  )}
                </div>

                {/* Caption & Category */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-[#0a2319]/90 border-t border-white/[0.04]">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8c872] font-semibold block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-display text-lg text-zinc-100 group-hover:text-[#fbf5e6] transition-colors leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                  </div>

                  {item.description && (
                    <p className="text-xs text-[#a3b8af] line-clamp-2 mt-2 font-sans leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="pt-3 mt-3 border-t border-emerald-950/60 flex items-center justify-between text-xs text-[#e8c872]">
                    <span className="text-[11px] uppercase tracking-wider font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Piece <ArrowRight className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">#{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activeItem && lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-[#0a2319]/90 border border-white/20 text-zinc-300 hover:text-[#e8c872] hover:border-[#e8c872] transition-colors shadow-2xl"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#0a2319]/90 border border-white/20 text-zinc-300 hover:text-[#e8c872] hover:border-[#e8c872] transition-colors shadow-2xl"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#0a2319]/90 border border-white/20 text-zinc-300 hover:text-[#e8c872] hover:border-[#e8c872] transition-colors shadow-2xl"
            aria-label="Next artwork"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Content Container */}
          <div className="max-w-5xl w-full max-h-[90vh] bg-[#071710] border border-[#e8c872]/35 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 flex-col">
            {/* Image Showcase */}
            <div className="lg:col-span-7 relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-auto lg:h-[75vh] bg-black/60 flex items-center justify-center overflow-hidden">
              <Image
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain p-2"
                priority
              />
            </div>

            {/* Artwork Story & Details */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[75vh] space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#0a2319] border border-[#e8c872]/40 text-[#e8c872] font-semibold uppercase tracking-wider text-[10px]">
                    {activeItem.category}
                  </span>
                  {activeItem.year && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-[#a3b8af] border border-emerald-900 text-[10px]">
                      Year {activeItem.year}
                    </span>
                  )}
                  <span className="text-zinc-500 text-[10px] ml-auto font-mono">
                    {lightboxIndex + 1} of {filteredItems.length}
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl text-zinc-100 font-light leading-tight">
                  {activeItem.title}
                </h2>

                <div className="h-[1px] bg-gradient-to-r from-[#e8c872]/40 via-emerald-900 to-transparent" />

                {activeItem.description ? (
                  <div className="text-xs sm:text-sm text-zinc-300 space-y-2 whitespace-pre-line leading-relaxed font-sans">
                    {activeItem.description}
                  </div>
                ) : (
                  <p className="text-xs text-[#a3b8af] italic">
                    Original archival artwork created by Niharika. Handcrafted with bespoke attention to emotion and timeless storytelling.
                  </p>
                )}
              </div>

              {/* Commission Inquiry Action */}
              <div className="pt-4 border-t border-emerald-950 space-y-3">
                <Link
                  href={`/contact?subject=Inquiry%20regarding%20${encodeURIComponent(activeItem.title)}`}
                  className="w-full bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 text-black font-semibold py-3.5 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(232,200,114,0.35)] btn-magnetic flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Inquire for Commission</span>
                </Link>
                <span className="text-[10px] text-[#627a70] text-center block">
                  Original hand-drawn commissions tailored to your intimate memories.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

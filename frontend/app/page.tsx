'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, ArrowRight, Star, Palette, Feather, Shield, Quote } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useHomeTransition } from '../hooks/useHomeTransition';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FeaturedCarousel from '../components/FeaturedCarousel';
import ReviewSection from '../components/ReviewSection';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SLIDE_DURATION = 900;

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { c } = useSiteContent('home');
  const {
    current, next, direction, animating, loading: imgLoading,
    currentSrc, currentAlt, hasFallback,
  } = useHomeTransition();

  const fetchProducts = useCallback(() => {
    fetch(`${API}/api/products`)
      .then(res => res.json())
      .then(data => { if (data.success && Array.isArray(data.data)) setProducts(data.data); })
      .catch(err => console.error('Failed to fetch products:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Auto-refresh: re-fetches when user returns to tab or network comes back
  useAutoRefresh(fetchProducts);

  // Scroll reveal refs — sections pop up as user scrolls
  const manifestoRef = useScrollReveal() as React.RefObject<HTMLElement>;
  const featuredRef  = useScrollReveal() as React.RefObject<HTMLElement>;
  const pillarsRef   = useScrollReveal() as React.RefObject<HTMLElement>;

  return (
    <div className="min-h-screen flex flex-col bg-[#050f0b]">
      <Header />

      <main className="flex-1 font-sans">
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center w-full">
            <div className="lg:col-span-7 space-y-7 text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a2319] border border-[#e8c872]/35 text-[#fbf5e6] text-xs uppercase tracking-[0.25em] backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
                <span>{c('hero_label', 'Fine Art Atelier • Bespoke Masterworks')}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-zinc-100 font-light leading-[1.12]">
                {c('hero_title_line1', 'Preserving Tender Moments')} <br />
                <span className="font-signature text-6xl sm:text-8xl text-[#fbf5e6] drop-shadow-[0_0_25px_rgba(232,200,114,0.45)] block mt-2">
                  {c('hero_title_line2', 'in Canvas & Gold Wax')}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-[#a3b8af] max-w-lg leading-relaxed font-sans">
                {c('hero_description', 'We craft deeply personal, handpainted original keepsakes, graphite & colour pencil portraits, and live wedding artworks designed to outlast generations.')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-3">
                <Link href="/gallery" className="w-full sm:w-auto bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 text-black font-semibold px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_25px_rgba(232,200,114,0.4)] btn-magnetic flex items-center justify-center gap-2">
                  <span>{c('hero_btn_primary', 'Explore Masterworks Gallery')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/shop" className="w-full sm:w-auto bg-[#0a2319]/90 hover:bg-[#123627] border border-emerald-800/60 text-zinc-300 px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-colors btn-magnetic flex items-center justify-center">
                  <span>{c('hero_btn_secondary', 'View Store Catalogue')}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#0a2319] border border-[#e8c872]/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">

                {/* ── Cinematic slide container ── */}
                <div className="absolute inset-0" style={{ perspective: '1200px' }}>

                  {/* Current image — slides out */}
                  <div
                    className="absolute inset-0"
                    style={{
                      transition: animating ? `transform ${SLIDE_DURATION}ms cubic-bezier(0.77,0,0.175,1), opacity ${SLIDE_DURATION}ms ease` : 'none',
                      transform: animating
                        ? direction === 'next' ? 'translateX(-105%)' : 'translateX(105%)'
                        : 'translateX(0)',
                      opacity: animating ? 0.4 : 1,
                      zIndex: 1,
                    }}
                  >
                    {imgLoading ? (
                      <div className="absolute inset-0 bg-[#0a2319] animate-pulse" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentSrc}
                        alt={currentAlt}
                        className="w-full h-full object-cover"
                        style={{ transform: animating ? 'scale(1.04)' : 'scale(1)', transition: `transform ${SLIDE_DURATION}ms ease` }}
                      />
                    )}
                  </div>

                  {/* Next image — slides in */}
                  {next && (
                    <div
                      className="absolute inset-0"
                      style={{
                        transition: `transform ${SLIDE_DURATION}ms cubic-bezier(0.77,0,0.175,1), opacity ${SLIDE_DURATION}ms ease`,
                        transform: animating
                          ? 'translateX(0) scale(1)'
                          : direction === 'next' ? 'translateX(105%)' : 'translateX(-105%)',
                        opacity: animating ? 1 : 0,
                        zIndex: 2,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={next.image_url}
                        alt={next.title || ''}
                        className="w-full h-full object-cover"
                        style={{ transform: animating ? 'scale(1)' : 'scale(1.04)', transition: `transform ${SLIDE_DURATION}ms ease` }}
                      />
                    </div>
                  )}

                  {/* Fallback — only when no images uploaded */}
                  {hasFallback && !imgLoading && (
                    <div className="absolute inset-0" style={{ zIndex: 1 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/studio_hero.jpg" alt="Featured Fine Art Masterpiece" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050f0b] via-transparent to-transparent pointer-events-none" style={{ zIndex: 3 }} />

                {/* Dot indicators — shown only when 2+ images */}
                {!hasFallback && (
                  <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {Array.from({ length: Math.min(5, (current ? 1 : 0)) }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#e8c872]/60" />
                    ))}
                  </div>
                )}

                {/* Testimonial pill */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#061810]/90 backdrop-blur-xl border border-[#e8c872]/30 shadow-xl space-y-1.5" style={{ zIndex: 4 }}>
                  <div className="flex text-amber-300 gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-300" />)}
                  </div>
                  <p className="font-editorial italic text-xs text-[#fbf5e6]">
                    {c('hero_testimonial', '"Unwrapping this handpainted piece felt like stepping into an intimate gallery of our childhood memories."')}
                  </p>
                  <span className="text-[10px] text-[#a3b8af] uppercase tracking-widest block font-sans">— Verified Patron Chronicle</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artwork Carousel */}
        <FeaturedCarousel />

        {/* Artist Manifesto */}
        <section ref={manifestoRef as any} className="py-20 bg-gradient-to-b from-[#081d14] to-[#050f0b] border-t border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#e8c872]/30 shadow-2xl bg-[#0a2319] reveal reveal-left">
              <Image src="/images/artist_working.jpg" alt="Artist Niharika at Studio Easel" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-[#061810]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10">
                <p className="font-editorial italic text-base text-[#fbf5e6]">
                  {c('manifesto_quote', '"Every brushstroke is a quiet devotion to the people who give our lives purpose."')}
                </p>
                <span className="text-[10px] uppercase tracking-widest text-[#a3b8af] mt-1 block font-sans">
                  {c('manifesto_quote_author', '— Niharika, Founder & Fine Artist')}
                </span>
              </div>
            </div>

            <div className="space-y-6 text-left reveal reveal-right justified">
              <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">
                {c('manifesto_label', 'The Studio Philosophy')}
              </span>
              <h2 className="font-display text-3xl sm:text-5xl text-zinc-100 font-light leading-tight">
                {c('manifesto_title', 'Art Created Not Merely to Be Seen, but to Be Felt')}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                {c('manifesto_body1', 'niharikartist is an independent fine art atelier founded on the conviction that love and memory deserve permanent, physical form. In a world of fleeting digital messages, we hand-paint original keepsakes that serve as anchors of warmth.')}
              </p>
              <p className="text-xs sm:text-sm text-[#a3b8af] leading-relaxed font-sans">
                {c('manifesto_body2', 'Every artwork is sketched in charcoal, rendered in archival acrylic and oil glazes, encased in solid teakwood moulding, and paired with custom wax-sealed calligraphy.')}
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-7 py-3.5 rounded-full text-xs uppercase tracking-[0.2em] transition-all btn-magnetic shadow-lg">
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Artworks — only show when products are available */}
        {(loading || products.length > 0) && (
        <section ref={featuredRef as any} className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 reveal">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block mb-2">
                {c('featured_label', 'Original Handcraft')}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-zinc-100 font-light">
                {c('featured_title', 'Featured Store Masterworks')}
              </h2>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-[0.2em] text-[#fbf5e6] hover:text-[#e8c872] flex items-center gap-1.5 font-semibold transition-colors">
              <span>View Full Catalogue ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-emerald-950/40 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map(product => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </div>
          )}
        </section>
        )}

        {/* Reviews — user submitted, admin approved */}
        <ReviewSection />

        {/* 4 Pillars */}
        <section ref={pillarsRef as any} className="py-20 bg-gradient-to-b from-[#050f0b] via-[#081b13] to-[#050f0b] border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 reveal">
              <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">
                {c('pillars_label', 'Studio Standards')}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-zinc-100 font-light">
                {c('pillars_title', 'The Making of an Heirloom')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { icon: <Palette className="w-6 h-6" />, title: c('pillars_step1_title', '1. Charcoal Draft'), desc: c('pillars_step1_desc', 'Hand-sketched with artist charcoal to capture intimate posture and emotion.') },
                { icon: <Sparkles className="w-6 h-6" />, title: c('pillars_step2_title', '2. Archival Glazes'), desc: c('pillars_step2_desc', 'Multi-layered lightfast acrylics and protective anti-UV museum varnish.') },
                { icon: <Shield className="w-6 h-6" />, title: c('pillars_step3_title', '3. Teakwood Framing'), desc: c('pillars_step3_desc', 'Solid seasoned wood framing with seamless corners and anti-glare shield.') },
                { icon: <Feather className="w-6 h-6" />, title: c('pillars_step4_title', '4. Gold Wax Seal'), desc: c('pillars_step4_desc', 'Complimentary personal note penned on vintage parchment and sealed in gold.') },
              ].map((p, i) => (
                <div key={i} className={`bg-[#0a2319]/70 border border-emerald-900/60 p-8 rounded-3xl space-y-3 shadow-xl reveal reveal-delay-${i + 1}`}>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-[#e8c872]/30 flex items-center justify-center mx-auto text-[#e8c872]">
                    {p.icon}
                  </div>
                  <h3 className="font-display text-lg text-white">{p.title}</h3>
                  <p className="text-xs text-[#a3b8af] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

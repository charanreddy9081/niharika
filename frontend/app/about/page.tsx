'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Sparkles, Heart, Palette, Feather, ArrowRight, Star } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useWebsiteSettings } from '../../hooks/useCMSData';

export default function AboutPage() {
  const { c } = useSiteContent('artist');
  const siteSettings = useWebsiteSettings();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // On server and first client render, show a skeleton that matches
  // exactly what the server would render — prevents hydration mismatch (#418)
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#06120d]">
        <Header />
        <main className="flex-1" />
        <Footer />
      </div>
    );
  }

  const originSrc = siteSettings?.about_origin_image || '/images/studio_hero.jpg';
  const craftSrc = siteSettings?.about_craft_image || '/images/framing_craft.jpg';

  return (
    <div className="min-h-screen flex flex-col bg-[#06120d]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full font-sans">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d261e] border border-[#e8c872]/35 text-[#fbf5e6] text-xs uppercase tracking-[0.25em] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
            <span>{c('hero_label', 'The Atelier Philosophy')}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-zinc-100 font-light leading-[1.12]">
            {c('hero_title_line1', 'Until the World Gets to Step Inside')} <br />
            <span className="font-signature text-6xl sm:text-8xl text-[#fbf5e6] drop-shadow-[0_0_25px_rgba(232,200,114,0.45)] block mt-2">
              {c('hero_title_line2', 'a Little World Inside You')}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#a3b8af] max-w-2xl mx-auto leading-relaxed">
            {c('hero_description', 'An intimate journey by artist Niharika — transforming fragile childhood memories, silent bonds of sisterhood, and eternal blooms into timeless, handpainted tactile heirlooms.')}
          </p>
        </div>

        {/* Featured Story Split: The Origin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden bg-[#0c241a] border border-[#e8c872]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {/* Artist image — no fixed aspect ratio, shows full photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originSrc}
                alt="Artist Niharika"
                className="w-full h-auto block"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/studio_hero.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06120d]/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 bg-[#081a13]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase tracking-widest text-[#e8c872] font-semibold block">{c('origin_box_title', 'Studio Palette & Easel')}</span>
                <p className="font-editorial italic text-xs text-[#fbf5e6] mt-0.5">{c('origin_box_subtitle', 'Where every memory is mixed with fine pigments and raw emotion.')}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-left justified">
            <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">
              {c('origin_label', 'Our Beginning')}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-zinc-100 font-light leading-tight">
              {c('origin_title', 'Every Brushstroke is a Gentle Embrace')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {c('origin_body1', '"niharikartist" was born out of an intimate longing to hold on to feelings that words alone cannot capture. As siblings grow older and life moves fast, the quiet warmth of childhood memories — whispered secrets, playful rivalries, and comforting embraces — remains eternal.')}
            </p>
            <p className="text-xs sm:text-sm text-[#a3b8af] leading-relaxed font-sans">
              {c('origin_body2', 'We believe that true art should never be a mass-produced poster. It should cuddle your soul, reminding you every single day of the safe place you share with the people you cherish most in this world.')}
            </p>
            <div className="pt-2 flex items-center gap-4">
              <div className="flex text-amber-300 gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-300" />)}
              </div>
              <span className="text-xs text-[#a3b8af] font-medium">
                {c('origin_stat', 'Over 500+ Handcrafted Heirlooms Delivered')}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Core Artistic Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-y border-white/[0.08] mb-28">
          <div className="bg-[#0c251d]/85 border border-[#e8c872]/25 p-8 rounded-3xl space-y-4 hover:border-[#e8c872]/55 transition-all duration-300 shadow-xl">
            <Palette className="w-8 h-8 text-[#e8c872]" />
            <h3 className="font-display text-2xl text-zinc-100">{c('pillar1_title', '100% Original Handpainted')}</h3>
            <p className="text-xs text-[#a3b8af] leading-relaxed font-sans">{c('pillar1_desc', 'Every frame is individually drafted with charcoal sketches, painted in rich archival acrylic layers, and sealed under museum-grade protective glazes.')}</p>
          </div>
          <div className="bg-[#0c251d]/85 border border-[#e8c872]/25 p-8 rounded-3xl space-y-4 hover:border-[#e8c872]/55 transition-all duration-300 shadow-xl">
            <Feather className="w-8 h-8 text-[#e8c872]" />
            <h3 className="font-display text-2xl text-zinc-100">{c('pillar2_title', 'Wax-Sealed Calligraphy')}</h3>
            <p className="text-xs text-[#a3b8af] leading-relaxed font-sans">{c('pillar2_desc', 'We hand-pen your custom personal notes on textured vintage parchment using archival fountain ink, sealed with an authentic gold wax stamp.')}</p>
          </div>
          <div className="bg-[#0c251d]/85 border border-[#e8c872]/25 p-8 rounded-3xl space-y-4 hover:border-[#e8c872]/55 transition-all duration-300 shadow-xl">
            <Heart className="w-8 h-8 text-[#e8c872]" />
            <h3 className="font-display text-2xl text-zinc-100">{c('pillar3_title', 'Emotional Keepsakes')}</h3>
            <p className="text-xs text-[#a3b8af] leading-relaxed font-sans">{c('pillar3_desc', "Designed to be cherished on Raksha Bandhan, birthdays, anniversaries, or simply to say 'thank you for being my safe space'.")}</p>
          </div>
        </div>

        {/* Second Visual Story: The Atelier Craft */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1 justified">
            <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">
              {c('craft_label', 'Archival Permanence')}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-zinc-100 font-light leading-tight">
              {c('craft_title', 'Crafted to Outlast Generations')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {c('craft_body1', 'We source hand-stretched heavy linen canvasses and solid seasoned teakwood moulding. Each frame is treated to withstand humidity, sunlight, and the passage of time.')}
            </p>
            <p className="text-xs sm:text-sm text-[#a3b8af] leading-relaxed font-sans">
              {c('craft_body2', "When your recipient opens their parcel, they don't just receive a gift — they receive a piece of timeless fine art that will hang proudly in their living space for decades to come.")}
            </p>
            <div className="pt-2">
              <Link href="/gallery" className="inline-flex items-center gap-2 bg-[#0d251d] hover:bg-[#14352a] border border-[#e8c872]/40 text-[#fbf5e6] px-6 py-3 rounded-full text-xs uppercase tracking-[0.2em] transition-all btn-magnetic">
                <span>Explore Masterworks Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden bg-[#0c241a] border border-[#e8c872]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={craftSrc}
                alt="Crafting Teakwood Keepsake Frames"
                className="w-full h-auto block"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/framing_craft.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06120d] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-[#081a13]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase tracking-widest text-[#e8c872] font-semibold block">{c('craft_box_title', 'Solid Wood Framing')}</span>
                <p className="font-editorial italic text-xs text-[#fbf5e6] mt-0.5">{c('craft_box_subtitle', 'Museum-grade framing with anti-glare protective shield.')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center bg-gradient-to-b from-[#fce8f0] to-[#fdf2f6] border border-[#D98FA6]/40 rounded-3xl p-12 max-w-3xl mx-auto space-y-6 shadow-2xl cta-dark-section">
          <Sparkles className="w-8 h-8 text-[#A94F6B] mx-auto animate-pulse" />
          <h3 className="font-display text-3xl sm:text-4xl text-[#2B2024] font-light">
            {c('cta_title', 'Step Inside The Atelier Store')}
          </h3>
          <p className="text-xs sm:text-sm text-[#806B72] max-w-md mx-auto">
            {c('cta_description', 'Explore our full catalog of handpainted frames, eternal flower bouquets, and vintage calligraphy letters.')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="w-full sm:w-auto bg-[#A94F6B] hover:bg-[#7B2D45] text-white font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_25px_rgba(169,79,107,0.4)] btn-magnetic flex items-center justify-center gap-2">
              <span>{c('cta_btn_primary', 'Browse All Artworks')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="w-full sm:w-auto bg-white hover:bg-[#fce8f0] border border-[#D98FA6] text-[#A94F6B] px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.2em] transition-colors btn-magnetic flex items-center justify-center cta-ghost-btn">
              <span>{c('cta_btn_secondary', 'Book Custom Commission')}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

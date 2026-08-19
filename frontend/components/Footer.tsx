'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Truck, Palette, Award, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#040e0a] border-t border-[#e8c872]/20 text-[#a3b8af] text-sm font-sans">
      {/* Atelier Value Guarantees */}
      <div className="border-b border-white/[0.06] py-12 bg-gradient-to-b from-[#06120d] to-[#040e0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Palette className="w-6 h-6 text-[#e8c872] mb-3" />
            <h4 className="font-display text-base text-zinc-200 tracking-wider">100% Original Fine Art</h4>
            <p className="text-xs text-[#a3b8af] mt-1 max-w-xs">Individually handpainted with archival artist acrylics and oil glazes.</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Truck className="w-6 h-6 text-[#e8c872] mb-3" />
            <h4 className="font-display text-base text-zinc-200 tracking-wider">Secure Pan-India Delivery</h4>
            <p className="text-xs text-[#a3b8af] mt-1 max-w-xs">Multi-layered protective shockproof armor with real-time tracking.</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Heart className="w-6 h-6 text-[#e8c872] mb-3" />
            <h4 className="font-display text-base text-zinc-200 tracking-wider">Personalized Calligraphy</h4>
            <p className="text-xs text-[#a3b8af] mt-1 max-w-xs">Complimentary wax-sealed handwritten note penned on vintage parchment.</p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Award className="w-6 h-6 text-[#e8c872] mb-3" />
            <h4 className="font-display text-base text-zinc-200 tracking-wider">Museum-Grade Framing</h4>
            <p className="text-xs text-[#a3b8af] mt-1 max-w-xs">Solid finished teakwood framing with anti-glare protective shield.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-signature text-4xl font-normal text-[#fbf5e6] drop-shadow-[0_0_20px_rgba(232,200,114,0.4)]">
              niharikartist
            </span>
            <span className="block text-[9px] tracking-[0.45em] uppercase text-[#a3b8af] font-sans font-medium mt-[-4px]">
              fine art &amp; atelier
            </span>
          </Link>
          <p className="text-xs text-[#a3b8af] leading-relaxed max-w-sm font-sans">
            An independent fine art atelier founded by artist Niharika, translating intimate human stories, spiritual devotions, and pop anime onto canvas and heavy archival sheets.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-[#e8c872]">
            <ShieldCheck className="w-4 h-4" />
            <span>Handmade in India • Archival Quality Guarantee</span>
          </div>
        </div>

        {/* Atelier Artworks */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-200 font-semibold">Artworks</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/gallery" className="hover:text-[#e8c872] transition-colors">Masterworks Gallery (50)</Link></li>
            <li><Link href="/shop?category=Spiritual%20%26%20Heritage%20Art" className="hover:text-[#e8c872] transition-colors">Spiritual &amp; Heritage</Link></li>
            <li><Link href="/shop?category=Pencil%20%26%20Graphite%20Portraits" className="hover:text-[#e8c872] transition-colors">Pencil Portraits</Link></li>
            <li><Link href="/shop?category=Original%20Acrylic%20Paintings" className="hover:text-[#e8c872] transition-colors">Acrylic Paintings</Link></li>
            <li><Link href="/shop?category=Anime%20Fanart%20Series" className="hover:text-[#e8c872] transition-colors">Anime Fanart</Link></li>
          </ul>
        </div>

        {/* Story & Journal */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-200 font-semibold">Atelier &amp; Story</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/about" className="hover:text-[#e8c872] transition-colors">Meet The Artist</Link></li>
            <li><Link href="/community" className="hover:text-[#e8c872] transition-colors">Exhibition Journal</Link></li>
            <li><Link href="/track-order" className="hover:text-[#e8c872] transition-colors">Live Order Tracker</Link></li>
            <li><Link href="/wishlist" className="hover:text-[#e8c872] transition-colors">Saved Wishlist</Link></li>
            <li><Link href="/contact" className="hover:text-[#e8c872] transition-colors">Studio Inquiries</Link></li>
          </ul>
        </div>

        {/* Care & Policies */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-200 font-semibold">Care &amp; Policies</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/shipping" className="hover:text-[#e8c872] transition-colors">Shipping &amp; Delivery</Link></li>
            <li><Link href="/refund-returns-policy" className="hover:text-[#e8c872] transition-colors">Refund &amp; Replacement</Link></li>
            <li><Link href="/faq" className="hover:text-[#e8c872] transition-colors">Frequently Asked Questions</Link></li>
            <li><Link href="/terms" className="hover:text-[#e8c872] transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-[#e8c872] transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/[0.06] py-6 text-center text-xs text-[#627a70] font-sans">
        <p>Original Studio Acrylic &amp; Oil Works • All Rights Reserved • &copy; 2026 niharikartist</p>
      </div>
    </footer>
  );
};

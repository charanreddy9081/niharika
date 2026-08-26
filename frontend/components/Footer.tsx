'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Truck, Palette, Award, ShieldCheck, ExternalLink } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useSocialLinks, useWebsiteSettings } from '../hooks/useCMSData';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  ),
  facebook: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  ),
  youtube: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
  ),
  whatsapp: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
  ),
  pinterest: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
  ),
};

export const Footer: React.FC = () => {
  const { c } = useSiteContent('footer');
  const socialLinks = useSocialLinks();
  const settings = useWebsiteSettings();

  return (
    <footer className="bg-[#040e0a] border-t border-[#e8c872]/20 text-[#a3b8af] text-sm font-sans">
      {/* Value Guarantees */}
      <div className="border-b border-white/[0.06] py-12 bg-gradient-to-b from-[#06120d] to-[#040e0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <Palette className="w-6 h-6 text-[#e8c872] mb-3" />, title: c('guarantee_1_title','100% Original Fine Art'),       desc: c('guarantee_1_desc','Individually handpainted with archival artist acrylics and oil glazes.') },
            { icon: <Truck   className="w-6 h-6 text-[#e8c872] mb-3" />, title: c('guarantee_2_title','Secure Pan-India Delivery'),      desc: c('guarantee_2_desc','Multi-layered protective shockproof armor with real-time tracking.') },
            { icon: <Heart   className="w-6 h-6 text-[#e8c872] mb-3" />, title: c('guarantee_3_title','Personalized Calligraphy'),        desc: c('guarantee_3_desc','Complimentary wax-sealed handwritten note penned on vintage parchment.') },
            { icon: <Award   className="w-6 h-6 text-[#e8c872] mb-3" />, title: c('guarantee_4_title','Museum-Grade Framing'),            desc: c('guarantee_4_desc','Solid finished teakwood framing with anti-glare protective shield.') },
          ].map((g, i) => (
            <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              {g.icon}
              <h4 className="font-display text-base text-zinc-200 tracking-wider">{g.title}</h4>
              <p className="text-xs text-[#a3b8af] mt-1 max-w-xs">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-signature text-4xl font-normal text-[#fbf5e6] drop-shadow-[0_0_20px_rgba(232,200,114,0.4)]">niharikartist</span>
            <span className="block text-[9px] tracking-[0.45em] uppercase text-[#a3b8af] font-sans font-medium mt-[-4px]">
              {c('brand_tagline', 'fine art & atelier')}
            </span>
          </Link>
          <p className="text-xs text-[#a3b8af] leading-relaxed max-w-sm font-sans">
            {c('brand_description', 'An independent fine art atelier founded by artist Niharika, translating intimate human stories, spiritual devotions, and pop anime onto canvas and heavy archival sheets.')}
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-[#e8c872]">
            <ShieldCheck className="w-4 h-4" />
            <span>{c('quality_badge', 'Handmade in India • Archival Quality Guarantee')}</span>
          </div>

          {/* Social Links — from CMS */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map(s => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#a3b8af] hover:text-[#e8c872] transition-colors text-xs"
                  title={s.label}>
                  {SOCIAL_ICONS[s.platform] || <ExternalLink className="w-4 h-4" />}
                  <span className="sr-only">{s.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Contact info from settings */}
          {settings?.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="text-xs text-[#a3b8af] hover:text-[#e8c872] transition-colors block">
              {settings.contact_email}
            </a>
          )}
        </div>

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

      {/* Copyright */}
      <div className="border-t border-white/[0.06] py-6 text-center text-xs text-[#627a70] font-sans">
        <p>{c('copyright', 'Original Studio Acrylic & Oil Works • All Rights Reserved • © 2026 niharikartist')}</p>
      </div>
    </footer>
  );
};

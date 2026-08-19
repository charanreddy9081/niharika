'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { toggleCart, totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const leftNavLinks = [
    { label: 'The Artist', href: '/about' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Store', href: '/shop' },
  ];

  const rightNavLinks = [
    { label: 'Journal', href: '/community' },
    { label: 'Commissions', href: '/contact' },
    { label: 'Order Status', href: '/track-order' },
  ];

  const allNavLinks = [...leftNavLinks, ...rightNavLinks];

  return (
    <>
      {/* Haute Announcement Ribbon */}
      <div className="bg-gradient-to-r from-[#081b13] via-[#102d21] to-[#081b13] border-b border-[#e8c872]/25 py-2 px-4 text-center text-[11px] sm:text-xs tracking-widest text-[#fbf5e6] flex items-center justify-center gap-3 font-sans">
        <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
        <span>Original Fine Art Heirlooms • Complimentary Wax-Sealed Calligraphy Scroll Included</span>
        <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050f0b]/95 backdrop-blur-2xl border-b border-white/[0.08] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-[#e8c872] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Left Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.22em] font-medium text-zinc-300">
            {leftNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-300 hover:text-[#e8c872] hover:tracking-[0.26em] ${
                  pathname === link.href
                    ? 'text-[#e8c872] border-b border-[#e8c872] pb-1 font-semibold'
                    : 'hover:text-[#fbf5e6]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Centered Brand Wordmark */}
          <div className="flex flex-col items-center justify-center text-center py-1">
            <Link href="/" className="group flex flex-col items-center">
              <span className="font-signature text-3xl sm:text-4xl font-normal text-[#fbf5e6] group-hover:text-[#e8c872] transition-colors tracking-wide drop-shadow-[0_0_25px_rgba(232,200,114,0.45)]">
                niharikartist
              </span>
              <span className="text-[9px] tracking-[0.48em] uppercase text-[#a3b8af] font-sans font-medium mt-[-4px]">
                fine art atelier
              </span>
            </Link>
          </div>

          {/* Desktop Right Nav Links & Actions */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.22em] font-medium text-zinc-300">
              {rightNavLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-all duration-300 hover:text-[#e8c872] hover:tracking-[0.26em] ${
                    pathname === link.href
                      ? 'text-[#e8c872] border-b border-[#e8c872] pb-1 font-semibold'
                      : 'hover:text-[#fbf5e6]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 text-zinc-300 hover:text-[#e8c872] transition-colors btn-magnetic"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e8c872] text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-zinc-300 hover:text-[#e8c872] transition-colors btn-magnetic flex items-center"
              aria-label="Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e8c872] text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#081a12] border-b border-emerald-900/60 px-6 py-6 space-y-4">
            <div className="space-y-3">
              {allNavLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-widest text-zinc-300 hover:text-[#e8c872] py-2 border-b border-emerald-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

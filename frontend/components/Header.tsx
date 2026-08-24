'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, Sparkles, User, LogOut, ChevronDown, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSiteContent } from '../hooks/useSiteContent';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { toggleCart, totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isGuest, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { c } = useSiteContent('nav');

  const leftNavLinks = [
    { label: c('link_artist',  'The Artist'), href: '/about' },
    { label: c('link_gallery', 'Gallery'),    href: '/gallery' },
    { label: c('link_store',   'Store'),      href: '/shop' },
  ];

  const rightNavLinks = [
    { label: c('link_journal',      'Journal'),      href: '/community' },
    { label: c('link_commissions',  'Commissions'),  href: '/contact' },
    { label: c('link_order_status', 'Order Status'), href: '/track-order' },
  ];

  const allNavLinks = [...leftNavLinks, ...rightNavLinks];

  return (
    <>
      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {/* Announcement Ribbon */}
      <div className="bg-gradient-to-r from-[#081b13] via-[#102d21] to-[#081b13] border-b border-[#e8c872]/25 py-2 px-4 text-center text-[11px] sm:text-xs tracking-widest text-[#fbf5e6] flex items-center justify-center gap-3 font-sans">
        <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
        <span>{c('announcement_ribbon', 'Original Fine Art Heirlooms • Complimentary Wax-Sealed Calligraphy Scroll Included')}</span>
        <Sparkles className="w-3.5 h-3.5 text-[#e8c872] animate-pulse" />
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050f0b]/95 backdrop-blur-2xl border-b border-white/[0.08] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-zinc-300 hover:text-[#e8c872] transition-colors" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.22em] font-medium text-zinc-300">
            {leftNavLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`transition-all duration-300 hover:text-[#e8c872] hover:tracking-[0.26em] ${pathname === link.href ? 'text-[#e8c872] border-b border-[#e8c872] pb-1 font-semibold' : 'hover:text-[#fbf5e6]'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Brand Wordmark */}
          <div className="flex flex-col items-center justify-center text-center py-1">
            <Link href="/" className="group flex flex-col items-center">
              <img
                src="/logo.png"
                alt="niharikartist"
                className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(232,200,114,0.35)] group-hover:drop-shadow-[0_0_20px_rgba(232,200,114,0.55)] transition-all duration-300"
              />
            </Link>
          </div>

          {/* Desktop Right Nav & Actions */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-[0.22em] font-medium text-zinc-300">
              {rightNavLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className={`transition-all duration-300 hover:text-[#e8c872] hover:tracking-[0.26em] ${pathname === link.href ? 'text-[#e8c872] border-b border-[#e8c872] pb-1 font-semibold' : 'hover:text-[#fbf5e6]'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/wishlist" className="relative p-2 text-zinc-300 hover:text-[#e8c872] transition-colors btn-magnetic" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e8c872] text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">{wishlistCount}</span>
              )}
            </Link>

            <button onClick={toggleCart} className="relative p-2 text-zinc-300 hover:text-[#e8c872] transition-colors btn-magnetic flex items-center" aria-label="Bag">
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e8c872] text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">{totalItemsCount}</span>
              )}
            </button>

            {/* Account */}
            {isGuest ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="p-2 text-zinc-300 hover:text-[#e8c872] transition-colors btn-magnetic"
                aria-label="Sign in"
                title="Sign in"
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#0a2319] border border-emerald-900/60 hover:border-[#e8c872]/50 text-[#a3b8af] hover:text-[#e8c872] transition-all"
                  aria-label="Account menu"
                >
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center">
                    <span className="text-[#d4af37] text-[10px] font-bold leading-none">
                      {user!.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#081a13] border border-[#e8c872]/30 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-zinc-100 text-xs font-semibold truncate">{user!.firstName} {user!.lastName}</p>
                      <p className="text-zinc-500 text-[10px] truncate">{user!.email}</p>
                    </div>
                    <Link
                      href="/track-order"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-[#e8c872] transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      My Orders
                    </Link>
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-red-400 transition-colors border-t border-zinc-800/60"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#081a12] border-b border-emerald-900/60 px-6 py-6 space-y-4">
            <div className="space-y-3">
              {allNavLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-widest text-zinc-300 hover:text-[#e8c872] py-2 border-b border-emerald-950">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-emerald-950">
              {isGuest ? (
                <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm text-[#d4af37] hover:text-[#f3e5ab] py-2">
                  <User className="w-4 h-4" /> Sign In / Register
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400">Signed in as <span className="text-zinc-200">{user!.firstName}</span></p>
                  <Link href="/track-order" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-zinc-300 hover:text-[#e8c872] py-1.5">
                    <Package className="w-4 h-4 text-[#d4af37]" /> My Orders
                  </Link>
                  <button onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 py-1">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

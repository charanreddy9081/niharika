'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Saved Artworks</span>
          <h1 className="font-editorial text-4xl text-zinc-100 font-light">My Wishlist ({wishlistCount})</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950/40 rounded-2xl border border-zinc-800 p-8 space-y-4 max-w-lg mx-auto">
            <Heart className="w-16 h-16 text-zinc-700 mx-auto stroke-1" />
            <h3 className="font-editorial text-2xl text-zinc-300">Your wishlist is empty</h3>
            <p className="text-xs text-zinc-500">Browse the studio shop and tap the heart icon on any artwork to save it for later.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49f2e] text-black font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all mt-2"
            >
              <span>Explore Artworks</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(product => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
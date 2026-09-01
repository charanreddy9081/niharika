'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Sparkles, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id?: string;
    id?: number;
    name: string;
    slug: string;
    price: number;
    regular_price?: number;
    images: string[];
    categories?: string[];
    short_description?: string;
    rating?: number;
    reviews_count?: number;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.slug);
  const primaryImage = product.images?.[0] || '/images/product_8_1.jpg';
  const categoryName = product.categories?.[0] || 'Rakhi Frames';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success('Added "' + product.name + '" to your bag!');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (isFavorited) {
      toast('Removed from wishlist', { icon: '💔' });
    } else {
      toast.success('Saved to wishlist!', { icon: '❤️' });
    }
  };

  return (
    <div className="group relative bg-[#0b1a13]/90 border border-[#e8c872]/20 hover:border-[#e8c872]/60 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.65)] flex flex-col product-card-wrapper">
      {/* Image Showcase */}
      <Link href={'/product/' + product.slug} className="relative block w-full aspect-square overflow-hidden bg-[#06120d]">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        
        {/* Subtle Ambient Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06120d] via-transparent to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

        {/* Floating Category Pill */}
        <span className="absolute top-3.5 left-3.5 bg-[#06120d]/85 backdrop-blur-md border border-[#e8c872]/30 text-[#fbf5e6] text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-medium">
          {categoryName}
        </span>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-[#06120d]/85 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-300 hover:text-red-400 transition-all hover:scale-110 shadow-lg"
          aria-label="Save to Wishlist"
        >
          <Heart className={'w-4 h-4 ' + (isFavorited ? 'fill-red-500 text-red-500' : '')} />
        </button>

        {/* Quick Actions Hover Drawer */}
        <div className="absolute bottom-3.5 inset-x-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-[#A94F6B] backdrop-blur-md border border-[#D98FA6]/40 flex items-center justify-center text-white hover:bg-[#7B2D45] transition-colors">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Artwork Narrative & Pricing */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 product-card-body">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2 text-xs text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-300" />
            <span className="text-zinc-200 text-[11px] font-semibold product-card-rating">{product.rating || 4.9}</span>
            <span className="text-[#a3b8af] text-[10px]">({product.reviews_count || 12} Collector Reviews)</span>
          </div>

          {/* Title */}
          <Link href={'/product/' + product.slug}>
            <h3 className="font-display text-lg text-zinc-100 group-hover:text-[#fbf5e6] transition-colors line-clamp-1 font-medium product-card-name">
              {product.name}
            </h3>
          </Link>

          {/* Story Snippet / Price Note */}
          {product.short_description && (
            <p className="text-[11px] text-[#e8c872]/80 italic line-clamp-1 mt-1.5 leading-relaxed font-sans product-card-desc">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & Craftsmanship Tag */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#fbf5e6] product-card-price">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.regular_price && product.regular_price > product.price && (
              <span className="text-xs text-zinc-500 line-through">
                ₹{product.regular_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700/50">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Handpainted</span>
          </span>
        </div>
      </div>
    </div>
  );
};
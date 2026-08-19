'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { ProductCard } from '../../../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, Sparkles, ChevronRight, Palette, Layers, Maximize } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Standard Size');
  const [customNote, setCustomNote] = useState('');
  const [activeTab, setActiveTab] = useState<'story' | 'specs' | 'care' | 'shipping'>('story');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch('http://localhost:5000/api/products/' + slug)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setProduct(data.data);
          setSelectedImage(data.data.images?.[0] || '');
          if (data.data.size) setSelectedSize(data.data.size);
        }
      })
      .catch(err => console.error('Error loading product:', err))
      .finally(() => setLoading(false));

    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRelated(data.data.filter((p: any) => p.slug !== slug).slice(0, 4));
        }
      })
      .catch(err => console.error('Error loading related:', err));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050f0b]">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <Sparkles className="w-8 h-8 text-[#e8c872] animate-spin mx-auto" />
            <p className="font-display text-lg text-zinc-300">Unwrapping handcrafted artwork...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050f0b]">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24 text-center px-4">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-zinc-200">Artwork Not Found</h2>
            <p className="text-xs text-zinc-400">The artwork you are searching for might have been archived or moved.</p>
            <Link href="/shop" className="inline-block bg-[#e8c872] text-black px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider btn-magnetic">
              Return to Store
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isFavorited = isInWishlist(product.slug);
  const categoryName = product.category || product.categories?.[0] || 'Original Artwork';

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, customNote);
    toast.success('Added "' + product.name + '" to your studio bag!');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, customNote);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050f0b] text-[#fbf5e6] font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-[#a3b8af] uppercase tracking-wider mb-8 font-sans">
          <Link href="/" className="hover:text-[#e8c872] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-emerald-800" />
          <Link href="/shop" className="hover:text-[#e8c872] transition-colors">Store</Link>
          <ChevronRight className="w-3 h-3 text-emerald-800" />
          <span className="text-zinc-200 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Image Showcase */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-[#0a2319] border border-[#e8c872]/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
              <Image
                src={selectedImage || product.images?.[0] || '/images/shop/shop_1.jpg'}
                alt={product.name}
                fill
                priority
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050f0b]/70 via-transparent to-transparent pointer-events-none" />

              {/* Wishlist Floating Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 p-3 rounded-full bg-[#050f0b]/80 backdrop-blur-md border border-white/10 hover:border-[#e8c872] transition-colors text-white hover:text-[#e8c872] shadow-xl"
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Carousel if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border transition-all flex-shrink-0 ${
                      selectedImage === img
                        ? 'border-[#e8c872] scale-105 shadow-[0_0_15px_rgba(232,200,114,0.4)]'
                        : 'border-emerald-900/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Narrative & Ordering */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#e8c872] font-semibold block">
                {categoryName}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl text-zinc-100 font-light leading-tight">
                {product.name}
              </h1>

              {/* Review & Rating */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-amber-300 gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  ))}
                </div>
                <span className="text-xs text-[#a3b8af] font-sans">
                  {product.rating || 5.0} ({product.reviews_count || 24} patron reviews)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#0a2319]/80 border border-emerald-900/80 rounded-2xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl sm:text-4xl text-[#fbf5e6]">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                  {product.regular_price > product.price && (
                    <span className="text-sm text-zinc-500 line-through">
                      ₹{product.regular_price?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 block mt-1 font-sans">
                  • Complimentary Pan-India Insured Dispatch Included
                </span>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#050f0b] border border-emerald-800 text-[#e8c872] text-[10px] uppercase tracking-wider font-semibold">
                {product.artwork_type || 'Original Artwork'}
              </span>
            </div>

            {/* Specifications Snapshot */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0a2319]/50 border border-emerald-950 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-[#a3b8af] block flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-[#e8c872]" /> Medium
                </span>
                <strong className="text-white block font-medium line-clamp-1">{product.medium || 'Mixed Media'}</strong>
              </div>
              <div className="bg-[#0a2319]/50 border border-emerald-950 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-[#a3b8af] block flex items-center gap-1.5">
                  <Maximize className="w-3 h-3 text-[#e8c872]" /> Dimensions
                </span>
                <strong className="text-white block font-medium line-clamp-1">{product.size || 'Standard Size'}</strong>
              </div>
            </div>

            {/* Wax-Sealed Personalized Calligraphy Scroll Box */}
            <div className="bg-[#071b12] border border-[#e8c872]/30 rounded-2xl p-5 space-y-2 shadow-xl">
              <div className="flex items-center gap-2 text-xs text-[#e8c872] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Complimentary Wax-Sealed Note</span>
              </div>
              <p className="text-[11px] text-[#a3b8af] leading-relaxed">
                Add an intimate message or name. We will pen it with a calligraphy fountain pen on vintage parchment, sealed with authentic gold wax.
              </p>
              <textarea
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="e.g. For Aarav — to remind you that distance can never fade our childhood bond..."
                rows={2}
                className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-xs text-[#fbf5e6] placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] resize-none"
              />
            </div>

            {/* Quantity and Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-emerald-900 bg-[#0a2319] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-3 text-zinc-300 hover:text-[#e8c872] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-3 text-zinc-300 hover:text-[#e8c872] transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#0a2319] hover:bg-[#123627] border border-[#e8c872]/60 text-[#fbf5e6] hover:text-[#e8c872] font-semibold py-3.5 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all btn-magnetic flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Bag</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 text-black font-semibold py-4 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_25px_rgba(232,200,114,0.4)] btn-magnetic flex items-center justify-center gap-2"
              >
                <span>Acquire Masterwork (Instant Checkout)</span>
              </button>
            </div>

            {/* Atelier Value Badges */}
            <div className="pt-4 border-t border-emerald-950 grid grid-cols-2 gap-4 text-xs text-[#a3b8af]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#e8c872]" />
                <span>Archival 100-Year Life Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#e8c872]" />
                <span>Shockproof Air Courier Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Narrative & Specifications */}
        <div className="mt-20 border-t border-emerald-950 pt-12 space-y-6">
          <div className="flex items-center justify-center gap-4 border-b border-emerald-950 pb-4">
            {[
              { id: 'story', label: 'Artwork Chronicle' },
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'care', label: 'Archival Care' },
              { id: 'shipping', label: 'Dispatch & Packaging' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#e8c872] text-black shadow-[0_0_15px_rgba(232,200,114,0.3)]'
                    : 'text-[#a3b8af] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto py-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans space-y-4">
            {activeTab === 'story' && (
              <div className="space-y-4 whitespace-pre-line bg-[#0a2319]/50 border border-emerald-900/60 p-8 rounded-3xl shadow-xl">
                <h3 className="font-display text-2xl text-zinc-100">The Story Behind the Masterwork</h3>
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-[#0a2319]/50 border border-emerald-900/60 p-8 rounded-3xl shadow-xl space-y-3">
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-emerald-950">
                  <span className="text-[#a3b8af]">Medium:</span>
                  <strong className="text-white">{product.medium}</strong>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-emerald-950">
                  <span className="text-[#a3b8af]">Artwork Type:</span>
                  <strong className="text-white">{product.artwork_type}</strong>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-emerald-950">
                  <span className="text-[#a3b8af]">Dimensions / Size:</span>
                  <strong className="text-white">{product.size}</strong>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-emerald-950">
                  <span className="text-[#a3b8af]">Surface / Paper:</span>
                  <strong className="text-white">{product.surface}</strong>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2">
                  <span className="text-[#a3b8af]">Authenticity:</span>
                  <strong className="text-[#e8c872]">Hand-signed by artist Niharika</strong>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="bg-[#0a2319]/50 border border-emerald-900/60 p-8 rounded-3xl shadow-xl space-y-3">
                <h4 className="font-display text-lg text-white">Preservation Guidelines</h4>
                <p>• Avoid direct, prolonged sunlight exposure to maintain archival colour vibrance.</p>
                <p>• Dust gently with a soft microfibre cloth. Do not use chemical solvents or water on the surface.</p>
                <p>• Display in humidity-controlled interior spaces.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="bg-[#0a2319]/50 border border-emerald-900/60 p-8 rounded-3xl shadow-xl space-y-3">
                <h4 className="font-display text-lg text-white">Secure Atelier Dispatch</h4>
                <p>• Each piece is insulated in multi-layered moisture-barrier bubblewrap, shockproof honeycomb corner protectors, and solid corrugated shipping casing.</p>
                <p>• Pan-India express air courier dispatch within 48 to 72 hours of studio inspection.</p>
                <p>• Live SMS and Email tracking provided from dispatch to doorstep handover.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Works Grid */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-emerald-950 pt-16">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-[#e8c872] font-semibold block mb-1">Companion Pieces</span>
              <h2 className="font-display text-3xl text-zinc-100 font-light">You May Also Cherish</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(relProduct => (
                <ProductCard key={relProduct._id || relProduct.slug} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

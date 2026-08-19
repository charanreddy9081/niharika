'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlist: any[];
  toggleWishlist: (product: any) => void;
  isInWishlist: (slug: string) => boolean;
  removeFromWishlist: (slug: string) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nha_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nha_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const toggleWishlist = (product: any) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.slug === product.slug);
      if (exists) {
        return prev.filter(item => item.slug !== product.slug);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (slug: string) => {
    return wishlist.some(item => item.slug === slug);
  };

  const removeFromWishlist = (slug: string) => {
    setWishlist(prev => prev.filter(item => item.slug !== slug));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  selected_size?: string;
  custom_note?: string;
}

export type ShippingMethod = 'speedPost' | 'registeredParcel' | null;

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number, size?: string, customNote?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  subtotal: number;
  shippingFee: number;
  shippingMethod: ShippingMethod;
  shippingZone: string | null;
  shippingZoneLabel: string | null;
  setShipping: (method: ShippingMethod, fee: number, zone: string, zoneLabel: string) => void;
  clearShipping: () => void;
  discount: number;
  discountCode: string;
  applyCoupon: (code: string) => boolean;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Shipping state — set from checkout when pincode is entered
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(null);
  const [shippingZone, setShippingZone] = useState<string | null>(null);
  const [shippingZoneLabel, setShippingZoneLabel] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nha_cart');
      if (savedCart) setItems(JSON.parse(savedCart));
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nha_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items]);

  const addToCart = (product: any, quantity = 1, size = 'Standard Frame (6x6 in)', customNote = '') => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.product_id === (product._id || product.slug) &&
          item.selected_size === size &&
          item.custom_note === customNote
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, {
        id: (product._id || product.slug) + '_' + Date.now(),
        product_id: product._id || product.slug,
        name: product.name,
        slug: product.slug,
        price: product.price,
        quantity,
        image: product.images?.[0] || '/images/product_8_1.jpg',
        selected_size: size,
        custom_note: customNote,
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setItems(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
    setDiscountPercent(0);
    setShippingFee(0);
    setShippingMethod(null);
    setShippingZone(null);
    setShippingZoneLabel(null);
  };

  const setShipping = (method: ShippingMethod, fee: number, zone: string, zoneLabel: string) => {
    setShippingMethod(method);
    setShippingFee(fee);
    setShippingZone(zone);
    setShippingZoneLabel(zoneLabel);
  };

  const clearShipping = () => {
    setShippingMethod(null);
    setShippingFee(0);
    setShippingZone(null);
    setShippingZoneLabel(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (['LOVEART10', 'STUDIO10', 'VIP10'].includes(clean)) {
      setDiscountCode(clean); setDiscountPercent(10); return true;
    }
    if (clean === 'FIRSTGIFT') {
      setDiscountCode(clean); setDiscountPercent(15); return true;
    }
    return false;
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  // No free shipping — always charge selected shipping fee
  const total = Math.max(0, subtotal - discount + shippingFee);
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart, removeFromCart, updateQuantity, clearCart,
      isCartOpen, openCart, closeCart, toggleCart,
      subtotal,
      shippingFee,
      shippingMethod,
      shippingZone,
      shippingZoneLabel,
      setShipping,
      clearShipping,
      discount,
      discountCode,
      applyCoupon,
      total,
      totalItemsCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

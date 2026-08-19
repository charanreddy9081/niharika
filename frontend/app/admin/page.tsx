'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare, Images,
  Plus, Trash2, Sparkles, RefreshCw, Eye, LogOut, Lock, Mail,
  ShieldCheck, AlertCircle, TrendingUp, Search, Star, DownloadCloud,
  KeyRound, X, CheckCircle2, EyeOff, ImageIcon, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminArtistImages from '../../components/admin/AdminArtistImages';
import AdminSiteContent from '../../components/admin/AdminSiteContent';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  const [loginEmail, setLoginEmail] = useState('niharikaananthoja@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Login screen mode: 'login' | 'forgot' ────────────────────────────
  const [loginMode, setLoginMode] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // ── Change Password modal (inside dashboard) ──────────────────────────
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [cpForm, setCpForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [cpLoading, setCpLoading] = useState(false);
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpShowConfirm, setCpShowConfirm] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'products' | 'orders' | 'inquiries' | 'artist_images' | 'content'>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [artistImages, setArtistImages] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Gallery search & modal state
  const [gallerySearch, setGallerySearch] = useState('');
  const [isAddGalleryModalOpen, setIsAddGalleryModalOpen] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: '',
    category: 'Painting',
    imageUrl: '/images/gallery/gallery_1.jpg',
    year: '2025',
    description: '',
    isFeatured: false
  });

  // Product search & modal state
  const [productSearch, setProductSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 699,
    regular_price: 999,
    category: 'Original Masterworks',
    medium: 'Mixed Media Archival Glazes',
    size: 'A5',
    artwork_type: 'Original Artwork',
    image: '/images/shop/shop_1.jpg',
    short_description: '',
    description: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      setAuthChecking(false);
      return;
    }

    fetch(API + '/api/admin/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.admin) {
          setIsAuthenticated(true);
          setAdminUser(data.admin);
          fetchAdminData(token);
        } else {
          localStorage.removeItem('niharikartist_admin_token');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        localStorage.removeItem('niharikartist_admin_token');
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const fetchAdminData = async (tokenOverride?: string) => {
    const token = tokenOverride || localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    setDataLoading(true);
    const headers = { 'Authorization': 'Bearer ' + token };

    try {
      const [pRes, gRes, oRes, iRes] = await Promise.all([
        fetch(API + '/api/admin/products', { headers }).then(r => r.json()),
        fetch(API + '/api/admin/gallery', { headers }).then(r => r.json()),
        fetch(API + '/api/admin/orders', { headers }).then(r => r.json()),
        fetch(API + '/api/admin/inquiries', { headers }).then(r => r.json())
      ]);

      if (pRes.success) setProducts(pRes.data);
      if (gRes.success) setGallery(gRes.data);
      if (oRes.success) setOrders(oRes.data);
      if (iRes.success) setInquiries(iRes.data);

      // Fetch artist images
      const aiRes = await fetch(API + '/api/admin/artist-images', { headers }).then(r => r.json());
      if (aiRes.success) setArtistImages(aiRes.data);
    } catch (e) {
      console.error('Error fetching admin data:', e);
      toast.error('Failed to refresh studio data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(API + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('niharikartist_admin_token', data.token);
        setAdminUser(data.admin);
        setIsAuthenticated(true);
        toast.success('Welcome to Admin Studio, ' + (data.admin.name || 'Administrator'));
        fetchAdminData(data.token);
      } else {
        setLoginError(data.message || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      setLoginError('Connection error: could not reach authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('niharikartist_admin_token');
    if (token) {
      try {
        await fetch(API + '/api/admin/logout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
      } catch (e) {}
    }

    localStorage.removeItem('niharikartist_admin_token');
    setIsAuthenticated(false);
    setAdminUser(null);
    setLoginPassword('');
    toast.success('Administrator logged out successfully');
  };

  // ── Forgot Password ───────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { toast.error('Please enter your email address.'); return; }
    setForgotLoading(true);
    try {
      const res = await fetch(API + '/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setForgotSent(true);
      } else {
        toast.error(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Could not connect to the server. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Change Password (logged-in admin) ─────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpForm.currentPassword || !cpForm.newPassword || !cpForm.confirmPassword) {
      toast.error('Please fill in all fields.'); return;
    }
    if (cpForm.newPassword !== cpForm.confirmPassword) {
      toast.error('New password and confirmation do not match.'); return;
    }
    if (cpForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.'); return;
    }
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;
    setCpLoading(true);
    try {
      const res = await fetch(API + '/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(cpForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password updated successfully!');
        setIsChangePasswordOpen(false);
        setCpForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to update password.');
      }
    } catch {
      toast.error('Could not connect to the server. Please try again.');
    } finally {
      setCpLoading(false);
    }
  };

  // Reusable Sync Shop Products Handler
  const handleSyncShopProducts = async () => {
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    setSyncLoading(true);
    try {
      const res = await fetch(API + '/api/admin/products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `Shop synchronized! Discovered ${data.stats.totalDiscovered}, Created ${data.stats.created}, Updated ${data.stats.updated}, Skipped ${data.stats.skipped}`
        );
        fetchAdminData();
      } else {
        toast.error(data.message || 'Failed to synchronize shop products');
      }
    } catch (err) {
      toast.error('Network error during shop synchronization');
    } finally {
      setSyncLoading(false);
    }
  };

  // Gallery CRUD Handlers
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    try {
      const res = await fetch(API + '/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(newGalleryItem)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Gallery artwork created successfully!');
        setIsAddGalleryModalOpen(false);
        setNewGalleryItem({
          title: '',
          category: 'Painting',
          imageUrl: '/images/gallery/gallery_1.jpg',
          year: '2025',
          description: '',
          isFeatured: false
        });
        fetchAdminData();
      } else {
        toast.error(data.message || 'Failed to create gallery artwork');
      }
    } catch (err) {
      toast.error('Error adding gallery artwork');
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery artwork?')) return;
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    try {
      const res = await fetch(API + '/api/admin/gallery/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Artwork deleted from gallery');
        fetchAdminData();
      } else {
        toast.error(data.message || 'Failed to delete artwork');
      }
    } catch (err) {
      toast.error('Failed to remove artwork');
    }
  };

  const handleToggleFeatured = async (item: any) => {
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    try {
      const res = await fetch(API + '/api/admin/gallery/' + (item._id || item.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ isFeatured: !item.isFeatured })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(item.isFeatured ? 'Removed from featured' : 'Marked as featured');
        fetchAdminData();
      }
    } catch (e) {
      toast.error('Failed to update featured status');
    }
  };

  // Product Handlers
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    try {
      const res = await fetch(API + '/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          regular_price: Number(newProduct.regular_price),
          category: newProduct.category,
          categories: [newProduct.category, newProduct.artwork_type],
          medium: newProduct.medium,
          size: newProduct.size,
          artwork_type: newProduct.artwork_type,
          images: [newProduct.image],
          gallery: [newProduct.image],
          short_description: newProduct.short_description,
          description: newProduct.description
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Masterwork added to catalog!');
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          price: 699,
          regular_price: 999,
          category: 'Original Masterworks',
          medium: 'Mixed Media Archival Glazes',
          size: 'A5',
          artwork_type: 'Original Artwork',
          image: '/images/shop/shop_1.jpg',
          short_description: '',
          description: ''
        });
        fetchAdminData();
      } else {
        toast.error(data.message || 'Failed to add artwork');
      }
    } catch (err) {
      toast.error('Error creating product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork from the catalog?')) return;
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    try {
      const res = await fetch(API + '/api/admin/products/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Artwork deleted from catalog');
        fetchAdminData();
      } else {
        toast.error(data.message || 'Failed to delete artwork');
      }
    } catch (err) {
      toast.error('Failed to remove artwork');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('niharikartist_admin_token');
    if (!token) return;

    try {
      const res = await fetch(API + '/api/admin/orders/' + id + '/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order status updated: ' + status);
        fetchAdminData();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#050f0b] flex flex-col items-center justify-center font-sans">
        <Sparkles className="w-8 h-8 text-[#e8c872] animate-spin mb-4" />
        <span className="text-xs uppercase tracking-[0.3em] text-[#fbf5e6]">Verifying Studio Credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050f0b] flex flex-col justify-between items-center px-4 py-12 relative overflow-hidden font-sans">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[25%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#e8c872]/15 via-emerald-900/10 to-transparent blur-3xl" />
          <div className="absolute bottom-[-15%] right-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-[#0b3323]/30 via-transparent to-transparent blur-3xl" />
        </div>

        <header className="relative z-10 text-center">
          <span className="font-signature text-4xl sm:text-5xl text-[#fbf5e6] drop-shadow-[0_0_25px_rgba(232,200,114,0.45)]">
            niharikartist
          </span>
          <span className="block text-[10px] tracking-[0.45em] uppercase text-[#a3b8af] mt-1">
            haute art atelier • private portal
          </span>
        </header>

        <main className="relative z-10 w-full max-w-md my-auto">
          <div className="bg-[#0a2319]/90 border border-[#e8c872]/30 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-6">

            {/* ── LOGIN FORM ──────────────────────────────────────── */}
            {loginMode === 'login' && (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#050f0b] border border-[#e8c872]/40 flex items-center justify-center mx-auto text-[#e8c872] shadow-inner">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl text-zinc-100 font-light">Admin Studio</h1>
                  <p className="text-xs text-[#a3b8af]">Enter your administrator credentials to access the studio console.</p>
                </div>

                {loginError && (
                  <div className="bg-red-950/70 border border-red-800/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5 font-medium">Administrator Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="admin@niharikartist.com"
                        className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5 font-medium">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#e8c872] transition-colors"
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 text-black font-semibold py-3.5 rounded-xl uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(232,200,114,0.35)] btn-magnetic flex items-center justify-center gap-2 mt-2"
                  >
                    {loginLoading ? (
                      <><Sparkles className="w-4 h-4 animate-spin text-black" /><span>Authenticating...</span></>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /><span>Access Studio Console</span></>
                    )}
                  </button>
                </form>

                <div className="pt-3 border-t border-emerald-950 text-center">
                  <button
                    onClick={() => { setLoginMode('forgot'); setForgotSent(false); setForgotEmail(loginEmail); }}
                    className="text-[11px] text-[#a3b8af] hover:text-[#e8c872] transition-colors uppercase tracking-wider"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}

            {/* ── FORGOT PASSWORD FORM ────────────────────────────── */}
            {loginMode === 'forgot' && (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#050f0b] border border-[#e8c872]/40 flex items-center justify-center mx-auto text-[#e8c872] shadow-inner">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h1 className="font-display text-2xl text-zinc-100 font-light">Forgot Password</h1>
                  <p className="text-xs text-[#a3b8af]">Enter your admin email and we&apos;ll send a secure reset link.</p>
                </div>

                {forgotSent ? (
                  <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-xl p-5 flex flex-col items-center gap-3 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <p className="text-sm text-emerald-200 font-medium">Reset link sent!</p>
                    <p className="text-xs text-[#a3b8af]">
                      If <strong className="text-zinc-200">{forgotEmail}</strong> is registered, a reset link has been sent. Check your inbox (and spam folder).
                    </p>
                    <button
                      onClick={() => { setLoginMode('login'); setForgotSent(false); }}
                      className="mt-2 text-xs text-[#e8c872] hover:underline uppercase tracking-wider"
                    >
                      ← Back to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5 font-medium">Admin Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="admin@niharikartist.com"
                          className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 text-black font-semibold py-3.5 rounded-xl uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(232,200,114,0.35)] btn-magnetic flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <><Sparkles className="w-4 h-4 animate-spin text-black" /><span>Sending...</span></>
                      ) : (
                        <><Mail className="w-4 h-4" /><span>Send Reset Link</span></>
                      )}
                    </button>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setLoginMode('login')}
                        className="text-[11px] text-[#a3b8af] hover:text-[#e8c872] transition-colors uppercase tracking-wider"
                      >
                        ← Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

          </div>
        </main>

        <footer className="relative z-10 text-[10px] text-[#627a70] uppercase tracking-widest font-sans">
          &copy; 2026 niharikartist fine art atelier • private administration
        </footer>
      </div>
    );
  }

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const filteredGallery = gallery.filter(g =>
    !gallerySearch ||
    g.title?.toLowerCase().includes(gallerySearch.toLowerCase()) ||
    g.category?.toLowerCase().includes(gallerySearch.toLowerCase())
  );
  const filteredProducts = products.filter(p =>
    !productSearch ||
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.medium?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050f0b] text-[#fbf8f1] flex flex-col font-sans">
      {/* Standalone Admin Studio Header */}
      <header className="sticky top-0 z-40 bg-[#071710]/95 backdrop-blur-2xl border-b border-[#e8c872]/20 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex flex-col">
              <span className="font-signature text-2xl text-[#fbf5e6] tracking-wide">
                niharikartist
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-[#e8c872] font-semibold mt-[-3px]">
                admin studio console
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#0a2319] border border-emerald-800/60 text-[10px] uppercase tracking-widest text-[#a3b8af]">
              Live v2.6
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-xs">
            <button
              onClick={() => fetchAdminData()}
              disabled={dataLoading}
              className="p-2 bg-[#0a2319] border border-emerald-900 hover:border-[#e8c872]/50 rounded-lg text-[#a3b8af] hover:text-white transition-colors"
              title="Refresh Studio Data"
            >
              <RefreshCw className={"w-4 h-4 " + (dataLoading ? "animate-spin text-[#e8c872]" : "")} />
            </button>

            <Link
              href="/shop"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#0a2319] border border-emerald-800/80 hover:border-[#e8c872]/60 px-3.5 py-1.5 rounded-lg text-[#fbf5e6] text-[11px] uppercase tracking-wider transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#e8c872]" />
              <span>Public Store</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-emerald-900/80">
              <div className="w-7 h-7 rounded-full bg-[#e8c872] text-black font-bold flex items-center justify-center text-xs">
                {(adminUser?.name || 'A')[0]}
              </div>
              <div className="text-left">
                <span className="text-xs text-white font-medium block leading-tight">{adminUser?.name || 'Administrator'}</span>
                <span className="text-[10px] text-[#a3b8af] block">{adminUser?.email}</span>
              </div>
            </div>

            <button
              onClick={() => { setIsChangePasswordOpen(true); setCpForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
              className="hidden sm:flex items-center gap-1.5 bg-[#0a2319] border border-emerald-800/80 hover:border-[#e8c872]/60 px-3.5 py-1.5 rounded-lg text-[#a3b8af] hover:text-[#e8c872] text-[11px] uppercase tracking-wider transition-colors btn-magnetic"
              title="Change Admin Password"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-950/70 hover:bg-red-900/90 border border-red-800/60 text-red-200 px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors btn-magnetic"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-emerald-950 pb-4 overflow-x-auto mb-8">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Shop Inventory (' + products.length + ')', icon: Package },
            { id: 'gallery', label: 'Gallery Artworks (' + gallery.length + ')', icon: Images },
            { id: 'orders', label: 'Orders & Heirlooms (' + orders.length + ')', icon: ShoppingCart },
            { id: 'inquiries', label: 'Commissions (' + inquiries.length + ')', icon: MessageSquare },
            { id: 'artist_images', label: 'Artist Images (' + artistImages.length + ')', icon: ImageIcon },
            { id: 'content', label: 'Website Content', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all " + (
                  isActive
                    ? "bg-gradient-to-r from-[#e8c872] to-[#d4b055] text-black font-semibold shadow-[0_0_15px_rgba(232,200,114,0.3)]"
                    : "bg-[#0a2319]/70 border border-emerald-900/60 text-[#a3b8af] hover:text-white hover:border-[#e8c872]/40"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-[#0a2319]/80 border border-[#e8c872]/25 p-6 rounded-3xl space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-[#e8c872]">
                  <span className="text-[11px] uppercase tracking-wider text-[#a3b8af] font-medium">Total Studio Revenue</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-display text-3xl text-[#fbf5e6]">₹{totalRevenue.toLocaleString('en-IN')}</h3>
                <span className="text-[10px] text-emerald-400 block font-sans">Across {orders.length} custom heirlooms</span>
              </div>

              <div className="bg-[#0a2319]/80 border border-[#e8c872]/25 p-6 rounded-3xl space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-[#e8c872]">
                  <span className="text-[11px] uppercase tracking-wider text-[#a3b8af] font-medium">Shop Inventory</span>
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-display text-3xl text-zinc-100">{products.length}</h3>
                <span className="text-[10px] text-[#a3b8af] block font-sans">Imported shop catalog</span>
              </div>

              <div className="bg-[#0a2319]/80 border border-[#e8c872]/25 p-6 rounded-3xl space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-[#e8c872]">
                  <span className="text-[11px] uppercase tracking-wider text-[#a3b8af] font-medium">Gallery Portfolio</span>
                  <Images className="w-4 h-4" />
                </div>
                <h3 className="font-display text-3xl text-zinc-100">{gallery.length}</h3>
                <span className="text-[10px] text-[#a3b8af] block font-sans">Exhibition pieces</span>
              </div>

              <div className="bg-[#0a2319]/80 border border-[#e8c872]/25 p-6 rounded-3xl space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-[#e8c872]">
                  <span className="text-[11px] uppercase tracking-wider text-[#a3b8af] font-medium">Total Orders</span>
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="font-display text-3xl text-zinc-100">{orders.length}</h3>
                <span className="text-[10px] text-[#a3b8af] block font-sans">In active studio queue</span>
              </div>
            </div>

            <div className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-zinc-100">Recent Studio Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-[#e8c872] uppercase tracking-wider hover:underline">
                  View All Orders &rarr;
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">No orders recorded in database yet.</p>
              ) : (
                <div className="divide-y divide-emerald-950 text-xs">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.order_id || o._id} className="py-3 flex items-center justify-between">
                      <div>
                        <strong className="text-[#fbf5e6] font-mono block">{o.order_id}</strong>
                        <span className="text-[#a3b8af]">{o.customer?.first_name} {o.customer?.last_name} ({o.customer?.email})</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-white block">₹{o.total?.toLocaleString('en-IN')}</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          {o.order_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SHOP PRODUCTS MANAGEMENT (WITH SYNC BUTTON) */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-zinc-100">Store Inventory ({products.length})</h3>
                <p className="text-xs text-[#a3b8af]">All 13 imported masterworks from niharikartist.shop/shop with pricing, mediums, and stock.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-40 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search shop products..."
                    className="w-full bg-[#0a2319] border border-emerald-900 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872]"
                  />
                </div>

                {/* Reusable Sync Shop Products Button */}
                <button
                  onClick={handleSyncShopProducts}
                  disabled={syncLoading}
                  className="bg-[#0a2319] hover:bg-[#123627] border border-[#e8c872]/60 text-[#fbf5e6] hover:text-[#e8c872] px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 btn-magnetic whitespace-nowrap shadow-lg"
                  title="Resync Product Inventory from live niharikartist.shop"
                >
                  <DownloadCloud className={"w-4 h-4 " + (syncLoading ? "animate-bounce text-[#e8c872]" : "text-[#e8c872]")} />
                  <span>{syncLoading ? 'Syncing...' : 'Sync Shop Products'}</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 btn-magnetic shadow-lg whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#050f0b] border-b border-emerald-950 text-[10px] uppercase tracking-widest text-[#a3b8af]">
                    <tr>
                      <th className="p-4">Artwork Details</th>
                      <th className="p-4">Medium / Specs</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/60">
                    {filteredProducts.map(p => (
                      <tr key={p._id || p.slug} className="hover:bg-[#0d2a1f]/50 transition-colors">
                        <td className="p-4 flex items-center gap-3.5">
                          <div className="relative w-14 h-14 bg-[#050f0b] rounded-xl overflow-hidden flex-shrink-0 border border-emerald-900/60">
                            <Image src={p.images?.[0] || '/images/shop/shop_1.jpg'} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <strong className="text-[#fbf5e6] block font-display text-sm">{p.name}</strong>
                            <span className="text-[#a3b8af] font-mono text-[10px]">slug: /{p.slug}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#a3b8af]">
                          <span className="block text-zinc-200">{p.medium || 'Acrylic on Canvas'}</span>
                          <span className="text-[10px] font-mono text-zinc-400">{p.size || 'A5'} • {p.artwork_type || 'Original Artwork'}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-[#050f0b] border border-emerald-900 text-[#e8c872] text-[10px] uppercase tracking-wider">
                            {p.category || 'Original Artwork'}
                          </span>
                        </td>
                        <td className="p-4 text-[#e8c872] font-semibold">
                          ₹{p.price?.toLocaleString('en-IN')} <span className="text-zinc-500 line-through text-[10px] font-normal">₹{p.regular_price}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px]">
                            {p.in_stock !== false ? 'In Stock (15)' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p._id || p.slug)}
                            className="text-red-400/80 hover:text-red-300 p-2 transition-colors"
                            title="Delete Artwork"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY PORTFOLIO */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-zinc-100">Gallery Portfolio Management ({gallery.length})</h3>
                <p className="text-xs text-[#a3b8af]">All 50 imported contemporary artworks, paintings, pencil portraits, and live wedding artworks.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gallerySearch}
                    onChange={e => setGallerySearch(e.target.value)}
                    placeholder="Search gallery..."
                    className="w-full bg-[#0a2319] border border-emerald-900 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872]"
                  />
                </div>

                <button
                  onClick={() => setIsAddGalleryModalOpen(true)}
                  className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 btn-magnetic shadow-lg whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Artwork</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#050f0b] border-b border-emerald-950 text-[10px] uppercase tracking-widest text-[#a3b8af]">
                    <tr>
                      <th className="p-4">Artwork</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Year</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/60">
                    {filteredGallery.map((item, idx) => (
                      <tr key={item._id || item.id || idx} className="hover:bg-[#0d2a1f]/50 transition-colors">
                        <td className="p-4 flex items-center gap-3.5">
                          <div className="relative w-12 h-16 bg-[#050f0b] rounded-lg overflow-hidden flex-shrink-0 border border-emerald-900/60">
                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                          </div>
                          <div>
                            <strong className="text-[#fbf5e6] block font-display text-sm">{item.title}</strong>
                            <span className="text-[#a3b8af] text-[10px] font-mono block line-clamp-1">{item.imageUrl}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-[#050f0b] border border-emerald-900 text-[#e8c872] text-[10px] uppercase tracking-wider">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-[#a3b8af] font-mono">{item.year || '2024'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleFeatured(item)}
                            className={"p-1.5 rounded-lg border transition-colors " + (
                              item.isFeatured
                                ? "bg-amber-950/60 border-amber-600/80 text-amber-300"
                                : "bg-[#050f0b] border-emerald-950 text-zinc-600 hover:text-zinc-300"
                            )}
                            title="Toggle Featured"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteGalleryItem(item._id || item.id)}
                            className="text-red-400/80 hover:text-red-300 p-2 transition-colors"
                            title="Delete Artwork"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-2xl text-zinc-100">Collector Orders ({orders.length})</h3>
              <p className="text-xs text-[#a3b8af]">Track orders, custom calligraphy notes, and update shipping progress.</p>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-[#0a2319]/50 border border-emerald-900/60 rounded-2xl text-xs text-zinc-500">
                  No orders have been received yet.
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id || order.order_id} className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-emerald-950">
                      <div>
                        <span className="text-[#e8c872] font-mono font-bold text-base block">{order.order_id}</span>
                        <span className="text-xs text-[#a3b8af]">
                          Collector: <strong className="text-white">{order.customer?.first_name} {order.customer?.last_name}</strong> • {order.customer?.phone} • {order.customer?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#a3b8af] uppercase tracking-wider font-mono">Stage:</span>
                        <select
                          value={order.order_status}
                          onChange={e => handleUpdateOrderStatus(order._id || order.order_id, e.target.value)}
                          className="bg-[#050f0b] border border-emerald-800 rounded-xl px-3 py-1.5 text-xs text-[#fbf5e6] focus:outline-none focus:border-[#e8c872]"
                        >
                          <option value="Ordered">Ordered (Received)</option>
                          <option value="Crafting in Studio">Crafting in Studio</option>
                          <option value="Dispatched">Dispatched (Air Courier)</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
                      <div>
                        <strong className="text-[#a3b8af] block uppercase text-[10px] tracking-wider mb-1">Acquired Masterworks:</strong>
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="py-1">
                            • {item.name} (x{item.quantity}) — ₹{item.price * item.quantity}
                            {item.custom_note && (
                              <span className="block text-amber-300/90 italic text-[11px] pl-3">
                                Handwritten Wax Scroll: &quot;{item.custom_note}&quot;
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div>
                        <strong className="text-[#a3b8af] block uppercase text-[10px] tracking-wider mb-1">Destination Address:</strong>
                        <p>{order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
                        <p className="text-zinc-400 mt-1">Airway Bill / Tracking: <span className="font-mono text-[#e8c872]">{order.tracking_number}</span></p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: INQUIRIES */}
        {activeTab === 'inquiries' && (          <div className="space-y-6">
            <div>
              <h3 className="font-display text-2xl text-zinc-100">Bespoke Commissions &amp; Studio Inquiries ({inquiries.length})</h3>
              <p className="text-xs text-[#a3b8af]">Direct messages from patrons inquiring about custom portraits and exhibition bookings.</p>
            </div>

            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="text-center py-12 bg-[#0a2319]/50 border border-emerald-900/60 rounded-2xl text-xs text-zinc-500">
                  No incoming commission inquiries.
                </div>
              ) : (
                inquiries.map((inq, idx) => (
                  <div key={idx} className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl p-6 space-y-3 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="font-display text-lg text-zinc-100 block">{inq.name}</strong>
                        <span className="text-xs text-[#e8c872]">{inq.email} {inq.phone ? '• ' + inq.phone : ''}</span>
                        {inq.subject && <span className="block text-xs text-zinc-400 mt-0.5">Subject: {inq.subject}</span>}
                      </div>
                      <span className="bg-[#050f0b] px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-[#a3b8af] border border-emerald-900/80">
                        {inq.inquiry_type || 'Commission'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 bg-[#050f0b]/70 p-4 rounded-2xl border border-emerald-950 leading-relaxed font-sans">
                      {inq.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: ARTIST IMAGES */}
        {activeTab === 'artist_images' && (
          <AdminArtistImages images={artistImages} onRefresh={fetchAdminData} />
        )}

        {/* TAB 7: WEBSITE CONTENT */}
        {activeTab === 'content' && (
          <AdminSiteContent />
        )}

        {/* Add Gallery Artwork Modal */}
        {isAddGalleryModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="font-display text-2xl text-zinc-100">Add Gallery Artwork</h3>
              <form onSubmit={handleAddGalleryItem} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#a3b8af] mb-1">Artwork Title *</label>
                  <input
                    type="text"
                    required
                    value={newGalleryItem.title}
                    onChange={e => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                    placeholder="e.g. Divine Melody"
                    className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Category *</label>
                    <select
                      value={newGalleryItem.category}
                      onChange={e => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    >
                      <option value="Painting">Painting</option>
                      <option value="Pencil Portraits">Pencil Portraits</option>
                      <option value="Caricature">Caricature</option>
                      <option value="Live Wedding Painting">Live Wedding Painting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Year</label>
                    <input
                      type="text"
                      value={newGalleryItem.year}
                      onChange={e => setNewGalleryItem({ ...newGalleryItem, year: e.target.value })}
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#a3b8af] mb-1">Image URL / Local Path *</label>
                  <input
                    type="text"
                    required
                    value={newGalleryItem.imageUrl}
                    onChange={e => setNewGalleryItem({ ...newGalleryItem, imageUrl: e.target.value })}
                    placeholder="/images/gallery/gallery_1.jpg"
                    className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                  />
                </div>
                <div>
                  <label className="block text-[#a3b8af] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newGalleryItem.description}
                    onChange={e => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                    placeholder="Medium details, story, or dimension notes..."
                    className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872] resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="feat-checkbox"
                    checked={newGalleryItem.isFeatured}
                    onChange={e => setNewGalleryItem({ ...newGalleryItem, isFeatured: e.target.checked })}
                    className="rounded border-emerald-800"
                  />
                  <label htmlFor="feat-checkbox" className="text-[#a3b8af] cursor-pointer">Mark as Featured Artwork</label>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddGalleryModalOpen(false)}
                    className="px-4 py-2 text-[#a3b8af] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider btn-magnetic"
                  >
                    Save Artwork
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="font-display text-2xl text-zinc-100">Create New Store Masterwork</h3>
              <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#a3b8af] mb-1">Artwork Title *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Whispers of Twilight"
                    className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Regular Price (₹)</label>
                    <input
                      type="number"
                      value={newProduct.regular_price}
                      onChange={e => setNewProduct({ ...newProduct, regular_price: Number(e.target.value) })}
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    >
                      <option value="Spiritual & Heritage Art">Spiritual & Heritage Art</option>
                      <option value="Pencil & Graphite Portraits">Pencil & Graphite Portraits</option>
                      <option value="Original Acrylic Paintings">Original Acrylic Paintings</option>
                      <option value="Anime Fanart Series">Anime Fanart Series</option>
                      <option value="Original Masterworks">Original Masterworks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Medium</label>
                    <input
                      type="text"
                      value={newProduct.medium}
                      onChange={e => setNewProduct({ ...newProduct, medium: e.target.value })}
                      placeholder="e.g. Acrylic on Canvas"
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Size / Dimensions</label>
                    <input
                      type="text"
                      value={newProduct.size}
                      onChange={e => setNewProduct({ ...newProduct, size: e.target.value })}
                      placeholder="e.g. A5 or 3 × 4 feet"
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a3b8af] mb-1">Artwork Type</label>
                    <input
                      type="text"
                      value={newProduct.artwork_type}
                      onChange={e => setNewProduct({ ...newProduct, artwork_type: e.target.value })}
                      placeholder="Original Artwork or Art Print"
                      className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#a3b8af] mb-1">Image Asset Path / URL</label>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                    placeholder="/images/shop/shop_1.jpg"
                    className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872]"
                  />
                </div>
                <div>
                  <label className="block text-[#a3b8af] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Medium details, story, dimensions, and framing notes..."
                    className="w-full bg-[#050f0b] border border-emerald-900 rounded-xl p-3 text-zinc-100 focus:outline-none focus:border-[#e8c872] resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-[#a3b8af] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider btn-magnetic"
                  >
                    Publish Artwork
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ── CHANGE PASSWORD MODAL ──────────────────────────────────────── */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#050f0b] border border-[#e8c872]/40 flex items-center justify-center text-[#e8c872]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-zinc-100">Change Password</h3>
                  <p className="text-[10px] text-[#a3b8af] uppercase tracking-wider">Logged in as {adminUser?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">

              {/* Current Password */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={cpShowCurrent ? 'text' : 'password'}
                    required
                    value={cpForm.currentPassword}
                    onChange={e => setCpForm({ ...cpForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors"
                  />
                  <button type="button" onClick={() => setCpShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {cpShowCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5">New Password</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={cpShowNew ? 'text' : 'password'}
                    required
                    value={cpForm.newPassword}
                    onChange={e => setCpForm({ ...cpForm, newPassword: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors"
                  />
                  <button type="button" onClick={() => setCpShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {cpShowNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {cpForm.newPassword && (
                  <div className="mt-1.5 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        cpForm.newPassword.length >= (i + 1) * 3
                          ? cpForm.newPassword.length >= 12 ? 'bg-emerald-500' : cpForm.newPassword.length >= 8 ? 'bg-[#e8c872]' : 'bg-red-500'
                          : 'bg-zinc-800'
                      }`} />
                    ))}
                    <span className="text-[10px] text-zinc-500 ml-1">
                      {cpForm.newPassword.length < 8 ? 'Too short' : cpForm.newPassword.length < 12 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a3b8af] mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={cpShowConfirm ? 'text' : 'password'}
                    required
                    value={cpForm.confirmPassword}
                    onChange={e => setCpForm({ ...cpForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className={`w-full bg-[#050f0b] border rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-emerald-800 focus:outline-none transition-colors ${
                      cpForm.confirmPassword && cpForm.newPassword !== cpForm.confirmPassword
                        ? 'border-red-700 focus:border-red-500'
                        : cpForm.confirmPassword && cpForm.newPassword === cpForm.confirmPassword
                        ? 'border-emerald-600 focus:border-emerald-400'
                        : 'border-emerald-900/80 focus:border-[#e8c872]'
                    }`}
                  />
                  <button type="button" onClick={() => setCpShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {cpShowConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {cpForm.confirmPassword && cpForm.newPassword === cpForm.confirmPassword && (
                    <CheckCircle2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                {cpForm.confirmPassword && cpForm.newPassword !== cpForm.confirmPassword && (
                  <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-5 py-2.5 text-[#a3b8af] hover:text-white text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cpLoading}
                  className="bg-gradient-to-r from-[#fbf5e6] via-[#e8c872] to-[#d4b055] hover:opacity-95 disabled:opacity-60 text-black font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider btn-magnetic flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(232,200,114,0.3)]"
                >
                  {cpLoading ? (
                    <><Sparkles className="w-3.5 h-3.5 animate-spin" /><span>Updating...</span></>
                  ) : (
                    <><KeyRound className="w-3.5 h-3.5" /><span>Update Password</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-emerald-950 py-4 text-center text-[10px] text-[#627a70] uppercase tracking-widest font-sans">
        niharikartist admin studio console • active session: {adminUser?.email || 'admin@niharikartist.com'}
      </footer>
    </div>
  );
}

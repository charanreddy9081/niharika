'use client';

import React, { useState } from 'react';
import { Upload, Trash2, Eye, EyeOff, Pencil, X, CheckCircle2, Loader2,
         ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageInput, { FileData } from './ImageInput';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface HTImage {
  id: string;
  title: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  is_active: boolean;
}

interface Props { images: HTImage[]; onRefresh: () => void; }

const inputCls = 'w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors';

export default function AdminHomeTransition({ images, onRefresh }: Props) {
  const [isAddOpen,     setIsAddOpen]     = useState(false);
  const [editItem,      setEditItem]      = useState<HTImage | null>(null);
  const [replaceItem,   setReplaceItem]   = useState<HTImage | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [reordering,    setReordering]    = useState(false);

  // Add form
  const [addTitle,      setAddTitle]      = useState('');
  const [addFile,       setAddFile]       = useState<FileData | null>(null);
  const [addUrl,        setAddUrl]        = useState('');
  const [addActive,     setAddActive]     = useState(true);

  // Replace form
  const [replaceFile,   setReplaceFile]   = useState<FileData | null>(null);
  const [replaceUrl,    setReplaceUrl]    = useState('');

  const token = () => localStorage.getItem('niharikartist_admin_token') || '';

  // ── Add ─────────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFile && !addUrl.trim()) { toast.error('Please upload or paste an image URL.'); return; }
    setUploading(true);
    try {
      const body: Record<string, any> = { title: addTitle, is_active: addActive };
      if (addFile) {
        body.fileData = addFile.base64;
        body.fileName = addFile.fileName;
        body.contentType = addFile.fileType;
      } else {
        body.image_url = addUrl.trim();
      }
      const res = await fetch(`${API}/api/admin/home-transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Image added to Home slideshow!');
      setIsAddOpen(false);
      setAddTitle(''); setAddFile(null); setAddUrl(''); setAddActive(true);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Upload failed.'); }
    finally { setUploading(false); }
  };

  // ── Update metadata ──────────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      const res = await fetch(`${API}/api/admin/home-transition/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ title: editItem.title, is_active: editItem.is_active, display_order: editItem.display_order }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Updated!');
      setEditItem(null);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Update failed.'); }
  };

  // ── Replace image ────────────────────────────────────────────────────────
  const handleReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceItem) return;
    if (!replaceFile && !replaceUrl.trim()) { toast.error('Please upload or paste a new image URL.'); return; }
    setUploading(true);
    try {
      const body: Record<string, any> = {};
      if (replaceFile) {
        body.fileData = replaceFile.base64;
        body.fileName = replaceFile.fileName;
        body.contentType = replaceFile.fileType;
      } else {
        body.image_url = replaceUrl.trim();
      }
      const res = await fetch(`${API}/api/admin/home-transition/${replaceItem.id}/replace`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Image replaced!');
      setReplaceItem(null); setReplaceFile(null); setReplaceUrl('');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Replace failed.'); }
    finally { setUploading(false); }
  };

  // ── Toggle active ────────────────────────────────────────────────────────
  const handleToggle = async (img: HTImage) => {
    try {
      const res = await fetch(`${API}/api/admin/home-transition/${img.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ is_active: !img.is_active }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(img.is_active ? 'Hidden from slideshow' : 'Added to slideshow');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Update failed.'); }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (img: HTImage) => {
    if (!confirm(`Delete "${img.title || 'this image'}" from the Home slideshow? This also removes it from Storage.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/home-transition/${img.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token() },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Image deleted from slideshow.');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Delete failed.'); }
  };

  // ── Move up / down ───────────────────────────────────────────────────────
  const handleMove = async (idx: number, dir: 'up' | 'down') => {
    const newImages = [...images];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newImages.length) return;

    // Swap display_order values
    const tempOrder = newImages[idx].display_order;
    newImages[idx].display_order = newImages[swapIdx].display_order;
    newImages[swapIdx].display_order = tempOrder;

    // If orders are equal, assign new sequential values
    const order = newImages.map((img, i) => ({ id: img.id, display_order: i }));

    setReordering(true);
    try {
      const res = await fetch(`${API}/api/admin/home-transition/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ order }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Reorder failed.'); }
    finally { setReordering(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-display text-2xl text-zinc-100">Home Transition Images ({images.length})</h3>
          <p className="text-xs text-[#a3b8af] mt-0.5">
            These images power the cinematic slideshow on the Home page hero. Only active images are shown.
            They rotate in display order every 4 seconds.
          </p>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 btn-magnetic shadow-lg">
          <Upload className="w-4 h-4" /><span>Add Image</span>
        </button>
      </div>

      {/* Thumbnail grid */}
      {images.length === 0 ? (
        <div className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl p-16 text-center space-y-3">
          <p className="text-zinc-500 text-sm">No Home transition images yet.</p>
          <p className="text-xs text-[#627a70]">The home page will show the default fallback artwork until you add images here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((img, idx) => (
            <div key={img.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${img.is_active ? 'bg-[#0a2319]/80 border-emerald-900/60' : 'bg-[#050f0b]/60 border-zinc-800/60 opacity-60'}`}>

              {/* Order position badge */}
              <div className="w-8 h-8 rounded-lg bg-[#050f0b] border border-emerald-900/60 flex items-center justify-center text-xs font-mono text-[#a3b8af] flex-shrink-0">
                {idx + 1}
              </div>

              {/* Thumbnail */}
              <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-emerald-900/60 flex-shrink-0 bg-[#050f0b]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt={img.title} className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/studio_hero.jpg'; }} />
              </div>

              {/* Title + URL */}
              <div className="flex-1 min-w-0">
                <strong className="text-[#fbf5e6] text-sm block truncate">{img.title || '(No title)'}</strong>
                <span className="text-[10px] text-[#627a70] font-mono truncate block">{img.image_url}</span>
                <span className={`text-[10px] mt-0.5 inline-block px-2 py-0.5 rounded-full border ${img.is_active ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>
                  {img.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>

              {/* Move up/down */}
              <div className="flex flex-col gap-1">
                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0 || reordering}
                  className="p-1 text-zinc-500 hover:text-[#e8c872] disabled:opacity-30 transition-colors" title="Move up">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(idx, 'down')} disabled={idx === images.length - 1 || reordering}
                  className="p-1 text-zinc-500 hover:text-[#e8c872] disabled:opacity-30 transition-colors" title="Move down">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleToggle(img)} title={img.is_active ? 'Disable' : 'Enable'}
                  className={`p-2 rounded-lg border transition-colors ${img.is_active ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-400' : 'bg-[#050f0b] border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}>
                  {img.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setReplaceItem(img); setReplaceFile(null); setReplaceUrl(''); }}
                  className="p-2 text-zinc-400 hover:text-[#e8c872] transition-colors" title="Replace image">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditItem({ ...img })}
                  className="p-2 text-zinc-400 hover:text-[#e8c872] transition-colors" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(img)}
                  className="p-2 text-red-400/80 hover:text-red-300 transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD MODAL ─────────────────────────────────────────────────────── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">Add Home Transition Image</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <ImageInput label="Image" required urlValue={addUrl} onUrlChange={setAddUrl} selectedFile={addFile} onFileSelected={setAddFile} />
              <div>
                <label className="block text-[#a3b8af] mb-1">Title (optional)</label>
                <input type="text" value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="e.g. Floral Masterpiece" className={inputCls} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input type="checkbox" checked={addActive} onChange={e => setAddActive(e.target.checked)} className="rounded" />
                <span className="text-[#a3b8af]">Active (show on Home page immediately)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-[#a3b8af] hover:text-white">Cancel</button>
                <button type="submit" disabled={uploading}
                  className="bg-[#e8c872] hover:bg-[#d4b055] disabled:opacity-60 text-black font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider btn-magnetic flex items-center gap-2">
                  {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Uploading...</span></> : <><CheckCircle2 className="w-3.5 h-3.5" /><span>Add to Slideshow</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ────────────────────────────────────────────────────── */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">Edit Image Details</h3>
              <button onClick={() => setEditItem(null)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            {/* Preview */}
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-emerald-900/60 bg-[#050f0b]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editItem.image_url} alt={editItem.title} className="w-full h-full object-cover" />
            </div>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a3b8af] mb-1">Title</label>
                <input type="text" value={editItem.title} onChange={e => setEditItem(i => i ? { ...i, title: e.target.value } : i)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[#a3b8af] mb-1">Display Order</label>
                <input type="number" min={0} value={editItem.display_order} onChange={e => setEditItem(i => i ? { ...i, display_order: Number(e.target.value) } : i)} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editItem.is_active} onChange={e => setEditItem(i => i ? { ...i, is_active: e.target.checked } : i)} className="rounded" />
                <span className="text-[#a3b8af]">Active (visible on Home page)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-[#a3b8af] hover:text-white">Cancel</button>
                <button type="submit" className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider btn-magnetic">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REPLACE MODAL ─────────────────────────────────────────────────── */}
      {replaceItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl text-zinc-100">Replace Image</h3>
                <p className="text-[10px] text-[#a3b8af] mt-0.5">Title, order & active status will be preserved.</p>
              </div>
              <button onClick={() => setReplaceItem(null)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            {/* Current */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500">Current image</label>
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-zinc-800 bg-[#050f0b] opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={replaceItem.image_url} alt="current" className="w-full h-full object-cover" />
              </div>
            </div>
            <form onSubmit={handleReplace} className="space-y-4 text-xs">
              <ImageInput label="New Image" required urlValue={replaceUrl} onUrlChange={setReplaceUrl} selectedFile={replaceFile} onFileSelected={setReplaceFile} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setReplaceItem(null)} className="px-4 py-2 text-[#a3b8af] hover:text-white">Cancel</button>
                <button type="submit" disabled={uploading}
                  className="bg-[#e8c872] hover:bg-[#d4b055] disabled:opacity-60 text-black font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider btn-magnetic flex items-center gap-2">
                  {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Replacing...</span></> : <><RefreshCw className="w-3.5 h-3.5" /><span>Replace Image</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

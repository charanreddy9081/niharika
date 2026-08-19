'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Star, Eye, EyeOff, Upload, X, CheckCircle2, Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ArtistImage {
  id: string;
  title: string;
  description: string;
  storage_path: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

interface Props {
  images: ArtistImage[];
  onRefresh: () => void;
}

const inputCls = 'w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors';

export default function AdminArtistImages({ images, onRefresh }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ArtistImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '', description: '', is_active: true, is_featured: false, display_order: 0,
    _file: null as File | null, _fileBase64: '', _fileName: '', _fileType: ''
  });

  const token = () => localStorage.getItem('niharikartist_admin_token') || '';

  const resetForm = () => {
    setForm({ title: '', description: '', is_active: true, is_featured: false, display_order: 0, _file: null, _fileBase64: '', _fileName: '', _fileType: '' });
    setPreviewUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setForm(f => ({ ...f, _file: file, _fileBase64: base64, _fileName: file.name, _fileType: file.type }));
      setPreviewUrl(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form._fileBase64) { toast.error('Please select an image file.'); return; }
    setUploading(true);
    try {
      // 1. Upload file to Supabase Storage
      const uploadRes = await fetch(`${API}/api/admin/artist-images/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ fileName: form._fileName, fileData: form._fileBase64, contentType: form._fileType })
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message || 'Upload failed');

      // 2. Save metadata to DB
      const saveRes = await fetch(`${API}/api/admin/artist-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          storage_path: uploadData.storage_path,
          image_url: uploadData.image_url,
          is_active: form.is_active,
          is_featured: form.is_featured,
          display_order: Number(form.display_order)
        })
      });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.message || 'Save failed');

      toast.success('Artist image uploaded successfully!');
      setIsAddOpen(false);
      resetForm();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      const res = await fetch(`${API}/api/admin/artist-images/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({
          title: editItem.title,
          description: editItem.description,
          is_active: editItem.is_active,
          is_featured: editItem.is_featured,
          display_order: editItem.display_order
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Image updated!');
      setEditItem(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Update failed.');
    }
  };

  const handleToggle = async (img: ArtistImage, field: 'is_active' | 'is_featured') => {
    try {
      const res = await fetch(`${API}/api/admin/artist-images/${img.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ [field]: !img[field] })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(field === 'is_active' ? (img.is_active ? 'Image disabled' : 'Image enabled') : (img.is_featured ? 'Removed from featured' : 'Marked as featured'));
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Update failed.');
    }
  };

  const handleDelete = async (img: ArtistImage) => {
    if (!confirm(`Delete "${img.title || 'this image'}"? This also removes it from Storage.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/artist-images/${img.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token() }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Image deleted.');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-zinc-100">Artist Images ({images.length})</h3>
          <p className="text-xs text-[#a3b8af] mt-0.5">Images that rotate on the Artist / About page each visit. Only active images are shown.</p>
        </div>
        <button onClick={() => { setIsAddOpen(true); resetForm(); }}
          className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 btn-magnetic shadow-lg">
          <Upload className="w-4 h-4" /><span>Upload Image</span>
        </button>
      </div>

      {/* Images Table */}
      <div className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl">
        {images.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">No artist images yet. Upload your first image above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#050f0b] border-b border-emerald-950 text-[10px] uppercase tracking-widest text-[#a3b8af]">
                <tr>
                  <th className="p-4">Preview</th>
                  <th className="p-4">Title</th>
                  <th className="p-4 text-center">Active</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {images.map(img => (
                  <tr key={img.id} className="hover:bg-[#0d2a1f]/50 transition-colors">
                    <td className="p-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#050f0b] border border-emerald-900/60 flex-shrink-0">
                        <Image src={img.image_url} alt={img.title} fill className="object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/studio_hero.jpg'; }} />
                      </div>
                    </td>
                    <td className="p-4">
                      <strong className="text-[#fbf5e6] block font-sans text-sm">{img.title || '(No title)'}</strong>
                      {img.description && <span className="text-[#a3b8af] text-[10px] line-clamp-1">{img.description}</span>}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggle(img, 'is_active')}
                        className={`p-1.5 rounded-lg border transition-colors ${img.is_active ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-400' : 'bg-[#050f0b] border-zinc-800 text-zinc-600'}`}
                        title={img.is_active ? 'Disable' : 'Enable'}>
                        {img.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggle(img, 'is_featured')}
                        className={`p-1.5 rounded-lg border transition-colors ${img.is_featured ? 'bg-amber-950/60 border-amber-600/80 text-amber-300' : 'bg-[#050f0b] border-zinc-800 text-zinc-600'}`}
                        title={img.is_featured ? 'Remove featured' : 'Mark featured'}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="p-4 text-center text-[#a3b8af] font-mono">{img.display_order}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => setEditItem({ ...img })}
                        className="p-2 text-zinc-400 hover:text-[#e8c872] transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(img)}
                        className="p-2 text-red-400/80 hover:text-red-300 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">Upload Artist Image</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              {/* File picker */}
              <div>
                <label className="block text-[#a3b8af] mb-1.5 uppercase tracking-wider text-[10px]">Image File * (JPEG / PNG / WebP, max 5MB)</label>
                <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-emerald-900/80 hover:border-[#e8c872]/60 rounded-xl py-8 flex flex-col items-center gap-2 transition-colors">
                  {previewUrl ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-emerald-700" />
                      <span className="text-[#a3b8af]">Click to select image</span>
                    </>
                  )}
                  {form._fileName && <span className="text-[10px] text-emerald-400">{form._fileName}</span>}
                </button>
              </div>
              <div>
                <label className="block text-[#a3b8af] mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Childhood Garden" className={inputCls} />
              </div>
              <div>
                <label className="block text-[#a3b8af] mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." className={inputCls + ' resize-none'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3b8af] mb-1">Display Order</label>
                  <input type="number" min={0} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                    <span className="text-[#a3b8af]">Active (show on site)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
                    <span className="text-[#a3b8af]">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-[#a3b8af] hover:text-white">Cancel</button>
                <button type="submit" disabled={uploading} className="bg-[#e8c872] hover:bg-[#d4b055] disabled:opacity-60 text-black font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider btn-magnetic flex items-center gap-2">
                  {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Uploading...</span></> : <><CheckCircle2 className="w-3.5 h-3.5" /><span>Upload & Save</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">Edit Image Details</h3>
              <button onClick={() => setEditItem(null)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#050f0b] border border-emerald-900/60">
              <Image src={editItem.image_url} alt={editItem.title} fill className="object-cover" />
            </div>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a3b8af] mb-1">Title</label>
                <input type="text" value={editItem.title} onChange={e => setEditItem(i => i ? { ...i, title: e.target.value } : i)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[#a3b8af] mb-1">Description</label>
                <textarea rows={2} value={editItem.description} onChange={e => setEditItem(i => i ? { ...i, description: e.target.value } : i)} className={inputCls + ' resize-none'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3b8af] mb-1">Display Order</label>
                  <input type="number" min={0} value={editItem.display_order} onChange={e => setEditItem(i => i ? { ...i, display_order: Number(e.target.value) } : i)} className={inputCls} />
                </div>
                <div className="flex flex-col gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editItem.is_active} onChange={e => setEditItem(i => i ? { ...i, is_active: e.target.checked } : i)} className="rounded" />
                    <span className="text-[#a3b8af]">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editItem.is_featured} onChange={e => setEditItem(i => i ? { ...i, is_featured: e.target.checked } : i)} className="rounded" />
                    <span className="text-[#a3b8af]">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-[#a3b8af] hover:text-white">Cancel</button>
                <button type="submit" className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider btn-magnetic">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

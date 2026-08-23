'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Pencil, Eye, EyeOff, X, CheckCircle2, Star, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageInput, { FileData } from './ImageInput';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Story {
  id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  category?: string;
  author: string;
  article_date?: string;
  excerpt: string;
  content?: string;
  quote?: string;
  image_url: string;
  is_featured?: boolean;
  is_published?: boolean;
  is_active?: boolean;
  display_order: number;
}

interface Props { stories: Story[]; onRefresh: () => void; }

const inputCls = 'w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors';

const emptyForm = {
  title: '', subtitle: '', category: 'Patron Chronicle', author: 'Niharika',
  article_date: new Date().toISOString().split('T')[0],
  excerpt: '', content: '', quote: '',
  is_featured: false, is_published: true, display_order: 0
};

const CATEGORIES = ['Patron Chronicle', 'Studio Journal', 'Behind the Canvas', 'Artist Note', 'Exhibition Review', 'Commission Story'];

export default function AdminJournal({ stories, onRefresh }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Story | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [addFile, setAddFile] = useState<FileData | null>(null);
  const [addImageUrl, setAddImageUrl] = useState('/images/product_1_1.jpg');
  const [editFile, setEditFile] = useState<FileData | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('niharikartist_admin_token') || '';

  const uploadImageIfNeeded = async (file: FileData | null, urlFallback: string): Promise<string> => {
    if (file) {
      const upRes = await fetch(`${API}/api/admin/artist-images/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ fileName: file.fileName, fileData: file.base64, contentType: file.fileType })
      });
      const upData = await upRes.json();
      if (!upData.success) throw new Error(upData.message || 'Upload failed');
      return upData.image_url;
    }
    return urlFallback.trim();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author) { toast.error('Title and author are required.'); return; }
    setSaving(true);
    try {
      const imageUrl = await uploadImageIfNeeded(addFile, addImageUrl);
      const res = await fetch(`${API}/api/admin/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ ...form, image_url: imageUrl, display_order: Number(form.display_order) })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Article published!');
      setIsAddOpen(false);
      setForm({ ...emptyForm });
      setAddFile(null);
      setAddImageUrl('/images/product_1_1.jpg');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    try {
      let imageUrl = editImageUrl.trim() || editItem.image_url;
      if (editFile) imageUrl = await uploadImageIfNeeded(editFile, imageUrl);

      const res = await fetch(`${API}/api/admin/journal/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ ...editItem, image_url: imageUrl })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Article updated!');
      setEditItem(null);
      setEditFile(null);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (story: Story, field: 'is_published' | 'is_featured') => {
    try {
      const val = !story[field];
      const res = await fetch(`${API}/api/admin/journal/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ [field]: val, ...(field === 'is_published' ? { is_active: val } : {}) })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(field === 'is_published' ? (val ? 'Published' : 'Unpublished') : (val ? 'Marked featured' : 'Removed featured'));
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Update failed.'); }
  };

  const handleDelete = async (story: Story) => {
    if (!confirm(`Delete "${story.title}"?`)) return;
    try {
      const res = await fetch(`${API}/api/admin/journal/${story.id}`, {
        method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token() }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Article deleted.');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Delete failed.'); }
  };

  // Shared text fields
  const ArticleFields = ({ val, set }: { val: any, set: (v: any) => void }) => (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#a3b8af] mb-1">Title *</label>
          <input type="text" required value={val.title} onChange={e => set((p: any) => ({ ...p, title: e.target.value }))} placeholder="Article title" className={inputCls} />
        </div>
        <div>
          <label className="block text-[#a3b8af] mb-1">Category</label>
          <select value={val.category || 'Patron Chronicle'} onChange={e => set((p: any) => ({ ...p, category: e.target.value }))} className={inputCls}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[#a3b8af] mb-1">Subtitle / Tagline</label>
        <input type="text" value={val.subtitle || ''} onChange={e => set((p: any) => ({ ...p, subtitle: e.target.value }))} placeholder="Optional subtitle" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#a3b8af] mb-1">Author *</label>
          <input type="text" required value={val.author} onChange={e => set((p: any) => ({ ...p, author: e.target.value }))} placeholder="Author name" className={inputCls} />
        </div>
        <div>
          <label className="block text-[#a3b8af] mb-1">Date</label>
          <input type="date" value={val.article_date || ''} onChange={e => set((p: any) => ({ ...p, article_date: e.target.value }))} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-[#a3b8af] mb-1">Excerpt * <span className="text-zinc-600 font-normal">(shown on listing page)</span></label>
        <textarea rows={3} required value={val.excerpt} onChange={e => set((p: any) => ({ ...p, excerpt: e.target.value }))} placeholder="Short excerpt for the journal listing..." className={inputCls + ' resize-y'} />
      </div>
      <div>
        <label className="block text-[#a3b8af] mb-1">Full Article Content</label>
        <textarea rows={8} value={val.content || ''} onChange={e => set((p: any) => ({ ...p, content: e.target.value }))} placeholder="Full article text (shown on article detail page)..." className={inputCls + ' resize-y'} />
      </div>
      <div>
        <label className="block text-[#a3b8af] mb-1">Pull Quote <span className="text-zinc-600 font-normal">(optional — shown prominently)</span></label>
        <input type="text" value={val.quote || ''} onChange={e => set((p: any) => ({ ...p, quote: e.target.value }))} placeholder="A memorable line from the article..." className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#a3b8af] mb-1">Display Order</label>
          <input type="number" min={0} value={val.display_order} onChange={e => set((p: any) => ({ ...p, display_order: Number(e.target.value) }))} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2 pt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!val.is_featured} onChange={e => set((p: any) => ({ ...p, is_featured: e.target.checked }))} className="rounded" />
            <span className="text-[#a3b8af]">⭐ Featured article</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={val.is_published !== false} onChange={e => set((p: any) => ({ ...p, is_published: e.target.checked }))} className="rounded" />
            <span className="text-[#a3b8af]">Published (visible on site)</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-display text-2xl text-zinc-100">Journal Stories ({stories.length})</h3>
          <p className="text-xs text-[#a3b8af] mt-0.5">Editorial articles shown on the Journal page. Featured article gets the large hero layout.</p>
        </div>
        <button onClick={() => { setIsAddOpen(true); setForm({ ...emptyForm }); setAddFile(null); setAddImageUrl('/images/product_1_1.jpg'); }}
          className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 btn-magnetic shadow-lg">
          <Plus className="w-4 h-4" /><span>New Article</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl">
        {stories.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">No journal articles yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#050f0b] border-b border-emerald-950 text-[10px] uppercase tracking-widest text-[#a3b8af]">
                <tr>
                  <th className="p-4">Cover</th>
                  <th className="p-4">Title / Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Published</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {stories.map(story => (
                  <tr key={story.id} className={`hover:bg-[#0d2a1f]/50 transition-colors ${!story.is_published && !story.is_active ? 'opacity-50' : ''}`}>
                    <td className="p-4">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-[#050f0b] border border-emerald-900/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={story.image_url || '/images/product_1_1.jpg'} alt={story.title} className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/product_1_1.jpg'; }} />
                      </div>
                    </td>
                    <td className="p-4">
                      <strong className="text-[#fbf5e6] block text-sm">{story.title}</strong>
                      <span className="text-[#a3b8af] text-[10px]">By {story.author}</span>
                      {story.article_date && <span className="text-[#627a70] text-[10px] block">{story.article_date}</span>}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px]">
                        {story.category || 'Patron Chronicle'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggle(story, 'is_featured')}
                        className={`p-1.5 rounded-lg border transition-colors ${story.is_featured ? 'bg-amber-950/60 border-amber-600/80 text-amber-300' : 'bg-[#050f0b] border-zinc-800 text-zinc-600'}`}
                        title="Toggle featured">
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggle(story, 'is_published')}
                        className={`p-1.5 rounded-lg border transition-colors ${(story.is_published || story.is_active) ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-400' : 'bg-[#050f0b] border-zinc-800 text-zinc-600'}`}
                        title={story.is_published || story.is_active ? 'Unpublish' : 'Publish'}>
                        {(story.is_published || story.is_active) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-4 text-center text-[#a3b8af] font-mono">{story.display_order}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a href={`/journal/${story.slug || story.id}`} target="_blank" rel="noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-[#e8c872] transition-colors" title="Preview"><FileText className="w-3.5 h-3.5" /></a>
                        <button onClick={() => { setEditItem({ ...story }); setEditFile(null); setEditImageUrl(story.image_url || ''); }}
                          className="p-1.5 text-zinc-400 hover:text-[#e8c872] transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(story)}
                          className="p-1.5 text-red-400/80 hover:text-red-300 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto pt-10">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl mb-10">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">New Journal Article</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="space-y-4">
                <ImageInput label="Cover Image" urlValue={addImageUrl} onUrlChange={setAddImageUrl} selectedFile={addFile} onFileSelected={setAddFile} />
                <ArticleFields val={form} set={setForm} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-[#a3b8af] hover:text-white text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="bg-[#e8c872] hover:bg-[#d4b055] disabled:opacity-60 text-black font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider btn-magnetic flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /><span>{saving ? 'Publishing...' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto pt-10">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl mb-10">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">Edit Article</h3>
              <button onClick={() => { setEditItem(null); setEditFile(null); }} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <ImageInput label="Cover Image" urlValue={editImageUrl} onUrlChange={setEditImageUrl} selectedFile={editFile} onFileSelected={setEditFile} />
                <ArticleFields val={editItem} set={setEditItem} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setEditItem(null); setEditFile(null); }} className="px-4 py-2 text-[#a3b8af] hover:text-white text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="bg-[#e8c872] hover:bg-[#d4b055] disabled:opacity-60 text-black font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider btn-magnetic flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /><span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

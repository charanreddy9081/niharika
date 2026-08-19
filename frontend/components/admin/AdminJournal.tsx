'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Pencil, Eye, EyeOff, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Story {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

interface Props {
  stories: Story[];
  onRefresh: () => void;
}

const inputCls = 'w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-emerald-800 focus:outline-none focus:border-[#e8c872] transition-colors';

const emptyForm = { title: '', author: '', excerpt: '', image_url: '/images/product_1_1.jpg', is_active: true, display_order: 0 };

export default function AdminJournal({ stories, onRefresh }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Story | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('niharikartist_admin_token') || '';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.excerpt) {
      toast.error('Title, author and excerpt are required.'); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ ...form, display_order: Number(form.display_order) })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Story added!');
      setIsAddOpen(false);
      setForm({ ...emptyForm });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add story.');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/journal/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({
          title: editItem.title, author: editItem.author, excerpt: editItem.excerpt,
          image_url: editItem.image_url, is_active: editItem.is_active,
          display_order: Number(editItem.display_order)
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Story updated!');
      setEditItem(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update story.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (story: Story) => {
    try {
      const res = await fetch(`${API}/api/admin/journal/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ is_active: !story.is_active })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(story.is_active ? 'Story hidden' : 'Story published');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Update failed.'); }
  };

  const handleDelete = async (story: Story) => {
    if (!confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/journal/${story.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token() }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Story deleted.');
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Delete failed.'); }
  };

  // Shared form fields renderer
  const FormFields = ({ val, set }: { val: typeof emptyForm | Story, set: (v: any) => void }) => (
    <div className="space-y-3 text-xs">
      <div>
        <label className="block text-[#a3b8af] mb-1">Title *</label>
        <input type="text" required value={val.title} onChange={e => set((p: any) => ({ ...p, title: e.target.value }))} placeholder="e.g. A Bond Across Oceans" className={inputCls} />
      </div>
      <div>
        <label className="block text-[#a3b8af] mb-1">Author *</label>
        <input type="text" required value={val.author} onChange={e => set((p: any) => ({ ...p, author: e.target.value }))} placeholder="e.g. Aarav & Meera S." className={inputCls} />
      </div>
      <div>
        <label className="block text-[#a3b8af] mb-1">Excerpt / Story *</label>
        <textarea required rows={4} value={val.excerpt} onChange={e => set((p: any) => ({ ...p, excerpt: e.target.value }))} placeholder="The patron's story..." className={inputCls + ' resize-y'} />
      </div>
      <div>
        <label className="block text-[#a3b8af] mb-1">Image URL or Path</label>
        <input type="text" value={val.image_url} onChange={e => set((p: any) => ({ ...p, image_url: e.target.value }))} placeholder="/images/product_1_1.jpg or https://..." className={inputCls} />
        {val.image_url && (
          <div className="relative w-20 h-16 mt-2 rounded-lg overflow-hidden border border-emerald-900/60">
            <Image src={val.image_url} alt="preview" fill className="object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/product_1_1.jpg'; }} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#a3b8af] mb-1">Display Order</label>
          <input type="number" min={0} value={val.display_order} onChange={e => set((p: any) => ({ ...p, display_order: Number(e.target.value) }))} className={inputCls} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="is_active_chk" checked={val.is_active} onChange={e => set((p: any) => ({ ...p, is_active: e.target.checked }))} className="rounded" />
          <label htmlFor="is_active_chk" className="text-[#a3b8af] cursor-pointer">Published (visible on site)</label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-zinc-100">Journal Stories ({stories.length})</h3>
          <p className="text-xs text-[#a3b8af] mt-0.5">Manage patron chronicles shown on the Journal / Community page.</p>
        </div>
        <button onClick={() => { setIsAddOpen(true); setForm({ ...emptyForm }); }}
          className="bg-[#e8c872] hover:bg-[#d4b055] text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 btn-magnetic shadow-lg">
          <Plus className="w-4 h-4" /><span>Add Story</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0a2319]/80 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl">
        {stories.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">No journal stories yet. Add your first one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#050f0b] border-b border-emerald-950 text-[10px] uppercase tracking-widest text-[#a3b8af]">
                <tr>
                  <th className="p-4">Image</th>
                  <th className="p-4">Title / Author</th>
                  <th className="p-4">Excerpt</th>
                  <th className="p-4 text-center">Active</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {stories.map(story => (
                  <tr key={story.id} className="hover:bg-[#0d2a1f]/50 transition-colors">
                    <td className="p-4">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-emerald-900/60 bg-[#050f0b]">
                        <Image src={story.image_url} alt={story.title} fill className="object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/product_1_1.jpg'; }} />
                      </div>
                    </td>
                    <td className="p-4">
                      <strong className="text-[#fbf5e6] block text-sm font-sans">{story.title}</strong>
                      <span className="text-[#a3b8af] text-[11px]">By {story.author}</span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-[#a3b8af] text-[11px] line-clamp-2">{story.excerpt}</p>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggle(story)}
                        className={`p-1.5 rounded-lg border transition-colors ${story.is_active ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-400' : 'bg-[#050f0b] border-zinc-800 text-zinc-600'}`}
                        title={story.is_active ? 'Hide story' : 'Publish story'}>
                        {story.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-4 text-center text-[#a3b8af] font-mono">{story.display_order}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditItem({ ...story })}
                          className="p-2 text-zinc-400 hover:text-[#e8c872] transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(story)}
                          className="p-2 text-red-400/80 hover:text-red-300 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">Add Journal Story</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd}>
              <FormFields val={form} set={setForm} />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-[#a3b8af] hover:text-white text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="bg-[#e8c872] hover:bg-[#d4b055] disabled:opacity-60 text-black font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider btn-magnetic flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /><span>{saving ? 'Saving...' : 'Add Story'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081a13] border border-[#e8c872]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-zinc-100">Edit Journal Story</h3>
              <button onClick={() => setEditItem(null)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <FormFields val={editItem} set={setEditItem} />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-[#a3b8af] hover:text-white text-xs">Cancel</button>
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

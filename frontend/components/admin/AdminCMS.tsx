'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, Plus, Trash2, RefreshCw, ChevronUp, ChevronDown,
  Eye, EyeOff, Star, Globe, Settings,
  Link2, HelpCircle, Quote, Search, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const token = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('niharikartist_admin_token') || ''
    : '';

const authH = () => ({
  'Content-Type': 'application/json',
  Authorization: 'Bearer ' + token(),
});

// ── shared UI ────────────────────────────────────────────────────────────────
const inp = 'w-full bg-[#050f0b] border border-emerald-900/80 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#e8c872] transition-colors';
const lbl = 'text-[10px] uppercase tracking-wider text-[#a3b8af] block mb-1.5 font-semibold';
const Btn = ({ children, onClick, disabled, variant = 'gold', className = '' }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 ${
      variant === 'gold'
        ? 'bg-[#e8c872] hover:bg-[#d4b055] text-black'
        : variant === 'red'
        ? 'bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300'
        : 'bg-[#0a2319] border border-emerald-900/60 hover:border-[#e8c872]/50 text-[#a3b8af] hover:text-white'
    } ${className}`}
  >
    {children}
  </button>
);

// ═════════════════════════════════════════════════════════════════════════════
// 1. FAQ MANAGER
// ═════════════════════════════════════════════════════════════════════════════
function FAQManager() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', is_published: true });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`${API}/api/admin/cms/faqs`, { headers: authH() }).then(r => r.json());
    if (r.success) setFaqs(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `${API}/api/admin/cms/faqs/${editing}` : `${API}/api/admin/cms/faqs`;
      const method = editing ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: authH(), body: JSON.stringify({ ...form, sort_order: faqs.length }) }).then(r => r.json());
      if (r.success) { toast.success(editing ? 'FAQ updated!' : 'FAQ added!'); setAdding(false); setEditing(null); setForm({ question: '', answer: '', category: 'General', is_published: true }); load(); }
      else toast.error(r.message);
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    const r = await fetch(`${API}/api/admin/cms/faqs/${id}`, { method: 'DELETE', headers: authH() }).then(r => r.json());
    if (r.success) { toast.success('Deleted.'); load(); } else toast.error(r.message);
  };

  const toggle = async (faq: any) => {
    await fetch(`${API}/api/admin/cms/faqs/${faq.id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ is_published: !faq.is_published }) });
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const arr = [...faqs];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    const reordered = arr.map((f, i) => ({ id: f.id, sort_order: i }));
    await fetch(`${API}/api/admin/cms/faqs/reorder`, { method: 'PUT', headers: authH(), body: JSON.stringify(reordered) });
    load();
  };

  const startEdit = (faq: any) => {
    setEditing(faq.id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category || 'General', is_published: faq.is_published });
    setAdding(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-xl text-zinc-100">FAQ Manager</h3>
          <p className="text-xs text-[#a3b8af]">{faqs.length} questions · drag to reorder</p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={load} variant="ghost"><RefreshCw className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => { setAdding(true); setEditing(null); setForm({ question: '', answer: '', category: 'General', is_published: true }); }}>
            <Plus className="w-3.5 h-3.5" /> Add FAQ
          </Btn>
        </div>
      </div>

      {/* Add/Edit form */}
      {adding && (
        <form onSubmit={save} className="bg-[#0a2319]/80 border border-[#e8c872]/30 rounded-2xl p-5 space-y-4">
          <h4 className="font-display text-lg text-zinc-100">{editing ? 'Edit FAQ' : 'New FAQ'}</h4>
          <div>
            <label className={lbl}>Question *</label>
            <input className={inp} value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="e.g. How long does delivery take?" required />
          </div>
          <div>
            <label className={lbl}>Answer *</label>
            <textarea className={inp} rows={4} value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} placeholder="Detailed answer..." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Category</label>
              <input className={inp} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="General" />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} className="rounded border-emerald-800" />
                Published
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Btn disabled={saving}><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}</Btn>
            <Btn variant="ghost" onClick={() => { setAdding(false); setEditing(null); }}>Cancel</Btn>
          </div>
        </form>
      )}

      {/* FAQ list */}
      {loading ? <div className="text-center py-8 text-zinc-500 text-sm">Loading…</div> : (
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className={`bg-[#0a2319]/60 border rounded-xl p-4 ${faq.is_published ? 'border-emerald-900/50' : 'border-zinc-800 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-100 font-medium">{faq.question}</p>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{faq.answer}</p>
                  {faq.category && <span className="text-[10px] text-[#a3b8af] mt-1 block">{faq.category}</span>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => move(idx, -1)} className="p-1 text-zinc-600 hover:text-zinc-300" title="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => move(idx, 1)} className="p-1 text-zinc-600 hover:text-zinc-300" title="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toggle(faq)} className="p-1 text-zinc-600 hover:text-zinc-300" title="Toggle visibility">
                    {faq.is_published ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => startEdit(faq)} className="p-1 text-zinc-600 hover:text-[#e8c872]" title="Edit">✏️</button>
                  <button onClick={() => del(faq.id)} className="p-1 text-zinc-600 hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {faqs.length === 0 && <p className="text-center text-zinc-500 text-sm py-8">No FAQs yet. Add one above.</p>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. TESTIMONIALS MANAGER
// ═════════════════════════════════════════════════════════════════════════════
function TestimonialsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const blank = { name: '', designation: '', location: '', review: '', rating: 5, photo_url: '', is_published: true };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`${API}/api/admin/cms/testimonials`, { headers: authH() }).then(r => r.json());
    if (r.success) setItems(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `${API}/api/admin/cms/testimonials/${editing}` : `${API}/api/admin/cms/testimonials`;
      const method = editing ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: authH(), body: JSON.stringify(form) }).then(r => r.json());
      if (r.success) { toast.success('Saved!'); setAdding(false); setEditing(null); setForm(blank); load(); }
      else toast.error(r.message);
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`${API}/api/admin/cms/testimonials/${id}`, { method: 'DELETE', headers: authH() });
    toast.success('Deleted.'); load();
  };

  const toggle = async (t: any) => {
    await fetch(`${API}/api/admin/cms/testimonials/${t.id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ is_published: !t.is_published }) });
    load();
  };

  const startEdit = (t: any) => {
    setEditing(t.id);
    setForm({ name: t.name, designation: t.designation || '', location: t.location || '', review: t.review, rating: t.rating, photo_url: t.photo_url || '', is_published: t.is_published });
    setAdding(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-xl text-zinc-100">Testimonials</h3>
          <p className="text-xs text-[#a3b8af]">{items.filter(t => t.is_published).length} published</p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={load} variant="ghost"><RefreshCw className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => { setAdding(true); setEditing(null); setForm(blank); }}><Plus className="w-3.5 h-3.5" /> Add Testimonial</Btn>
        </div>
      </div>

      {adding && (
        <form onSubmit={save} className="bg-[#0a2319]/80 border border-[#e8c872]/30 rounded-2xl p-5 space-y-4">
          <h4 className="font-display text-lg text-zinc-100">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Customer Name *</label><input className={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Priya Sharma" required /></div>
            <div><label className={lbl}>Designation / Gift Type</label><input className={inp} value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="Sister Gift" /></div>
            <div><label className={lbl}>Location</label><input className={inp} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Mumbai" /></div>
            <div>
              <label className={lbl}>Rating (1–5)</label>
              <div className="flex gap-2 mt-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}
                    className={`p-1 transition-colors ${form.rating >= s ? 'text-amber-400' : 'text-zinc-700 hover:text-zinc-400'}`}>
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div><label className={lbl}>Review *</label><textarea className={inp} rows={3} value={form.review} onChange={e => setForm(p => ({ ...p, review: e.target.value }))} placeholder="The portrait was beautiful…" required /></div>
          <div><label className={lbl}>Photo URL (optional)</label><input className={inp} value={form.photo_url} onChange={e => setForm(p => ({ ...p, photo_url: e.target.value }))} placeholder="https://…" /></div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} className="rounded border-emerald-800" />
            Published (visible on site)
          </label>
          <div className="flex gap-2">
            <Btn disabled={saving}><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}</Btn>
            <Btn variant="ghost" onClick={() => { setAdding(false); setEditing(null); }}>Cancel</Btn>
          </div>
        </form>
      )}

      {loading ? <div className="text-center py-8 text-zinc-500 text-sm">Loading…</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(t => (
            <div key={t.id} className={`bg-[#0a2319]/60 border rounded-2xl p-5 space-y-3 ${t.is_published ? 'border-emerald-900/50' : 'border-zinc-800 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{t.name}</p>
                  <p className="text-[11px] text-zinc-500">{t.designation}{t.location ? ` · ${t.location}` : ''}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => toggle(t)} className="p-1 text-zinc-600 hover:text-zinc-300">
                    {t.is_published ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => startEdit(t)} className="p-1 text-zinc-600 hover:text-[#e8c872]">✏️</button>
                  <button onClick={() => del(t.id)} className="p-1 text-zinc-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${t.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />)}
              </div>
              <p className="text-xs text-zinc-400 line-clamp-3">{t.review}</p>
            </div>
          ))}
          {items.length === 0 && <p className="col-span-2 text-center text-zinc-500 text-sm py-8">No testimonials yet.</p>}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. WEBSITE SETTINGS
// ═════════════════════════════════════════════════════════════════════════════
function WebsiteSettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`${API}/api/admin/cms/settings`, { headers: authH() }).then(r => r.json());
    if (r.success) setSettings(r.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings((p: any) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const r = await fetch(`${API}/api/admin/cms/settings`, { method: 'PUT', headers: authH(), body: JSON.stringify(settings) }).then(r => r.json());
    setSaving(false);
    if (r.success) toast.success('Settings saved!'); else toast.error(r.message);
  };

  if (!settings) return <div className="text-center py-8 text-zinc-500 text-sm">Loading…</div>;

  const Field = ({ k, label, placeholder, textarea }: { k: string; label: string; placeholder?: string; textarea?: boolean }) => (
    <div>
      <label className={lbl}>{label}</label>
      {textarea
        ? <textarea className={inp} rows={3} value={settings[k] || ''} onChange={set(k)} placeholder={placeholder} />
        : <input className={inp} value={settings[k] || ''} onChange={set(k)} placeholder={placeholder} />}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-zinc-100">Website Settings</h3>
          <p className="text-xs text-[#a3b8af]">Global site configuration</p>
        </div>
        <Btn onClick={save} disabled={saving}><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save All'}</Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#0a2319]/60 border border-emerald-900/50 rounded-2xl p-6">
        <Field k="site_name"     label="Site Name"     placeholder="niharikartist" />
        <Field k="site_tagline"  label="Site Tagline"  placeholder="Haute Fine Art Atelier" />
        <Field k="contact_email" label="Contact Email" placeholder="hello@niharikartist.shop" />
        <Field k="contact_phone" label="Contact Phone / WhatsApp" placeholder="+91 98765 43210" />
        <Field k="whatsapp_number" label="WhatsApp Number (no + or spaces)" placeholder="919876543210" />
        <Field k="address"       label="Studio Address" placeholder="niharikartist Fine Art Atelier, India" />
        <Field k="logo_url"      label="Logo URL"      placeholder="/logo.png" />
        <Field k="favicon_url"   label="Favicon URL"   placeholder="/logo.png" />
        <Field k="theme_color"   label="Theme Color (hex)" placeholder="#050f0b" />
        <div />
        <div className="sm:col-span-2"><Field k="meta_title" label="Default SEO Title" placeholder="niharikartist | Fine Art Atelier" /></div>
        <div className="sm:col-span-2"><Field k="meta_description" label="Default SEO Description" placeholder="Original acrylic & oil paintings…" textarea /></div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. SOCIAL LINKS MANAGER
// ═════════════════════════════════════════════════════════════════════════════
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <span className="text-xs font-bold">IG</span>,
  facebook:  <span className="text-xs font-bold">FB</span>,
  youtube:   <span className="text-xs font-bold">YT</span>,
  whatsapp:  <MessageCircle className="w-4 h-4" />,
  pinterest: <span className="text-xs font-bold">PT</span>,
};

function SocialLinksManager() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ platform: '', label: '', url: '', icon: '' });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`${API}/api/admin/cms/social-links`, { headers: authH() }).then(r => r.json());
    if (r.success) setLinks(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, patch: any) => {
    setSaving(id);
    const r = await fetch(`${API}/api/admin/cms/social-links/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify(patch) }).then(r => r.json());
    setSaving(null);
    if (r.success) { toast.success('Saved!'); load(); } else toast.error(r.message);
  };

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${API}/api/admin/cms/social-links`, { method: 'POST', headers: authH(), body: JSON.stringify(addForm) }).then(r => r.json());
    if (r.success) { toast.success('Added!'); setAdding(false); setAddForm({ platform: '', label: '', url: '', icon: '' }); load(); }
    else toast.error(r.message);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-xl text-zinc-100">Social Media Links</h3>
          <p className="text-xs text-[#a3b8af]">Manage all social platform links and visibility</p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={load} variant="ghost"><RefreshCw className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => setAdding(v => !v)}><Plus className="w-3.5 h-3.5" /> Add Platform</Btn>
        </div>
      </div>

      {adding && (
        <form onSubmit={addLink} className="bg-[#0a2319]/80 border border-[#e8c872]/30 rounded-2xl p-5 space-y-4">
          <h4 className="font-display text-lg text-zinc-100">New Social Platform</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Platform ID *</label><input className={inp} value={addForm.platform} onChange={e => setAddForm(p => ({ ...p, platform: e.target.value }))} placeholder="tiktok" required /></div>
            <div><label className={lbl}>Label *</label><input className={inp} value={addForm.label} onChange={e => setAddForm(p => ({ ...p, label: e.target.value }))} placeholder="TikTok" required /></div>
            <div className="col-span-2"><label className={lbl}>URL *</label><input className={inp} value={addForm.url} onChange={e => setAddForm(p => ({ ...p, url: e.target.value }))} placeholder="https://tiktok.com/@niharikartist" required /></div>
          </div>
          <div className="flex gap-2">
            <Btn>Save</Btn>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </form>
      )}

      {loading ? <div className="text-center py-8 text-zinc-500 text-sm">Loading…</div> : (
        <div className="space-y-3">
          {links.map(link => (
            <SocialLinkRow key={link.id} link={link} onSave={update} saving={saving === link.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function SocialLinkRow({ link, onSave, saving }: { link: any; onSave: (id: string, p: any) => void; saving: boolean }) {
  const [url, setUrl] = useState(link.url);
  const [label, setLabel] = useState(link.label);
  const dirty = url !== link.url || label !== link.label;

  return (
    <div className={`bg-[#0a2319]/60 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${link.is_visible ? 'border-emerald-900/50' : 'border-zinc-800 opacity-60'}`}>
      <div className="flex items-center gap-3 w-28 flex-shrink-0">
        <span className="text-[#e8c872]">{PLATFORM_ICONS[link.platform] || <Globe className="w-4 h-4" />}</span>
        <span className="text-sm text-zinc-200 font-medium capitalize">{link.platform}</span>
      </div>
      <input className={inp + ' flex-1'} value={label} onChange={e => setLabel(e.target.value)} placeholder="Display label" />
      <input className={inp + ' flex-1'} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" />
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onSave(link.id, { is_visible: !link.is_visible })} className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors" title="Toggle visibility">
          {link.is_visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
        </button>
        {dirty && (
          <button onClick={() => onSave(link.id, { url, label })} disabled={saving}
            className="flex items-center gap-1 bg-[#e8c872] hover:bg-[#d4b055] text-black text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
            {saving ? '…' : <><Save className="w-3 h-3" /> Save</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. SEO SETTINGS MANAGER
// ═════════════════════════════════════════════════════════════════════════════
function SEOManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`${API}/api/admin/cms/seo`, { headers: authH() }).then(r => r.json());
    if (r.success) { setPages(r.data); if (!selected && r.data.length > 0) setSelected(r.data[0]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const r = await fetch(`${API}/api/admin/cms/seo/${selected.page_slug}`, { method: 'PUT', headers: authH(), body: JSON.stringify(selected) }).then(r => r.json());
    setSaving(false);
    if (r.success) { toast.success(`SEO saved for ${selected.page_label}!`); load(); } else toast.error(r.message);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSelected((p: any) => ({ ...p, [k]: e.target.value }));

  if (loading) return <div className="text-center py-8 text-zinc-500 text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-xl text-zinc-100">SEO Settings</h3>
          <p className="text-xs text-[#a3b8af]">Meta titles, descriptions, and Open Graph per page</p>
        </div>
        <Btn onClick={save} disabled={saving || !selected}><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Page SEO'}</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Page selector */}
        <div className="space-y-1">
          {pages.map(p => (
            <button key={p.page_slug} onClick={() => setSelected({ ...p })}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${selected?.page_slug === p.page_slug ? 'bg-[#e8c872]/15 border border-[#e8c872]/40 text-[#e8c872]' : 'bg-[#0a2319]/40 border border-emerald-900/30 text-zinc-400 hover:text-zinc-200 hover:border-emerald-800'}`}>
              {p.page_label}
            </button>
          ))}
        </div>

        {/* Editor */}
        {selected && (
          <div className="lg:col-span-3 bg-[#0a2319]/60 border border-emerald-900/50 rounded-2xl p-5 space-y-4">
            <h4 className="font-display text-lg text-[#e8c872]">{selected.page_label}</h4>

            <div><label className={lbl}>Meta Title <span className="text-zinc-600 normal-case">(max 60 chars)</span></label>
              <input className={inp} value={selected.meta_title || ''} onChange={set('meta_title')} placeholder="Page Title | niharikartist" maxLength={70} />
              <p className="text-[10px] text-zinc-600 mt-1">{(selected.meta_title || '').length}/60 chars</p>
            </div>

            <div><label className={lbl}>Meta Description <span className="text-zinc-600 normal-case">(max 160 chars)</span></label>
              <textarea className={inp} rows={3} value={selected.meta_description || ''} onChange={set('meta_description')} placeholder="Brief description for search engines…" maxLength={200} />
              <p className="text-[10px] text-zinc-600 mt-1">{(selected.meta_description || '').length}/160 chars</p>
            </div>

            <div><label className={lbl}>Keywords <span className="text-zinc-600 normal-case">(comma-separated)</span></label>
              <input className={inp} value={selected.meta_keywords || ''} onChange={set('meta_keywords')} placeholder="handpainted art, custom portrait, fine art india" />
            </div>

            <div className="border-t border-emerald-950 pt-4 space-y-4">
              <p className="text-[11px] uppercase tracking-wider text-[#a3b8af] font-semibold">Open Graph (Social Sharing)</p>
              <div><label className={lbl}>OG Title</label><input className={inp} value={selected.og_title || ''} onChange={set('og_title')} placeholder="Same as meta title if blank" /></div>
              <div><label className={lbl}>OG Description</label><textarea className={inp} rows={2} value={selected.og_description || ''} onChange={set('og_description')} placeholder="Same as meta description if blank" /></div>
              <div><label className={lbl}>OG Image URL</label><input className={inp} value={selected.og_image_url || ''} onChange={set('og_image_url')} placeholder="https://niharikartist.shop/og-image.jpg" /></div>
              <div><label className={lbl}>Canonical URL</label><input className={inp} value={selected.canonical_url || ''} onChange={set('canonical_url')} placeholder="https://niharikartist.shop/page" /></div>
            </div>

            {/* Preview */}
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/40 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Google Preview</p>
              <p className="text-blue-400 text-sm font-medium line-clamp-1">{selected.meta_title || 'Page Title'}</p>
              <p className="text-green-600 text-[11px]">niharikartist.shop/{selected.page_slug}</p>
              <p className="text-zinc-400 text-xs line-clamp-2">{selected.meta_description || 'Meta description will appear here.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT — Tab switcher
// ═════════════════════════════════════════════════════════════════════════════
type CMSTab = 'faqs' | 'testimonials' | 'settings' | 'social' | 'seo';

const TABS: { id: CMSTab; label: string; icon: React.ReactNode }[] = [
  { id: 'faqs',         label: 'FAQs',             icon: <HelpCircle  className="w-3.5 h-3.5" /> },
  { id: 'testimonials', label: 'Testimonials',      icon: <Quote       className="w-3.5 h-3.5" /> },
  { id: 'settings',     label: 'Site Settings',     icon: <Settings    className="w-3.5 h-3.5" /> },
  { id: 'social',       label: 'Social Links',      icon: <Link2       className="w-3.5 h-3.5" /> },
  { id: 'seo',          label: 'SEO',               icon: <Search      className="w-3.5 h-3.5" /> },
];

export default function AdminCMS() {
  const [tab, setTab] = useState<CMSTab>('faqs');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-zinc-100">CMS Manager</h2>
          <p className="text-xs text-[#a3b8af]">Manage FAQs, testimonials, site settings, social links, and SEO</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-emerald-950 pb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
              tab === t.id
                ? 'bg-gradient-to-r from-[#e8c872] to-[#d4b055] text-black shadow'
                : 'bg-[#0a2319]/70 border border-emerald-900/60 text-[#a3b8af] hover:text-white hover:border-[#e8c872]/40'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'faqs'         && <FAQManager />}
        {tab === 'testimonials' && <TestimonialsManager />}
        {tab === 'settings'     && <WebsiteSettingsManager />}
        {tab === 'social'       && <SocialLinksManager />}
        {tab === 'seo'          && <SEOManager />}
      </div>
    </div>
  );
}

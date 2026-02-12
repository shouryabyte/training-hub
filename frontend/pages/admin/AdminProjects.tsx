import React, { useEffect, useMemo, useState } from 'react';
import { Project, createProject, deleteProject, listProjects, updateProject } from '../../services/projectsService';

function parseTechStack(raw: string) {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

const emptyForm = {
  title: '',
  description: '',
  partner: '',
  url: '',
  status: 'UPCOMING' as 'LIVE' | 'UPCOMING',
  cohortBadge: '',
  techStack: '',
  difficulty: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  isFeatured: false,
};

export const AdminProjects: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);

  const title = useMemo(() => (editingId ? 'Edit Project' : 'Create Project'), [editingId]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listProjects();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const startEdit = (p: Project) => {
    setEditingId(p._id);
    setForm({
      title: p.title || '',
      description: p.description || '',
      partner: p.partner || '',
      url: p.url || '',
      status: p.status || 'UPCOMING',
      cohortBadge: p.cohortBadge || '',
      techStack: (p.techStack || []).join(', '),
      difficulty: p.difficulty || 'INTERMEDIATE',
      isFeatured: Boolean(p.isFeatured),
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        partner: form.partner.trim() || undefined,
        url: form.url.trim() || undefined,
        status: form.status,
        cohortBadge: form.cohortBadge.trim() || undefined,
        techStack: parseTechStack(form.techStack),
        difficulty: form.difficulty,
        isFeatured: Boolean(form.isFeatured),
      };
      if (editingId) await updateProject(editingId, payload);
      else await createProject(payload);
      await refresh();
      reset();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      await refresh();
      if (editingId === id) reset();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="mono text-[9px] font-black text-indigo-300 uppercase tracking-[0.4em] mb-2">Projects</p>
            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium"
            placeholder="Project title"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full h-28 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white font-medium"
            placeholder="Short description (what it is + why it matters)"
          />
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium"
            placeholder="Live URL (optional)"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-widest text-xs"
            >
              <option value="LIVE">LIVE</option>
              <option value="UPCOMING">UPCOMING</option>
            </select>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as any }))}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-widest text-xs"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>
          <input
            value={form.partner}
            onChange={(e) => setForm((f) => ({ ...f, partner: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium"
            placeholder="Partner / industry (optional)"
          />
          <input
            value={form.cohortBadge}
            onChange={(e) => setForm((f) => ({ ...f, cohortBadge: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium"
            placeholder="Badge (optional)"
          />
          <input
            value={form.techStack}
            onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium"
            placeholder="Tech stack (comma-separated)"
          />
          <label className="flex items-center gap-3 text-slate-300 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            />
            Featured
          </label>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={saving || !form.title.trim() || !form.description.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-200 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-2">
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Catalog</p>
            <h2 className="text-2xl font-black text-white tracking-tight">All Projects</h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">{loading ? 'Loading…' : `${items.length} total`}</div>
        </div>

        {!loading && items.length === 0 && <div className="text-slate-400 font-medium">No projects yet.</div>}

        <div className="space-y-4">
          {items.map((p) => (
            <div key={p._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`mono text-[9px] font-black uppercase tracking-[0.4em] ${p.status === 'LIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {p.status}
                    </span>
                    {p.isFeatured ? (
                      <span className="mono text-[9px] font-black uppercase tracking-[0.4em] text-indigo-300">Featured</span>
                    ) : null}
                  </div>
                  <p className="text-white font-black text-lg mt-2 truncate">{p.title}</p>
                  <p className="text-slate-400 text-sm font-medium mt-2 line-clamp-2">{p.description}</p>
                  {!!p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-indigo-300 text-xs font-black uppercase tracking-widest hover:text-indigo-200"
                    >
                      Open live ↗
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(p._id)}
                    className="px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-950/20 text-red-200 border border-red-500/20 hover:bg-red-950/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useMemo, useState } from 'react';
import { Course, createCourse, deleteCourse, listCourses, updateCourse } from '../../services/teacherService';

function parseLines(v: string) {
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export const TeacherCourses: React.FC<{ batches: any[] }> = ({ batches }) => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batchId, setBatchId] = useState('');
  const [q, setQ] = useState('');

  const [draft, setDraft] = useState({
    name: '',
    shortDescription: '',
    description: '',
    highlightsText: '',
    outcomesText: '',
    sortOrder: 0,
    isActive: true,
  });

  const refresh = async (bId?: string) => {
    setLoading(true);
    try {
      const data = await listCourses(bId);
      setCourses(data);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBatchId('');
    void refresh();
  }, [batches]);

  const filtered = useMemo(() => {
    const base = batchId
      ? courses.filter((c) => String((c as any).batch?._id || (c as any).batch) === String(batchId))
      : courses;
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((c) => String(c.name).toLowerCase().includes(query) || String(c.slug || '').toLowerCase().includes(query));
  }, [courses, batchId, q]);

  const create = async () => {
    if (!batchId || !draft.name.trim()) return;
    setBusy('create');
    try {
      await createCourse({
        batch: batchId,
        name: draft.name.trim(),
        shortDescription: draft.shortDescription.trim(),
        description: draft.description.trim(),
        highlights: parseLines(draft.highlightsText),
        outcomes: parseLines(draft.outcomesText),
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: draft.isActive,
      } as any);
      setDraft({ name: '', shortDescription: '', description: '', highlightsText: '', outcomesText: '', sortOrder: 0, isActive: true });
      await refresh(batchId);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Create course failed');
    } finally {
      setBusy(null);
    }
  };

  const save = async (c: Course) => {
    setBusy(c._id);
    try {
      await updateCourse(c._id, {
        batch: String((c as any).batch?._id || (c as any).batch || batchId),
        name: c.name,
        slug: c.slug,
        shortDescription: c.shortDescription || '',
        description: c.description || '',
        highlights: c.highlights || [],
        outcomes: c.outcomes || [],
        sortOrder: Number(c.sortOrder || 0),
        isActive: c.isActive !== false,
      } as any);
      await refresh(batchId);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Update course failed');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    const course = courses.find((c) => c._id === id);
    if (!course) return;

    const ok = window.confirm(
      'Delete this course?\n\nIf students are already enrolled, it will be disabled instead of deleted.'
    );
    if (!ok) return;

    setBusy(`del:${id}`);
    try {
      const r = await deleteCourse(id);
      if ((r as any)?.disabled) window.alert('Course has enrollments, so it was disabled instead of deleted.');
      await refresh(batchId);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Delete course failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
        <h2 className="text-2xl font-black text-white tracking-tight mb-6">Create Course</h2>
        <div className="space-y-4">
          <select
            value={batchId}
            onChange={(e) => {
              const id = e.target.value;
              setBatchId(id);
              void refresh(id || undefined);
            }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
          >
            <option value="">All batches</option>
            {(batches || []).map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            value={draft.name}
            onChange={(e) => setDraft((x) => ({ ...x, name: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
            placeholder="Course name"
          />
          <input
            value={draft.shortDescription}
            onChange={(e) => setDraft((x) => ({ ...x, shortDescription: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Short description"
          />
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((x) => ({ ...x, description: e.target.value }))}
            className="w-full h-28 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white font-medium"
            placeholder="Brief, persuasive description..."
          />
          <textarea
            value={draft.highlightsText}
            onChange={(e) => setDraft((x) => ({ ...x, highlightsText: e.target.value }))}
            className="w-full h-24 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white font-medium"
            placeholder="Highlights (one per line)"
          />
          <textarea
            value={draft.outcomesText}
            onChange={(e) => setDraft((x) => ({ ...x, outcomesText: e.target.value }))}
            className="w-full h-24 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white font-medium"
            placeholder="Outcomes (one per line)"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => setDraft((x) => ({ ...x, sortOrder: Number(e.target.value || 0) }))}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
              placeholder="Order"
            />
            <label className="flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-xs uppercase tracking-widest">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft((x) => ({ ...x, isActive: e.target.checked }))}
                className="h-4 w-4 accent-indigo-500"
              />
              Active
            </label>
          </div>
          <button
            disabled={!batchId || !draft.name.trim() || busy === 'create'}
            onClick={() => void create()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            {busy === 'create' ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-2">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Courses</h2>
            <p className="text-slate-400 font-medium mt-2">Edit titles and descriptions to improve conversion.</p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full md:w-80 bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Search courses…"
          />
        </div>
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <input
                    value={c.name}
                    onChange={(e) => setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, name: e.target.value } : x)))}
                    className="w-full bg-transparent text-white font-black text-lg tracking-tight outline-none"
                  />
                  <input
                    value={c.shortDescription || ''}
                    onChange={(e) =>
                      setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, shortDescription: e.target.value } : x)))
                    }
                    className="mt-2 w-full bg-transparent text-slate-300 text-sm font-medium outline-none"
                    placeholder="Short description"
                  />
                  <textarea
                    value={c.description || ''}
                    onChange={(e) =>
                      setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, description: e.target.value } : x)))
                    }
                    className="mt-3 w-full h-24 bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-slate-200 text-sm font-medium"
                  />
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <textarea
                      value={(c.highlights || []).join('\n')}
                      onChange={(e) =>
                        setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, highlights: parseLines(e.target.value) } : x)))
                      }
                      className="w-full h-24 bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-slate-200 text-sm font-medium"
                      placeholder="Highlights (one per line)"
                    />
                    <textarea
                      value={(c.outcomes || []).join('\n')}
                      onChange={(e) =>
                        setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, outcomes: parseLines(e.target.value) } : x)))
                      }
                      className="w-full h-24 bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-slate-200 text-sm font-medium"
                      placeholder="Outcomes (one per line)"
                    />
                  </div>
                  <div className="mt-4 grid md:grid-cols-3 gap-3">
                    <input
                      value={c.slug || ''}
                      onChange={(e) => setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, slug: e.target.value } : x)))}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 text-sm font-medium"
                      placeholder="Slug (optional)"
                    />
                    <input
                      type="number"
                      value={Number(c.sortOrder || 0)}
                      onChange={(e) =>
                        setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, sortOrder: Number(e.target.value || 0) } : x)))
                      }
                      className="w-full bg-slate-950/40 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 text-sm font-medium"
                      placeholder="Sort order"
                    />
                    <label className="flex items-center justify-between gap-3 bg-slate-950/40 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 text-xs font-black uppercase tracking-widest">
                      <span>{c.isActive !== false ? 'Active' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={c.isActive !== false}
                        onChange={(e) => setCourses((xs) => xs.map((x) => (x._id === c._id ? { ...x, isActive: e.target.checked } : x)))}
                        className="h-4 w-4 accent-indigo-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    disabled={busy === c._id}
                    onClick={() => void save(c)}
                    className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    {busy === c._id ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    disabled={busy === `del:${c._id}`}
                    onClick={() => void remove(c._id)}
                    className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 border border-white/10 transition-all active:scale-95"
                  >
                    {busy === `del:${c._id}` ? 'Working…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && !filtered.length && <div className="text-slate-400 font-medium">No courses yet.</div>}
        </div>
      </div>
    </div>
  );
};

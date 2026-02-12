import React, { useEffect, useMemo, useState } from 'react';
import { ManagedUser, createManagedUser, deleteManagedUser, listManagedUsers, updateManagedUser } from '../../services/adminService';

export const AdminUsers: React.FC<{ batches: any[] }> = ({ batches }) => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<ManagedUser[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [q, setQ] = useState('');
  const [apiMissing, setApiMissing] = useState(false);

  const [draft, setDraft] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TEACHER' as 'TEACHER' | 'STUDENT',
    batch: '',
  });

  const refresh = async () => {
    setLoading(true);
    setApiMissing(false);
    try {
      const [t, s] = await Promise.all([listManagedUsers('TEACHER'), listManagedUsers('STUDENT')]);
      setTeachers(t || []);
      setStudents(s || []);
    } catch (e: any) {
      if (typeof e?.status === 'number' && e.status === 404) setApiMissing(true);
      window.alert(e?.data?.message || e?.message || 'Failed to load users');
      setTeachers([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const query = q.trim().toLowerCase();
  const filteredTeachers = useMemo(() => {
    if (!query) return teachers;
    return teachers.filter((u) => String(u.name).toLowerCase().includes(query) || String(u.email).toLowerCase().includes(query));
  }, [teachers, query]);

  const filteredStudents = useMemo(() => {
    if (!query) return students;
    return students.filter((u) => String(u.name).toLowerCase().includes(query) || String(u.email).toLowerCase().includes(query));
  }, [students, query]);

  const create = async () => {
    if (!draft.name.trim() || !draft.email.trim() || !draft.password.trim()) return;
    setBusy('create');
    try {
      await createManagedUser({
        name: draft.name.trim(),
        email: draft.email.trim(),
        password: draft.password,
        role: draft.role,
        batch: draft.role === 'STUDENT' && draft.batch ? draft.batch : undefined,
      });
      setDraft({ name: '', email: '', password: '', role: 'TEACHER', batch: '' });
      await refresh();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Create user failed');
    } finally {
      setBusy(null);
    }
  };

  const resetPassword = async (u: ManagedUser) => {
    const pw = window.prompt(`Set a new password for ${u.email}:`);
    if (!pw || pw.trim().length < 6) return;
    setBusy(`pw:${u._id}`);
    try {
      await updateManagedUser(u._id, { password: pw.trim() });
      window.alert('Password updated.');
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Password update failed');
    } finally {
      setBusy(null);
    }
  };

  const setRole = async (u: ManagedUser, role: 'TEACHER' | 'STUDENT') => {
    const ok = window.confirm(`Change role for ${u.email} to ${role}?`);
    if (!ok) return;
    setBusy(`role:${u._id}`);
    try {
      await updateManagedUser(u._id, { role });
      await refresh();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Role update failed');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (u: ManagedUser) => {
    const ok = window.confirm(`Delete ${u.role.toLowerCase()} account: ${u.email}?`);
    if (!ok) return;
    setBusy(`del:${u._id}`);
    try {
      await deleteManagedUser(u._id);
      await refresh();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Delete user failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
        <h2 className="text-2xl font-black text-white tracking-tight mb-6">Create Account</h2>
        <div className="space-y-4">
          <select
            value={draft.role}
            onChange={(e) => setDraft((x) => ({ ...x, role: e.target.value as any }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
          >
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
          </select>
          {draft.role === 'STUDENT' ? (
            <select
              value={draft.batch}
              onChange={(e) => setDraft((x) => ({ ...x, batch: e.target.value }))}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
            >
              <option value="">No batch</option>
              {(batches || []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : null}
          <input
            value={draft.name}
            onChange={(e) => setDraft((x) => ({ ...x, name: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
            placeholder="Full name"
          />
          <input
            value={draft.email}
            onChange={(e) => setDraft((x) => ({ ...x, email: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Email"
          />
          <input
            value={draft.password}
            onChange={(e) => setDraft((x) => ({ ...x, password: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Temporary password (min 6 chars)"
            type="password"
          />
          <button
            disabled={!draft.name.trim() || !draft.email.trim() || draft.password.trim().length < 6 || busy === 'create'}
            onClick={() => void create()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            {busy === 'create' ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-2">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Accounts</h2>
            <p className="text-slate-400 font-medium mt-2">Create, reset passwords, and delete teacher/student accounts.</p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full md:w-80 bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Search by name or email…"
          />
        </div>

        {apiMissing ? (
          <div className="mb-6 bg-slate-950/60 border border-yellow-500/20 rounded-2xl p-5 text-slate-300 font-medium">
            Your backend is missing the <span className="mono text-slate-200">/api/admin/users</span> endpoint (404). Restart the backend server
            so it loads the latest routes.
          </div>
        ) : null}

        {loading ? <div className="text-slate-400 font-medium">Loading accounts…</div> : null}

        <div className="space-y-8">
          <div>
            <div className="mono text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Teachers</div>
            <div className="space-y-3">
              {filteredTeachers.map((u) => (
                <div key={u._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-white font-black">{u.name}</div>
                    <div className="text-slate-500 text-sm font-medium">{u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={busy === `role:${u._id}`}
                      onClick={() => void setRole(u, 'STUDENT')}
                      className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 border border-white/10 transition-all active:scale-95"
                    >
                      {busy === `role:${u._id}` ? 'Working…' : 'Make Student'}
                    </button>
                    <button
                      disabled={busy === `pw:${u._id}`}
                      onClick={() => void resetPassword(u)}
                      className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 border border-white/10 transition-all active:scale-95"
                    >
                      {busy === `pw:${u._id}` ? 'Working…' : 'Reset PW'}
                    </button>
                    <button
                      disabled={busy === `del:${u._id}`}
                      onClick={() => void remove(u)}
                      className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 text-red-200 border border-red-500/20 transition-all active:scale-95"
                    >
                      {busy === `del:${u._id}` ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
              {!filteredTeachers.length && !loading ? <div className="text-slate-400 font-medium">No teachers yet.</div> : null}
            </div>
          </div>

          <div>
            <div className="mono text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Students</div>
            <div className="space-y-3">
              {filteredStudents.map((u) => (
                <div key={u._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-white font-black">{u.name}</div>
                    <div className="text-slate-500 text-sm font-medium">{u.email}</div>
                    <div className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {u.batch?.name ? `Batch ${u.batch.name}` : 'No batch'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={busy === `role:${u._id}`}
                      onClick={() => void setRole(u, 'TEACHER')}
                      className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 border border-white/10 transition-all active:scale-95"
                    >
                      {busy === `role:${u._id}` ? 'Working…' : 'Make Teacher'}
                    </button>
                    <button
                      disabled={busy === `pw:${u._id}`}
                      onClick={() => void resetPassword(u)}
                      className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 border border-white/10 transition-all active:scale-95"
                    >
                      {busy === `pw:${u._id}` ? 'Working…' : 'Reset PW'}
                    </button>
                    <button
                      disabled={busy === `del:${u._id}`}
                      onClick={() => void remove(u)}
                      className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 text-red-200 border border-red-500/20 transition-all active:scale-95"
                    >
                      {busy === `del:${u._id}` ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
              {!filteredStudents.length && !loading ? <div className="text-slate-400 font-medium">No students yet.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

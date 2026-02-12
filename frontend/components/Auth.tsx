
import React, { useEffect, useState } from 'react';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../services/authService';

interface AuthProps {
  onSuccess: (args: { category: Category; user: AuthUser }) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const { login, register, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.COLLEGE);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminInviteKey, setAdminInviteKey] = useState('');
  const [teacherInviteKey, setTeacherInviteKey] = useState('');
  const [accountType, setAccountType] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_category');
      if (stored === Category.SCHOOL || stored === Category.COLLEGE) {
        setSelectedCategory(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let authedUser: AuthUser;
      if (isLogin) {
        authedUser = await login(email, password);
        if (authedUser?.role && authedUser.role !== accountType) {
          try {
            await logout();
          } catch {
            // ignore
          }
          window.alert(`This account is ${authedUser.role}. Please select ${authedUser.role} and sign in again.`);
          setLoading(false);
          return;
        }
      } else {
        const needsInvite = accountType === 'ADMIN' || accountType === 'TEACHER';
        const invite = accountType === 'ADMIN' ? adminInviteKey : teacherInviteKey;
        if (needsInvite && !String(invite || '').trim()) {
          window.alert(`${accountType === 'ADMIN' ? 'Admin' : 'Teacher'} invite key is required.`);
          setLoading(false);
          return;
        }
        authedUser = await register(
          fullName,
          email,
          password,
          accountType === 'ADMIN' ? adminInviteKey : undefined,
          accountType === 'TEACHER' ? teacherInviteKey : undefined
        );
        if (authedUser?.role && authedUser.role !== accountType) {
          try {
            await logout();
          } catch {
            // ignore
          }
          window.alert(`Signup created a ${authedUser.role} account. Please select ${authedUser.role} and sign in again.`);
          setLoading(false);
          return;
        }
      }

      try {
        localStorage.setItem('user_category', selectedCategory);
      } catch {
        // ignore
      }

      onSuccess({ category: selectedCategory, user: authedUser });
    } catch (err: any) {
      const details =
        Array.isArray(err?.data?.errors) && err.data.errors.length
          ? err.data.errors.map((e: any) => e?.message).filter(Boolean).join('\n')
          : '';
      const msg = details || err?.data?.message || err?.message || 'Authentication failed';
      window.alert(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="hero-glow top-0 right-0 opacity-40"></div>
      <div className="hero-glow bottom-0 left-0 !bg-purple-600/10 opacity-30"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-10">
          <div onClick={onBack} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">N</div>
            <span className="text-2xl font-black tracking-tighter text-white">NEX<span className="text-indigo-400">CHAKRA</span></span>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border-white/10 p-10 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              {isLogin ? 'Neural Access' : 'Initialize Track'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? 'Welcome back to the elite pipeline.' : 'Begin your journey to technical dominance.'}
            </p>
          </div>

          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('STUDENT')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${accountType === 'STUDENT' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setAccountType('TEACHER')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${accountType === 'TEACHER' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => setAccountType('ADMIN')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${accountType === 'ADMIN' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
            >
              Admin
            </button>
          </div>

          {accountType === 'STUDENT' ? (
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 mb-8">
              <button
                type="button"
                onClick={() => setSelectedCategory(Category.SCHOOL)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === Category.SCHOOL ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                Alpha (11-12)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory(Category.COLLEGE)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === Category.COLLEGE ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                Delta (Uni/Job)
              </button>
            </div>
          ) : (
            <div className="mb-8 text-center text-[11px] text-slate-500 font-medium">
              Staff accounts are redirected to their workspace after sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  placeholder="Enter your name"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                placeholder="student@nexchakra.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                {isLogin && <a href="#" className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-white">Forgot?</a>}
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              accountType !== 'STUDENT' ? (
                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
                  <div className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    {accountType === 'ADMIN' ? 'Admin (Invite Only)' : 'Teacher (Invite Only)'}
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                      {accountType === 'ADMIN' ? 'Admin Invite Key' : 'Teacher Invite Key'}
                    </label>
                    <input
                      type="password"
                      value={accountType === 'ADMIN' ? adminInviteKey : teacherInviteKey}
                      onChange={(e) => (accountType === 'ADMIN' ? setAdminInviteKey(e.target.value) : setTeacherInviteKey(e.target.value))}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                      placeholder={accountType === 'ADMIN' ? 'Enter admin invite key' : 'Enter teacher invite key'}
                    />
                  </div>
                </div>
              ) : null
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Initializing...
                </span>
              ) : isLogin ? 'Access Station' : 'Initialize Profile'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs font-medium">
              {isLogin ? "New to Nexchakra?" : "Already have an access key?"}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-2 text-indigo-400 font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                {isLogin ? 'Apply Now' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="mt-8 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 mx-auto transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Return to Hub
        </button>
      </div>
    </div>
  );
};

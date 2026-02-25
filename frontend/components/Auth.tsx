
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../services/authService';
import { requestEmailOtp, verifyEmailOtp } from '../services/authService';

interface AuthProps {
  onSuccess: (args: { category: Category; user: AuthUser }) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const { login, register, googleLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.COLLEGE);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminInviteKey, setAdminInviteKey] = useState('');
  const [teacherInviteKey, setTeacherInviteKey] = useState('');
  const [accountType, setAccountType] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');

  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const otpPurpose = 'verify';

  const googleClientId = String((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '').trim();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const googleReadyRef = useRef(false);

  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim()), [email]);

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

  useEffect(() => {
    if (!isLogin) return;
    if (!googleClientId) return;
    if (!googleBtnRef.current) return;

    const w = window as any;
    const ensure = async () => {
      if (w.google?.accounts?.id) return;
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector('script[data-google-identity="1"]') as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error('Google script failed')));
          return;
        }
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.defer = true;
        (s as any).dataset.googleIdentity = '1';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Google script failed'));
        document.head.appendChild(s);
      });
    };

    (async () => {
      if (googleReadyRef.current) return;
      try {
        await ensure();
        if (!googleBtnRef.current) return;
        const gi = (window as any).google?.accounts?.id;
        if (!gi) return;
        gi.initialize({
          client_id: googleClientId,
          callback: async (resp: any) => {
            const credential = String(resp?.credential || '').trim();
            if (!credential) return;
            setLoading(true);
            try {
              const r = await googleLogin(credential);
              if (r?.user) onSuccess({ category: selectedCategory, user: r.user as AuthUser });
            } catch (e: any) {
              window.alert(e?.data?.message || e?.message || 'Google sign-in failed');
            } finally {
              setLoading(false);
            }
          },
        });
        googleBtnRef.current.innerHTML = '';
        const containerWidth = Math.floor(googleBtnRef.current.getBoundingClientRect().width || 360);
        const width = Math.max(220, Math.min(360, containerWidth));
        gi.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width });
        googleReadyRef.current = true;
      } catch {
        // ignore
      }
    })();
  }, [isLogin, googleClientId, googleLogin, onSuccess, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk) {
      window.alert('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const r = await login(email, password);
        if (r?.verificationRequired) {
          setOtpMode(true);
          try {
            await requestEmailOtp({ email, purpose: otpPurpose });
          } catch {
            // ignore
          }
          setLoading(false);
          return;
        }
        if (!r?.user) throw new Error('Login failed');
        onSuccess({ category: selectedCategory, user: r.user });
      } else {
        const needsInvite = accountType === 'ADMIN' || accountType === 'TEACHER';
        const invite = accountType === 'ADMIN' ? adminInviteKey : teacherInviteKey;
        if (needsInvite && !String(invite || '').trim()) {
          window.alert(`${accountType === 'ADMIN' ? 'Admin' : 'Teacher'} invite key is required.`);
          setLoading(false);
          return;
        }
        const r = await register(
          fullName,
          email,
          password,
          accountType,
          accountType === 'ADMIN' ? adminInviteKey : undefined,
          accountType === 'TEACHER' ? teacherInviteKey : undefined
        );
        if (r?.verificationRequired) {
          setOtpMode(true);
          try {
            await requestEmailOtp({ email, purpose: otpPurpose });
          } catch {
            // ignore
          }
          setLoading(false);
          return;
        }
        if (!r?.user) throw new Error('Signup failed');
        onSuccess({ category: selectedCategory, user: r.user });
      }

      try {
        localStorage.setItem('user_category', selectedCategory);
      } catch {
        // ignore
      }

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

  const handleVerifyOtp = async () => {
    if (!emailOk) return window.alert('Enter a valid email first.');
    if (!String(otpCode || '').trim()) return window.alert('Enter the OTP code.');
    setOtpBusy(true);
    try {
      await verifyEmailOtp({ email, code: otpCode, purpose: otpPurpose });
      setOtpMode(false);
      setOtpCode('');
      const r = await login(email, password);
      if (!r?.user) throw new Error('Login failed');
      onSuccess({ category: selectedCategory, user: r.user });
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'OTP verification failed');
    } finally {
      setOtpBusy(false);
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

          {!isLogin && (
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
          )}

          {!isLogin && accountType === 'STUDENT' ? (
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
              {isLogin ? 'Sign in to continue.' : 'Staff accounts are redirected to their workspace after sign in.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {otpMode && (
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
                <div className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Email Verification</div>
                <p className="mt-3 text-slate-400 text-xs font-medium leading-relaxed">
                  Enter the OTP sent to <span className="text-white font-black">{email}</span>. If you don't see it, check spam.
                </p>
                <div className="mt-4 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">OTP Code</label>
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    placeholder="6-digit code"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleVerifyOtp()}
                  disabled={otpBusy}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                >
                  {otpBusy ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
            )}
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-6 pr-20 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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

            {isLogin && googleClientId && (
              <div className="pt-2">
                <div ref={googleBtnRef as any} className="w-full flex justify-center" />
                <p className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                  Or continue with email
                </p>
              </div>
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

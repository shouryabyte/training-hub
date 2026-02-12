import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export const CheckoutResultPage: React.FC = () => {
  const q = useQuery();
  const success = q.get('success') === '1';
  const nav = useNavigate();

  return (
    <div className="px-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Payments</p>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
          {success ? 'Payment Successful' : 'Payment Status'}
        </h1>
        <div className="mt-10 glass-card rounded-[2.5rem] border-white/10 p-10">
          <p className="text-slate-300 font-medium leading-relaxed">
            {success
              ? 'Your payment was completed. You can now continue to your dashboard.'
              : 'If payment was completed, it may take a moment to reflect on your dashboard.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => nav('/dashboard', { replace: true })}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Go to Dashboard
            </button>
            <Link
              to="/plans"
              className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 text-center"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


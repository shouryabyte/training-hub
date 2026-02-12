import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmRazorpay, createCheckout } from '../services/paymentsService';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) return resolve();
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export const CheckoutPage: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const q = useQuery();
  const planId = q.get('planId') || '';
  const [busy, setBusy] = useState(false);

  const startCheckout = async () => {
    if (user?.role && user.role !== 'STUDENT') {
      window.alert('Only student accounts can purchase plans.');
      return;
    }
    setBusy(true);
    try {
      const res = await createCheckout(planId);
      await loadRazorpayScript();
      const rz = new window.Razorpay({
        key: res.keyId,
        amount: res.order.amount,
        currency: res.order.currency,
        name: 'Nexchakra',
        description: `Purchase: ${planId}`,
        order_id: res.order.id,
        handler: async (response: any) => {
          try {
            await confirmRazorpay({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            nav('/dashboard', { replace: true });
          } catch (e: any) {
            window.alert(e?.data?.message || e?.message || 'Payment confirmation failed');
          }
        },
      });
      rz.open();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Checkout • Protected</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Secure Checkout</h1>
          <p className="text-slate-400 mt-4 font-medium">
            Plan: <span className="text-white font-black">{planId || '—'}</span>
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] border-white/10 p-10">
          <p className="text-slate-300 font-medium leading-relaxed">
            You will be redirected to the payment provider. After successful payment, you’ll return and be sent to your dashboard.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              disabled={!planId || busy}
              onClick={() => void startCheckout()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {busy ? 'Initializing…' : 'Proceed to Payment'}
            </button>
            <button
              onClick={() => nav(-1)}
              className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

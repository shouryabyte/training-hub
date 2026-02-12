import React from 'react';
import { Link } from 'react-router-dom';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-slate-950/40 px-6 py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl shadow-indigo-600/20">
              N
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              NEX<span className="text-indigo-400">CHAKRA</span>
            </span>
          </div>
          <p className="text-slate-400 font-medium mt-4 max-w-lg">
            A trust-first learning platform for high-signal skill-building, real projects, and career outcomes.
          </p>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.3em] mt-8">Policies & Compliance</p>
        </div>

        <div>
          <p className="text-white font-black uppercase tracking-widest text-xs mb-4">Company</p>
          <div className="space-y-2 text-sm font-bold">
            <Link className="block text-slate-400 hover:text-white" to="/about">
              About Us
            </Link>
            <Link className="block text-slate-400 hover:text-white" to="/contact">
              Contact Us
            </Link>
            <Link className="block text-slate-400 hover:text-white" to="/support">
              Support / Help
            </Link>
          </div>
        </div>

        <div>
          <p className="text-white font-black uppercase tracking-widest text-xs mb-4">Legal</p>
          <div className="space-y-2 text-sm font-bold">
            <Link className="block text-slate-400 hover:text-white" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="block text-slate-400 hover:text-white" to="/terms">
              Terms & Conditions
            </Link>
            <Link className="block text-slate-400 hover:text-white" to="/refund">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.25em]">
          (c) {new Date().getFullYear()} Nexchakra. All rights reserved.
        </p>
        <p className="text-slate-600 text-xs font-medium">Built for credibility, outcomes, and scale.</p>
      </div>
    </footer>
  );
};

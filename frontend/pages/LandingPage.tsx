import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProgramSection } from '../components/ProgramSection';
import { AICoach } from '../components/AICoach';
import { PricingSection } from '../components/PricingSection';
import { ProductShowcase } from '../components/ProductShowcase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const nav = useNavigate();
  const { token, logout, user } = useAuth();

  const isLoggedIn = Boolean(token);

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white bg-[#020617]">
      <Navbar
        onAuthClick={() => nav('/auth')}
        onLogoClick={() => nav('/')}
        isLoggedIn={isLoggedIn}
        onLogout={() => void logout()}
        onDashboardClick={() => nav(user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student')}
      />

      <main>
        <Hero
          onStartClick={() =>
            isLoggedIn ? nav(user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student') : nav('/auth')
          }
        />
        <section id="stats" className="py-20 px-6 relative border-y border-white/5 bg-slate-950/50">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Elite Students Trained', val: '15,000+' },
              { label: 'Highest Global Package', val: 'ƒ,152 LPA' },
              { label: 'Global Tech Partners', val: '120+' },
              { label: 'AI Labs Simulations', val: '1.2M+' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors duration-500 tabular-nums">
                  {stat.val}
                </div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-slate-400 transition-colors duration-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <ProgramSection />
        <ProductShowcase />
        <AICoach />
        <PricingSection />
      </main>
    </div>
  );
};

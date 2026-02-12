import React, { useMemo } from 'react';

type Kind = 'about' | 'privacy' | 'terms' | 'refund' | 'contact' | 'support';

export const PolicyPage: React.FC<{ kind: Kind }> = ({ kind }) => {
  const { title, body } = useMemo(() => {
    const base = {
      about: {
        title: 'About Us',
        body: `Nexchakra is a trust-first training platform built around real execution.\n\nWe design structured programs (Alpha and Delta) that combine mentorship, clear milestones, and measurable outcomes — so learners build skills by shipping work, not by memorizing.\n\nOur approach is simple:\n- Systems: weekly cadence, checklists, and clear deliverables\n- Mentorship: feedback loops and accountability\n- Outcomes: projects, progress signals, and career-aligned roadmaps`,
      },
      privacy: {
        title: 'Privacy Policy',
        body: `We collect only the data required to operate the platform (account, purchases, and usage).\n\nWe do not sell personal data. We use security best practices to protect accounts and payment flows.\n\nIf you need a copy/export of your data or want deletion, contact support.`,
      },
      terms: {
        title: 'Terms & Conditions',
        body: `By using this platform, you agree to:\n- Provide accurate account information\n- Use the platform responsibly (no abuse, scraping, or disruptive behavior)\n- Follow program and purchase policies\n\nAccounts may be restricted for abuse or fraud attempts.`,
      },
      refund: {
        title: 'Refund Policy',
        body: `Refund eligibility depends on plan terms and access status.\n\nTo request a refund, contact support with:\n- Your email\n- Purchase/order reference\n- The reason for the request\n\nWe respond as quickly as possible with next steps.`,
      },
      contact: {
        title: 'Contact Us',
        body: `For general queries, partnerships, and support:\n\nEmail: support@nexchakra.com\n\nInclude your account email (if applicable) and screenshots for faster resolution.`,
      },
      support: {
        title: 'Support / Help',
        body: `Need help with:\n- Login or access\n- Purchases and plan validity\n- Course visibility or enrollment issues\n- Teacher/Admin workspace access\n\nEmail: support@nexchakra.com\n\nTip: Add your role (Student/Teacher/Admin) and the page URL in your message.`,
      },
    } as const;
    return base[kind];
  }, [kind]);

  return (
    <div className="px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Public</p>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{title}</h1>
        <div className="mt-10 glass-card rounded-[2.5rem] border-white/10 p-10">
          <p className="text-slate-300 font-medium leading-relaxed whitespace-pre-line">{body}</p>
        </div>
      </div>
    </div>
  );
};

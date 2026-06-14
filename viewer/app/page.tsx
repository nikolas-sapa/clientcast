'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Github, ArrowRight, FileText, Bell, CreditCard, Clock, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Toaster, toast } from 'sonner';

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="group flex items-center justify-between bg-black border border-[#2A2A2E] rounded-[6px] px-4 py-3 font-mono text-sm w-full max-w-sm">
      <span className="text-[#8B8D91] select-none mr-2.5">$</span>
      <code className="text-[#F3F2EE] flex-1 text-left">{code}</code>
      <button onClick={copy} className="ml-3 p-1.5 text-[#8B8D91] hover:text-[#F3F2EE] transition-colors">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
};

const STEPS = [
  {
    n: '01',
    title: 'Install and link your project',
    body: 'One global install, one command per project. Clientcast watches your working directory from there.',
    code: 'clientcast init',
    detail: 'Scans your project structure and sets up a private update channel. Takes 30 seconds.',
  },
  {
    n: '02',
    title: 'Push an update',
    body: 'Commit new work. Tag it for your client. Write one line of context. Clientcast handles the rest.',
    code: 'clientcast push "Fixed the checkout flow"',
    detail: 'Your client gets a link — not an email chain, not a Slack thread. A live view of what changed.',
  },
  {
    n: '03',
    title: 'Client reviews on their timeline',
    body: 'They open the link, see exactly what shipped, leave a comment or approve. No account required on their end.',
    code: null,
    detail: 'You get notified the moment they respond. No chasing.',
  },
  {
    n: '04',
    title: 'Invoice on approval',
    body: 'Tie a milestone to their approval. When they click approve, a Stripe invoice goes out automatically.',
    code: 'clientcast invoice --on-approval',
    detail: 'Cash collected. Project moves forward. No awkward "did you get a chance to review?" emails.',
  },
];

const FEATURES = [
  { icon: <Eye size={16} className="text-[#E55A1C]" />, title: 'Live update feed', desc: 'Clients see a timestamped history of everything shipped. No more "what did you do this week?"' },
  { icon: <Bell size={16} className="text-[#E55A1C]" />, title: 'Instant notifications', desc: 'You hear back the moment a client views or responds. No more follow-up emails.' },
  { icon: <CreditCard size={16} className="text-[#E55A1C]" />, title: 'Approval-gated invoicing', desc: 'Tie Stripe invoices to client approval. Get paid when the work is signed off.' },
  { icon: <FileText size={16} className="text-[#E55A1C]" />, title: 'Versioned deliverables', desc: 'Every push is a snapshot. Clients can diff versions. Scope creep gets visible fast.' },
  { icon: <Clock size={16} className="text-[#E55A1C]" />, title: 'No account for clients', desc: 'They open a link. That\'s it. Zero onboarding friction on their side.' },
];

export default function ClientcastLanding() {
  return (
    <div className="min-h-screen selection:bg-[#E55A1C]/30 selection:text-[#E55A1C]">
      <Toaster theme="dark" position="bottom-right" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#0B0B0D]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-[family-name:var(--font-sora)] font-semibold text-lg tracking-tight">
            client<span className="text-[#E55A1C]">cast</span>
          </span>
          <div className="flex items-center gap-5">
            <a href="https://github.com/nikolas-sapa/clientcast" className="text-white/40 hover:text-white transition-colors">
              <Github size={18} />
            </a>
            <CodeBlock code="npm install -g clientcast" />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="pt-40 pb-28 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2A2A2E] bg-[#1A1A1E] text-[10px] uppercase tracking-widest text-[#8B8D91] mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E55A1C]" />
              Beta open
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="font-[family-name:var(--font-sora)] text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6 max-w-3xl"
          >
            Get paid for the work you ship.{' '}
            <span className="text-[#E55A1C]">Not the emails you write.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="text-lg text-white/45 mb-12 max-w-xl leading-relaxed"
          >
            Share a live link instead of writing another status update. Clients see what you shipped,
            approve it, and trigger the invoice — all from one URL.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <CodeBlock code="npm install -g clientcast" />
            <a
              href="#how"
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              See how it works <ArrowRight size={14} />
            </a>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how" className="py-28 px-6 max-w-5xl mx-auto">
          <p className="text-white/25 font-mono text-[10px] tracking-[0.15em] uppercase mb-20 text-center">
            How it works
          </p>

          <div className="space-y-24">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
              >
                <div className="space-y-4">
                  <span className="font-mono text-[#E55A1C] text-sm font-bold">{step.n}</span>
                  <h3 className="font-[family-name:var(--font-sora)] text-2xl font-semibold leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-white/45 leading-relaxed">{step.body}</p>
                  <p className="text-white/30 text-sm leading-relaxed">{step.detail}</p>
                </div>
                <div className="bg-[#1A1A1E] border border-white/[0.06] rounded-[12px] p-7 space-y-4">
                  {step.code ? (
                    <>
                      <div className="font-mono text-[11px] text-[#8B8D91] tracking-widest uppercase mb-4">terminal</div>
                      <div className="flex items-start gap-3 font-mono text-sm">
                        <span className="text-[#E55A1C] select-none mt-0.5">$</span>
                        <code className="text-[#F3F2EE] leading-relaxed">{step.code}</code>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="font-mono text-[11px] text-[#8B8D91] tracking-widest uppercase">client view</div>
                      <div className="space-y-2">
                        {['v0.4.1 shipped', '← Fixed checkout flow', '← Updated API docs', 'Waiting for approval'].map((line, j) => (
                          <div key={j} className={`text-sm font-mono ${j === 3 ? 'text-[#E55A1C]' : 'text-white/40'} ${j === 0 ? 'text-white/70 font-medium' : ''}`}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-28 px-6 max-w-5xl mx-auto border-t border-white/[0.06]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-[12px] overflow-hidden">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#0B0B0D] p-7 space-y-2.5 hover:bg-[#1A1A1E] transition-colors">
                <div className="flex items-center gap-2">
                  {f.icon}
                  <h4 className="font-semibold text-sm">{f.title}</h4>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 max-w-2xl mx-auto text-center space-y-8">
          <h2 className="font-[family-name:var(--font-sora)] text-4xl font-bold tracking-tight">
            Stop writing update emails.
          </h2>
          <p className="text-white/45 leading-relaxed">
            One install. Ship faster. Get paid on approval. No more project management theater.
          </p>
          <CodeBlock code="npm install -g clientcast" />
        </section>
      </main>

      <footer className="py-10 border-t border-white/[0.06] text-center text-sm text-white/25">
        <div className="flex justify-center gap-7 mb-3">
          <a href="https://github.com/nikolas-sapa/clientcast" className="hover:text-white/50 transition-colors">GitHub</a>
          <a href="https://x.com/nikolas_sapa" className="hover:text-white/50 transition-colors">X</a>
        </div>
        <p>Built for freelancers and small teams. &copy; 2026 Clientcast.</p>
      </footer>
    </div>
  );
}

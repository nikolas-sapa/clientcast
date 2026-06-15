'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, ArrowRight, FileText, Bell, CreditCard, Clock, Eye, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Toaster, toast } from 'sonner';

/* ── Palette ── Emerald → Teal on slate-green near-black. Unique to Clientcast. */
const A = '#10B981'; // emerald
const A2 = '#2DD4BF'; // teal

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 75% 50% at 50% 0%, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 50% at 50% 0%, #000 30%, transparent 78%)',
        }}
      />
      <div
        className="absolute -top-48 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full blur-[150px] opacity-55"
        style={{ background: `radial-gradient(ellipse, ${A}33, ${A2}1a 45%, transparent 70%)` }}
      />
    </div>
  );
}

function BlurIn({ text, className, accentFrom }: { text: string; className?: string; accentFrom?: number }) {
  const words = text.split(' ');
  return (
    <h1 className={className}>
      {words.map((w, i) => {
        const accent = accentFrom !== undefined && i >= accentFrom;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mr-[0.28em] inline-block"
            style={accent ? { background: `linear-gradient(135deg, ${A}, ${A2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : undefined}
          >
            {w}
          </motion.span>
        );
      })}
    </h1>
  );
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

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
    <div className="group flex items-center justify-between bg-black/50 border border-white/[0.10] hover:border-[#10B981]/45 rounded-[8px] px-4 py-3 font-mono text-sm w-full max-w-sm transition-colors">
      <span className="select-none mr-2.5" style={{ color: A }}>$</span>
      <code className="text-[#ECF2F0] flex-1 text-left">{code}</code>
      <button onClick={copy} className="ml-3 p-1.5 text-white/40 transition-colors" style={{ color: copied ? A : undefined }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
};

const STEPS = [
  { n: '01', title: 'Install and link your project', body: 'One global install, one command per project. Clientcast watches your working directory from there.', code: 'clientcast init', detail: 'Scans your project structure and sets up a private update channel. Takes 30 seconds.' },
  { n: '02', title: 'Push an update', body: 'Commit new work. Tag it for your client. Write one line of context. Clientcast handles the rest.', code: 'clientcast push "Fixed the checkout flow"', detail: 'Your client gets a link — not an email chain, not a Slack thread. A live view of what changed.' },
  { n: '03', title: 'Client reviews on their timeline', body: 'They open the link, see exactly what shipped, leave a comment or approve. No account required on their end.', code: null, detail: 'You get notified the moment they respond. No chasing.' },
  { n: '04', title: 'Invoice on approval', body: 'Tie a milestone to their approval. When they click approve, a Stripe invoice goes out automatically.', code: 'clientcast invoice --on-approval', detail: 'Cash collected. Project moves forward. No awkward "did you get a chance to review?" emails.' },
];

const FEATURES = [
  { icon: Eye, title: 'Live update feed', desc: 'Clients see a timestamped history of everything shipped. No more "what did you do this week?"' },
  { icon: Bell, title: 'Instant notifications', desc: 'You hear back the moment a client views or responds. No more follow-up emails.' },
  { icon: CreditCard, title: 'Approval-gated invoicing', desc: 'Tie Stripe invoices to client approval. Get paid when the work is signed off.' },
  { icon: FileText, title: 'Versioned deliverables', desc: 'Every push is a snapshot. Clients can diff versions. Scope creep gets visible fast.' },
  { icon: Clock, title: 'No account for clients', desc: 'They open a link. That\'s it. Zero onboarding friction on their side.' },
];

export default function ClientcastLanding() {
  return (
    <div className="relative min-h-screen bg-[#0A0F0E] text-[#ECF2F0] selection:bg-[#10B981]/30 selection:text-white">
      <Backdrop />
      <Toaster theme="dark" position="bottom-right" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#0A0F0E]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-[family-name:var(--font-sora)] font-semibold text-lg tracking-tight">
            client<span style={{ background: `linear-gradient(135deg, ${A}, ${A2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>cast</span>
          </span>
          <div className="flex items-center gap-5">
            <a href="https://github.com/nikolas-sapa/clientcast" className="text-white/40 hover:text-white transition-colors font-mono text-xs tracking-wide">GitHub</a>
            <CodeBlock code="npm install -g clientcast" />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="pt-44 pb-28 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] pl-3 pr-2 py-1 text-[11px] uppercase tracking-[0.12em] font-mono text-white/55 mb-10">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: A }} />
              Beta open
              <ChevronRight size={13} className="text-white/30" />
            </div>
          </motion.div>

          <BlurIn
            text="Get paid for the work you ship. Not the emails you write."
            className="font-[family-name:var(--font-sora)] text-5xl md:text-[4rem] font-bold tracking-[-0.025em] leading-[1.04] mb-6 max-w-3xl"
            accentFrom={8}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-lg text-white/50 mb-12 max-w-xl leading-relaxed"
          >
            Share a live link instead of writing another status update. Clients see what you shipped,
            approve it, and trigger the invoice — all from one URL.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <CodeBlock code="npm install -g clientcast" />
            <a href="#how" className="group flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors">
              See how it works <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how" className="py-28 px-6 max-w-5xl mx-auto">
          <motion.p {...reveal} className="text-white/25 font-mono text-[10px] tracking-[0.18em] uppercase mb-20 text-center">How it works</motion.p>

          <div className="space-y-24">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                {...reveal}
                className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold" style={{ color: A }}>{step.n}</span>
                    <span className="h-px w-10" style={{ background: `${A}55` }} />
                  </div>
                  <h3 className="font-[family-name:var(--font-sora)] text-2xl font-semibold leading-tight tracking-tight">{step.title}</h3>
                  <p className="text-white/45 leading-relaxed">{step.body}</p>
                  <p className="text-white/30 text-sm leading-relaxed">{step.detail}</p>
                </div>
                <div className="relative bg-white/[0.02] border border-white/[0.07] rounded-[14px] p-7 space-y-4 overflow-hidden">
                  <div aria-hidden className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${A}, transparent 55%)` }} />
                  {step.code ? (
                    <>
                      <div className="font-mono text-[11px] text-white/35 tracking-widest uppercase mb-4">terminal</div>
                      <div className="flex items-start gap-3 font-mono text-sm">
                        <span className="select-none mt-0.5" style={{ color: A }}>$</span>
                        <code className="text-[#ECF2F0] leading-relaxed">{step.code}</code>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="font-mono text-[11px] text-white/35 tracking-widest uppercase">client view</div>
                      <div className="space-y-2">
                        {['v0.4.1 shipped', '← Fixed checkout flow', '← Updated API docs', 'Waiting for approval'].map((line, j) => (
                          <div key={j} className={`text-sm font-mono ${j === 0 ? 'text-white/70 font-medium' : 'text-white/40'}`} style={j === 3 ? { color: A } : undefined}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-28 px-6 max-w-5xl mx-auto border-t border-white/[0.06]">
          <motion.div {...reveal} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-[16px] overflow-hidden">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group bg-[#0A0F0E] p-7 space-y-3 hover:bg-white/[0.025] transition-colors">
                  <span className="grid place-items-center w-9 h-9 rounded-lg border border-white/[0.08] transition-transform group-hover:-translate-y-0.5" style={{ background: `${A}1a`, color: A }}>
                    <Icon size={16} />
                  </span>
                  <h4 className="font-semibold text-sm">{f.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <motion.div {...reveal} className="relative max-w-2xl mx-auto text-center space-y-8 rounded-[24px] border border-white/[0.08] bg-white/[0.02] px-8 py-14 overflow-hidden">
            <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 h-[340px] w-[520px] rounded-full blur-[120px]" style={{ background: `radial-gradient(ellipse, ${A}2e, ${A2}1a 50%, transparent 70%)` }} />
            <h2 className="relative font-[family-name:var(--font-sora)] text-4xl font-bold tracking-[-0.02em]">Stop writing update emails.</h2>
            <p className="relative text-white/45 leading-relaxed">One install. Ship faster. Get paid on approval. No more project management theater.</p>
            <div className="relative flex justify-center"><CodeBlock code="npm install -g clientcast" /></div>
          </motion.div>
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

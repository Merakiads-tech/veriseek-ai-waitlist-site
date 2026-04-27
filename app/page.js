'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/* ---------- Shared ---------- */
const LOGO_URL =
  'https://customer-assets.emergentagent.com/job_c69f7639-496b-4def-ace7-638ad3d76a8c/artifacts/x8zu891m_veriseek-logo%20%281%29%20%281%29.png';

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim());

/* Intersection observer helper: add `vs-in` when visible */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.vs-fade'));
    // Immediately reveal anything already in viewport (fallback for IO edge cases)
    const vh = window.innerHeight || 800;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) {
        el.classList.add('vs-in');
      }
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vs-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- Logo (uses uploaded PNG on dark bgs, wordmark fallback on light) ---------- */
function Logo({ variant = 'dark' }) {
  // On dark navy background — just use the uploaded PNG
  if (variant === 'dark') {
    return (
      <div className="flex items-center">
        <img
          src={LOGO_URL}
          alt="VeriSeek"
          className="h-8 md:h-9 w-auto select-none"
          draggable={false}
        />
      </div>
    );
  }
  // Light background fallback — SVG wordmark
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="11" stroke="#01B5B6" strokeWidth="2.5" />
        <path d="M9.5 14.5l3.2 3.2 6.8-6.8" stroke="#003049" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="22" y1="22" x2="28" y2="28" stroke="#01B5B6" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-[20px] font-bold tracking-tight">
        <span style={{ color: '#003049' }}>Veri</span>
        <span style={{ color: '#01B5B6' }}>Seek</span>
      </span>
    </div>
  );
}

/* ---------- Section 1: Sticky Nav (capsule) ---------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Demo', id: 'demo' },
    { label: 'Features', id: 'features' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Contact Us', id: 'contact' },
  ];

  return (
    <div className="fixed top-3 md:top-5 left-0 right-0 z-50 flex justify-center px-3">
      <nav
        className={`w-full max-w-6xl rounded-full border transition-all duration-300 ${
          scrolled ? 'vs-nav-scrolled' : ''
        }`}
        style={{
          background: scrolled ? 'rgba(0,48,73,0.85)' : '#003049',
          borderColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex items-center justify-between pl-4 pr-2 md:pl-6 md:pr-2 py-2">
          {/* Logo */}
          <a href="#home" onClick={scrollTo('home')} className="shrink-0">
            <Logo variant="dark" />
          </a>

          {/* Center links (desktop) */}
          <ul className="hidden lg:flex items-center gap-7 text-[14px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {navLinks.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={scrollTo(l.id)}
                  className="hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right action pills */}
          <div className="flex items-center gap-2">
            <a
              href="#survey"
              onClick={scrollTo('survey')}
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 md:px-5 py-2.5 text-[13px] font-semibold text-white"
              style={{ background: '#0D1F2D', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Get Started Free <span aria-hidden>→</span>
            </a>
            <a
              href="#survey"
              onClick={scrollTo('survey')}
              className="inline-flex items-center gap-2 rounded-full px-4 md:px-5 py-2.5 text-[13px] font-semibold vs-btn-teal"
            >
              Join Waitlist <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

/* ---------- Reusable Glass Email Form ---------- */
function EmailCTA({ placeholder, buttonLabel, source, tone = 'dark', successMsg }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | duplicate | error | invalid
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;
    if (!isValidEmail(email)) {
      setStatus('invalid');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const { error } = await supabase
        .from('waitlist_emails')
        .insert([{ email: email.trim().toLowerCase(), source }]);
      if (error) {
        if (error.code === '23505' || /duplicate/i.test(error.message)) {
          setStatus('duplicate');
          setMessage("You're already on the list!");
          return;
        }
        throw error;
      }
      setStatus('success');
      setMessage(successMsg || "You're on the list! We'll be in touch at launch.");
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  if (status === 'success' || status === 'duplicate') {
    return (
      <div className="max-w-[460px] mx-auto">
        <div
          className="rounded-xl px-5 py-4 text-center text-[15px]"
          style={{
            background: 'rgba(1,181,182,0.12)',
            border: '1px solid rgba(1,181,182,0.35)',
            color: '#01B5B6',
          }}
        >
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[460px] mx-auto w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 12,
          padding: '6px 6px 6px 18px',
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'invalid' || status === 'error') setStatus('idle');
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none border-0 text-white placeholder:text-white/40 py-2.5 text-[15px]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="vs-btn-teal rounded-lg px-5 py-2.5 text-[14px] font-semibold whitespace-nowrap"
        >
          {status === 'loading' ? 'Saving…' : buttonLabel}
        </button>
      </form>
      {status === 'invalid' && (
        <p className="mt-2 text-center text-[13px]" style={{ color: '#EF4444' }}>
          {message}
        </p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-center text-[13px]" style={{ color: '#EF4444' }}>
          {message}
        </p>
      )}
    </div>
  );
}

/* ---------- Section 2: Hero ---------- */
function Hero() {
  return (
    <section
      id="home"
      className="relative w-full flex items-center justify-center px-4"
      style={{
        minHeight: '92vh',
        background: '#003049',
        backgroundImage:
          'radial-gradient(ellipse 65% 50% at 50% -5%, rgba(1,181,182,0.14) 0%, transparent 65%), radial-gradient(ellipse 35% 30% at 85% 85%, rgba(255,255,255,0.02) 0%, transparent 60%)',
        paddingTop: 140,
        paddingBottom: 100,
      }}
    >
      <div className="w-full max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <div
          className="vs-fade inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
          style={{
            background: 'rgba(1,181,182,0.12)',
            border: '1px solid rgba(1,181,182,0.3)',
          }}
        >
          <span
            className="vs-pulse inline-block w-2 h-2 rounded-full"
            style={{ background: '#01B5B6' }}
          />
          <span className="text-[12px] tracking-wide font-medium" style={{ color: '#01B5B6' }}>
            Coming Soon · Be First in Line
          </span>
        </div>

        {/* H1 */}
        <h1
          className="vs-fade font-serif-display text-white leading-[1.1] mb-6"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700 }}
        >
          You ordered it.
          <br />
          You loved the reviews.
          <br />
          Then it arrived — and{' '}
          <span style={{ color: '#01B5B6', fontStyle: 'italic' }}>your heart sank.</span>
        </h1>

        {/* Hook line */}
        <p className="vs-fade mb-4 text-[18px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Sound familiar? You&apos;re not alone — and it&apos;s not your fault.
        </p>

        {/* Subline */}
        <p
          className="vs-fade mx-auto mb-10 text-[15px]"
          style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 480, lineHeight: 1.65 }}
        >
          Millions of buying decisions happen every day based on reviews that were never real to
          begin with.
        </p>

        {/* Email CTA */}
        <div className="vs-fade">
          <EmailCTA
            placeholder="Enter your email address"
            buttonLabel="Join the Waitlist"
            source="hero_cta"
            successMsg="You're on the list! We'll be in touch at launch."
          />
          <p className="mt-4 text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No spam. No commitments. Just early access when we launch.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 3: Stats Strip ---------- */
function useCountUp(to, duration = 1500, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, start]);
  return val;
}

function StatsStrip() {
  const ref = useRef(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setGo(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const n1 = useCountUp(98, 1500, go);
  const n3 = useCountUp(152, 1500, go);
  const n4 = useCountUp(11, 1500, go);

  const Stat = ({ value, label, isLast }) => (
    <div
      className="flex-1 px-4 md:px-6 py-6 text-center"
      style={{ borderRight: isLast ? 'none' : '1px solid #E8F0F0' }}
    >
      <div
        className="font-serif-display mb-2"
        style={{ fontSize: 'clamp(30px, 4vw, 44px)', color: '#01B5B6', lineHeight: 1 }}
      >
        {value}
      </div>
      <div className="text-[13px]" style={{ color: '#64748B', lineHeight: 1.5 }}>
        {label}
      </div>
    </div>
  );

  return (
    <section id="stats" className="bg-white py-20 md:py-24 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <p
          className="vs-fade text-center text-[12px] font-semibold tracking-[0.2em] mb-10"
          style={{ color: '#01B5B6' }}
        >
          THE NUMBERS DON&apos;T LIE
        </p>

        <div className="vs-fade grid grid-cols-2 md:grid-cols-4">
          <Stat value={`${n1}%`} label="of online reviews show signs of manipulation" />
          <Stat value="4 in 5" label="shoppers regret a purchase after trusting reviews" />
          <Stat value={`$${n3}B`} label="lost annually to misleading product claims" />
          <Stat value={`${n4} min`} label="wasted per purchase researching reviews" isLast />
        </div>

        <div
          className="vs-fade mt-10 rounded-xl text-center text-[15px] px-6 py-4 mx-auto"
          style={{ background: '#F0FAFA', color: '#1A1A2E', maxWidth: 760 }}
        >
          The review system wasn&apos;t built for you.{' '}
          <span style={{ fontWeight: 700, color: '#003049' }}>VeriSeek was.</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 4: Problem List ---------- */
function ProblemList() {
  const problems = [
    {
      iconBg: '#FEE2E2',
      stroke: '#DC2626',
      icon: (s) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      title: 'Fake, paid & biased reviews',
      desc: "Brands pay for 5-star reviews. Competitors pay for 1-star ones. The whole system is for sale — and you're the one paying the price.",
    },
    {
      iconBg: '#FEF3C7',
      stroke: '#D97706',
      icon: (s) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2" />
        </svg>
      ),
      title: "Reviews that don't match your needs",
      desc: 'A product can have 4.8 stars and still be completely wrong for your use case, budget, or lifestyle. Generic ratings tell you nothing personal.',
    },
    {
      iconBg: '#DBEAFE',
      stroke: '#2563EB',
      icon: (s) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
      title: 'Conflicting reviews create paralysis',
      desc: "500 reviews saying opposite things don't help you decide — they just exhaust you. More information, less clarity.",
    },
    {
      iconBg: '#F1F5F9',
      stroke: '#64748B',
      icon: (s) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      title: 'Critical details are always missing',
      desc: 'Reliability after 6 months? Customer support quality? Return experience? Reviews never tell you what actually matters most.',
    },
    {
      iconBg: '#E0F9F9',
      stroke: '#007A7B',
      icon: (s) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      title: 'Inflated ratings hide real drawbacks',
      desc: 'Herd mentality pushes mediocre products to 4+ stars. The real flaws get buried on page 7 — where nobody reads.',
    },
  ];

  return (
    <section id="features" className="py-24 px-4" style={{ background: '#E8FAFA' }}>
      <div className="max-w-[780px] mx-auto">
        <p
          className="vs-fade text-center text-[12px] font-semibold tracking-[0.2em] mb-4"
          style={{ color: '#01B5B6' }}
        >
          WHY REVIEWS ARE BROKEN
        </p>
        <h2
          className="vs-fade text-center font-serif-display mb-5"
          style={{ color: '#003049', fontSize: 'clamp(26px, 3.4vw, 36px)', lineHeight: 1.2, fontWeight: 600 }}
        >
          You&apos;re spending hours reading reviews,
          <br />
          feeling less confident — and still making the wrong choice.
        </h2>
        <p
          className="vs-fade text-center mb-12 text-[15px]"
          style={{ color: '#64748B' }}
        >
          Here&apos;s why the current system is costing you money, time, and trust.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {problems.map((p, i) => (
            <div
              key={i}
              className={`vs-fade vs-card bg-white rounded-[14px] p-5 ${i === 4 ? 'md:col-span-2' : ''}`}
              style={{ border: '1px solid #E2EEF0', transitionDelay: `${i * 80}ms` }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
                style={{ background: p.iconBg }}
              >
                {p.icon(p.stroke)}
              </div>
              <h3 className="text-[16px] font-semibold mb-2" style={{ color: '#003049' }}>
                {p.title}
              </h3>
              <p className="text-[14px]" style={{ color: '#64748B', lineHeight: 1.65 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Closing callout */}
        <div
          className="vs-fade mt-8 px-5 py-4 text-[15px]"
          style={{
            background: '#E0F9F9',
            borderLeft: '3px solid #01B5B6',
            borderRadius: '0 10px 10px 0',
            color: '#003049',
          }}
        >
          Make informed decisions you can trust — VeriSeek cuts through the noise to give you what
          actually matters.
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 5: Why VeriSeek ---------- */
function WhyVeriSeek() {
  const cards = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#01B5B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.39 6.94H22l-5.81 4.22L18.18 22 12 17.77 5.82 22l1.99-8.84L2 8.94h7.61L12 2z" />
        </svg>
      ),
      title: 'AI-Verified Authenticity',
      desc: 'Every review on VeriSeek is screened by our AI before it reaches you. Fake reviews, incentivised posts, and paid placements are filtered out — what you read is genuinely real.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#01B5B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      title: 'Personalised to You',
      desc: 'Unlike generic star ratings, VeriSeek matches reviews to your priorities. Care about durability? We surface that. Budget-conscious? We flag the value picks. Your needs drive what you see.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#01B5B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8 4v6c0 5-3.5 9.3-8 10-4.5-.7-8-5-8-10V6l8-4z" />
        </svg>
      ),
      title: 'Privacy by Design',
      desc: 'We never sell or share your data. VeriSeek is built from the ground up with privacy-first principles — because the platform built to protect your trust should also protect your data.',
    },
  ];

  return (
    <section id="demo" className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div>
          <p
            className="vs-fade text-[12px] font-semibold tracking-[0.2em] mb-4"
            style={{ color: '#01B5B6' }}
          >
            OUR MISSION
          </p>
          <h2
            className="vs-fade font-serif-display mb-6"
            style={{ color: '#003049', fontSize: 'clamp(26px, 3.4vw, 40px)', lineHeight: 1.2, fontWeight: 600 }}
          >
            We didn&apos;t build VeriSeek to compete with reviews.
            <br />
            We built it to replace the need for them.
          </h2>
          <p className="vs-fade text-[16px]" style={{ color: '#64748B', lineHeight: 1.8 }}>
            At VeriSeek, we believe every person deserves to buy with confidence — not anxiety. We
            use AI-powered analysis to verify authenticity, surface what actually matters for your
            specific needs, and give you a clear, honest picture of any product before you spend a
            single rupee or dollar on it. No noise. No hidden agendas. Just truth you can act on.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {cards.map((c, i) => (
            <div
              key={i}
              className="vs-fade vs-card bg-white rounded-[14px] p-5"
              style={{ border: '1px solid #E2EEF0', transitionDelay: `${i * 90}ms` }}
            >
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-3"
                style={{ background: '#E0F9F9' }}
              >
                {c.icon}
              </div>
              <h3 className="text-[17px] font-semibold mb-2" style={{ color: '#003049' }}>
                {c.title}
              </h3>
              <p className="text-[14px]" style={{ color: '#64748B', lineHeight: 1.7 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 6: Survey + Waitlist ---------- */
const QUESTIONS = [
  {
    q: 'Before making an online purchase, how much time do you typically spend reading reviews?',
    options: [
      'I barely check reviews — I just buy',
      '5–10 minutes, quick scan',
      '15–30 minutes across multiple platforms',
      'Over 30 minutes — I research deeply before buying',
    ],
  },
  {
    q: 'Have you ever bought something with great reviews and then been disappointed?',
    options: [
      'Never — my purchases always match expectations',
      'Once or twice — but not a big deal',
      "Yes, several times — it's genuinely frustrating",
      "All the time — I've almost stopped trusting reviews",
    ],
  },
  {
    q: 'How much do you currently trust online product reviews?',
    options: [
      'Completely — I take them at face value',
      'Mostly, but I cross-check across multiple platforms',
      "I'm sceptical — I know many reviews are fake",
      "I don't trust them at all anymore",
    ],
  },
  {
    q: 'Where do you usually check reviews before buying? Choose your primary source.',
    options: [
      'Amazon / Flipkart / e-commerce product pages',
      'Google reviews or search results',
      'Social media / YouTube / influencer recommendations',
      'Dedicated review sites (G2, Trustpilot, Reddit, etc.)',
    ],
  },
  {
    q: 'If a tool could verify review authenticity and personalise results to your needs, how likely are you to use it?',
    options: [
      'Not really interested — I manage fine on my own',
      "I'd try it once to see how it works",
      "Yes, I'd use it regularly if it actually worked",
      'Absolutely — I\u2019d switch immediately and recommend it',
    ],
  },
];

function SurveySection() {
  // step: 0..4 = questions, 5 = email, 6 = success
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([null, null, null, null, null]);
  const [transitioning, setTransitioning] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const selectOption = (opt) => {
    const next = [...answers];
    next[step] = opt;
    setAnswers(next);
  };

  const goNext = () => {
    if (step < 5 && answers[step] == null) return;
    setTransitioning(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setTransitioning(false);
    }, 180);
  };

  const goBack = () => {
    if (step === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setTransitioning(false);
    }, 180);
  };

  async function submitSurvey(e) {
    e.preventDefault();
    if (status === 'loading') return;
    if (!isValidEmail(email)) {
      setStatus('invalid');
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        q1_answer: answers[0],
        q2_answer: answers[1],
        q3_answer: answers[2],
        q4_answer: answers[3],
        q5_answer: answers[4],
        source: 'waitlist_page',
      };
      const { error } = await supabase.from('waitlist_responses').insert([payload]);
      if (error) throw error;
      setStatus('success');
      setStep(6);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  }

  return (
    <section id="survey" className="py-24 px-4" style={{ background: '#003049' }}>
      <div className="max-w-[660px] mx-auto">
        <p
          className="vs-fade text-center text-[12px] font-semibold tracking-[0.2em] mb-4"
          style={{ color: '#01B5B6' }}
        >
          HELP US BUILD BETTER
        </p>
        <h2
          className="vs-fade text-center font-serif-display text-white mb-5"
          style={{ fontSize: 'clamp(26px, 3.4vw, 38px)', lineHeight: 1.2, fontWeight: 600 }}
        >
          Take 60 seconds. Shape the future of honest shopping.
        </h2>
        <p
          className="vs-fade text-center mb-12 text-[15px]"
          style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}
        >
          Answer 5 quick questions about your experience with online reviews — then join the
          waitlist. Your responses directly shape how VeriSeek works.
        </p>

        {/* Progress bar */}
        {step <= 5 && (
          <div className="vs-fade flex gap-2 mb-8">
            {[0, 1, 2, 3, 4].map((i) => {
              const filled = step > i || (step === i && answers[i] != null);
              const active = step === i;
              return (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${active ? 'vs-progress-active' : ''}`}
                  style={{
                    background: filled || step > i ? '#01B5B6' : 'rgba(255,255,255,0.1)',
                    transition: 'background 300ms ease, box-shadow 300ms ease',
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="relative">
          {/* Question steps */}
          {step < 5 && (
            <div className={transitioning ? 'vs-q-out' : 'vs-q-in'}>
              <div className="text-[13px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Question {step + 1} of 5
              </div>
              <h3
                className="font-serif-display text-white mb-6"
                style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', lineHeight: 1.3 }}
              >
                {QUESTIONS[step].q}
              </h3>

              <div className="flex flex-col gap-3">
                {QUESTIONS[step].options.map((opt, idx) => {
                  const selected = answers[step] === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectOption(opt)}
                      className="text-left flex items-center gap-3 rounded-[10px] px-4 py-3 transition-all"
                      style={{
                        background: selected ? 'rgba(1,181,182,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${selected ? '#01B5B6' : 'rgba(255,255,255,0.1)'}`,
                        minHeight: 52,
                        color: 'white',
                      }}
                      onMouseEnter={(e) => {
                        if (!selected)
                          e.currentTarget.style.borderColor = 'rgba(1,181,182,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        if (!selected)
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: selected ? '#01B5B6' : 'transparent',
                          border: `2px solid ${selected ? '#01B5B6' : 'rgba(255,255,255,0.3)'}`,
                        }}
                      >
                        {selected && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: '#fff' }}
                          />
                        )}
                      </span>
                      <span className="text-[15px]">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="text-[14px] px-2 py-2 transition-opacity"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    visibility: step === 0 ? 'hidden' : 'visible',
                  }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={answers[step] == null}
                  className="vs-btn-teal rounded-lg px-6 py-2.5 text-[14px] font-semibold"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Email step */}
          {step === 5 && (
            <div className={transitioning ? 'vs-q-out' : 'vs-q-in'}>
              <h3
                className="font-serif-display text-white mb-4 text-center"
                style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.25 }}
              >
                Almost done — you&apos;re making an impact.
              </h3>
              <p
                className="text-center mb-8 text-[15px]"
                style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}
              >
                Enter your email so we can send you the survey results and notify you when
                VeriSeek launches. We&apos;ll use your responses to build a platform that actually
                solves what you described.
              </p>

              <form
                onSubmit={submitSurvey}
                className="flex items-center max-w-[460px] mx-auto"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '6px 6px 6px 18px',
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'invalid' || status === 'error') setStatus('idle');
                  }}
                  placeholder="Your email address"
                  className="flex-1 bg-transparent outline-none border-0 text-white placeholder:text-white/40 py-2.5 text-[15px]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="vs-btn-teal rounded-lg px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap"
                >
                  {status === 'loading' ? 'Saving…' : 'Submit & Join'}
                </button>
              </form>

              {(status === 'invalid' || status === 'error') && (
                <p className="mt-3 text-center text-[13px]" style={{ color: '#EF4444' }}>
                  {errorMsg}
                </p>
              )}

              <p
                className="mt-5 text-center text-[12px]"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Your survey responses and email are saved securely. No spam, ever. Unsubscribe
                anytime.
              </p>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-[14px]"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Success step */}
          {step === 6 && (
            <div className="text-center vs-q-in">
              <div className="flex justify-center mb-6">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke="#01B5B6"
                    strokeWidth="3"
                    fill="rgba(1,181,182,0.08)"
                    className="vs-check-circle"
                  />
                  <path
                    d="M22 37 L32 47 L52 27"
                    stroke="#01B5B6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    className="vs-check-path"
                  />
                </svg>
              </div>
              <h3
                className="font-serif-display text-white mb-4"
                style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}
              >
                You&apos;re on the list!
              </h3>
              <p
                className="text-[15px] max-w-md mx-auto"
                style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}
              >
                Thank you for taking the time to share your experience. We&apos;ll be in touch
                when VeriSeek launches — and we&apos;ll use what you shared to build something
                that truly works for you.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 7: Why Shoppers Trust VeriSeek ---------- */
function TrustSection() {
  const cards = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#01B5B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      title: 'AI-Driven Authenticity',
      body: 'Every review is screened by our AI before you ever see it. Fake reviews, paid placements, and incentivised posts are eliminated at the source — leaving only genuine insights you can actually rely on.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#01B5B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8 4v6c0 5-3.5 9.3-8 10-4.5-.7-8-5-8-10V6l8-4z" />
        </svg>
      ),
      title: 'Data Privacy First',
      body: 'We never sell, share, or monetise your personal data. VeriSeek is architected on privacy-by-design principles so your trust in us extends to how we handle your information — always.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#01B5B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      title: 'External Validation',
      body: "Our algorithms and review-scoring methodology are built to be auditable. We don't ask you to trust us blindly — we're designed to be independently verifiable from day one.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#01B5B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7L9 18l-5-5" />
        </svg>
      ),
      title: 'Real Accountability',
      body: 'We welcome external audits, specialist feedback, and community contributions to keep our operations honest, equitable, and dependable — not just at launch, but always.',
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4" style={{ background: '#E8FAFA' }}>
      <div className="max-w-[820px] mx-auto">
        <p
          className="vs-fade text-center text-[12px] font-semibold tracking-[0.2em] mb-4"
          style={{ color: '#01B5B6' }}
        >
          BUILT DIFFERENT
        </p>
        <h2
          className="vs-fade text-center font-serif-display mb-5"
          style={{ color: '#003049', fontSize: 'clamp(26px, 3.4vw, 38px)', lineHeight: 1.2, fontWeight: 600 }}
        >
          See why shoppers trust <span style={{ color: '#01B5B6' }}>VeriSeek</span>
        </h2>
        <p
          className="vs-fade text-center mb-12 text-[15px]"
          style={{ color: '#64748B', lineHeight: 1.7 }}
        >
          We don&apos;t ask you to take our word for it.
          <br />
          We&apos;re built to be independently verifiable from day one.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((c, i) => (
            <div
              key={i}
              className="vs-fade vs-card rounded-[14px] p-6"
              style={{
                background: '#003049',
                border: '1px solid rgba(1,181,182,0.15)',
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-4"
                style={{ background: 'rgba(1,181,182,0.12)' }}
              >
                {c.icon}
              </div>
              <h3 className="text-[15px] font-semibold mb-2 text-white">{c.title}</h3>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 8: Final CTA ---------- */
function FinalCTA() {
  return (
    <section id="faq" className="px-4 py-24" style={{ background: '#0D1F2D' }}>
      <div className="max-w-[600px] mx-auto text-center">
        <div
          className="vs-fade inline-block rounded-full px-3 py-1 mb-6 text-[11px] font-semibold tracking-[0.18em] uppercase"
          style={{
            background: 'rgba(1,181,182,0.12)',
            color: '#01B5B6',
            border: '1px solid rgba(1,181,182,0.3)',
          }}
        >
          Don&apos;t Gamble With Your Next Purchase
        </div>

        <h2
          className="vs-fade font-serif-display text-white mb-5"
          style={{ fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.15, fontWeight: 700 }}
        >
          Tired of gambling
          <br />
          with your <span style={{ color: '#01B5B6' }}>money?</span>
        </h2>

        <p
          className="vs-fade mx-auto mb-10 text-[16px]"
          style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 520, lineHeight: 1.7 }}
        >
          Thousands of shoppers are already on the list.
          <br />
          Founder-tier early access is completely free — and closes at launch.
        </p>

        <div className="vs-fade">
          <EmailCTA
            placeholder="Your email address"
            buttonLabel="Claim My Early Access"
            source="footer_cta"
            successMsg="You're on the list! We'll be in touch at launch."
          />
        </div>

        <p className="mt-6 text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          No credit card · No spam · Cancel anytime · Join 2,400+ on the waitlist
        </p>
      </div>
    </section>
  );
}

/* ---------- Section 9: Footer ---------- */
function Footer() {
  return (
    <footer id="contact" className="px-6 md:px-10 py-8" style={{ background: '#003049', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo variant="dark" />
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2026 VeriSeek · Truth you can act on.
          </span>
        </div>
        <ul className="flex flex-wrap items-center gap-4 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <li><a href="#" className="hover:text-white transition-colors">About</a></li>
          <li aria-hidden>·</li>
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          <li aria-hidden>·</li>
          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          <li aria-hidden>·</li>
          <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
        </ul>
        <div className="text-[12px] font-semibold" style={{ color: '#01B5B6' }}>veriseek.ai</div>
      </div>
    </footer>
  );
}

/* ---------- App ---------- */
function App() {
  useReveal();
  return (
    <main className="overflow-x-hidden">
      <Nav />
      <Hero />
      <StatsStrip />
      <ProblemList />
      <WhyVeriSeek />
      <SurveySection />
      <TrustSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}

export default App;

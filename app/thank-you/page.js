'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

/* ---------- Logo (same as landing page) ---------- */
function Logo({ size = 'lg' }) {
  const sizes = { md: { icon: 26, text: 22 }, lg: { icon: 36, text: 30 } };
  const s = sizes[size] || sizes.lg;
  return (
    <div className="flex items-center gap-2 select-none" aria-label="VeriSeek">
      <svg width={s.icon} height={s.icon} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="13.5" cy="13.5" r="10.5" stroke="#003049" strokeWidth="2.3" fill="none" />
        <path
          d="M8.8 13.8 l3.4 3.4 l7.2 -7.2"
          stroke="#01B5B6"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="21.2" y1="21.2" x2="27.5" y2="27.5" stroke="#01B5B6" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="font-bold tracking-tight leading-none" style={{ fontSize: s.text }}>
        <span style={{ color: '#FFFFFF' }}>Veri</span>
        <span style={{ color: '#01B5B6' }}>Seek</span>
      </span>
    </div>
  );
}

export default function ThankYouPage() {
  // Fire a Meta Pixel "Lead" conversion event on this page (in addition to
  // the PageView already fired by the global pixel in app/layout.js).
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'Lead');
      } catch (e) {
        // no-op
      }
    }
  }, []);

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16"
      style={{
        background: '#003049',
        backgroundImage:
          'radial-gradient(ellipse 65% 50% at 50% -5%, rgba(1,181,182,0.18) 0%, transparent 65%), radial-gradient(ellipse 35% 30% at 85% 90%, rgba(1,181,182,0.06) 0%, transparent 60%)',
      }}
    >
      {/* Inline noscript pixel fallback specifically for /thank-you (in case JS is off) */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=1304756355125527&ev=Lead&noscript=1"
          alt=""
        />
      </noscript>

      {/* Defensive fallback: also fire the Lead event via inline script in case
          the layout pixel hasn't fully booted on first paint. */}
      <Script id="meta-pixel-lead" strategy="afterInteractive">
        {`
          (function tryLead(tries){
            if (window.fbq) { try { window.fbq('track', 'Lead'); } catch(e){} return; }
            if (tries > 20) return;
            setTimeout(function(){ tryLead(tries+1); }, 200);
          })(0);
        `}
      </Script>

      {/* Logo */}
      <Link href="/" className="mb-12">
        <Logo size="lg" />
      </Link>

      {/* Animated check */}
      <div className="flex justify-center mb-8">
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="#01B5B6"
            strokeWidth="3"
            fill="rgba(1,181,182,0.08)"
            style={{
              strokeDasharray: 280,
              strokeDashoffset: 280,
              animation: 'ty-draw 800ms ease-out forwards',
            }}
          />
          <path
            d="M30 50 L43 63 L68 36"
            stroke="#01B5B6"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              strokeDasharray: 120,
              strokeDashoffset: 120,
              animation: 'ty-draw 700ms ease-out 400ms forwards',
            }}
          />
        </svg>
      </div>

      {/* Eyebrow */}
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
        style={{
          background: 'rgba(1,181,182,0.12)',
          border: '1px solid rgba(1,181,182,0.3)',
        }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full vs-pulse"
          style={{ background: '#01B5B6' }}
        />
        <span className="text-[12px] tracking-wide font-medium" style={{ color: '#01B5B6' }}>
          You&apos;re officially in
        </span>
      </div>

      {/* Headline */}
      <h1
        className="font-serif-display text-white text-center mb-5"
        style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', lineHeight: 1.1, fontWeight: 700 }}
      >
        Thank you — you&apos;re on
        <br />
        the <span style={{ color: '#01B5B6', fontStyle: 'italic' }}>VeriSeek</span> waitlist.
      </h1>

      {/* Body */}
      <p
        className="text-center max-w-xl mx-auto text-[16px] mb-10"
        style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}
      >
        We&apos;ll be in touch the moment VeriSeek launches with founder-tier early access —
        and we&apos;ll use what you shared to build something that truly works for you.
      </p>

      {/* What's next card */}
      <div
        className="w-full max-w-xl rounded-2xl px-6 py-6 mb-10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(1,181,182,0.2)',
        }}
      >
        <p
          className="text-[11px] font-semibold tracking-[0.2em] mb-4"
          style={{ color: '#01B5B6' }}
        >
          WHAT HAPPENS NEXT
        </p>
        <ul className="flex flex-col gap-4 text-[14px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
          <li className="flex items-start gap-3">
            <span
              className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: 'rgba(1,181,182,0.18)', color: '#01B5B6' }}
            >
              1
            </span>
            <span>
              Check your inbox — we&apos;ll send a quick confirmation shortly.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: 'rgba(1,181,182,0.18)', color: '#01B5B6' }}
            >
              2
            </span>
            <span>
              We&apos;ll keep you updated as we get closer to launch.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: 'rgba(1,181,182,0.18)', color: '#01B5B6' }}
            >
              3
            </span>
            <span>
              The day VeriSeek goes live, you&apos;ll get founder-tier access — completely free.
            </span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold vs-btn-teal"
        >
          ← Back to homepage
        </Link>
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL || 'https://veriseek.ai'}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-colors"
          style={{
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          Visit veriseek.ai
        </a>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        © 2026 VeriSeek · Truth you can act on.
      </p>

      <style jsx>{`
        @keyframes ty-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}

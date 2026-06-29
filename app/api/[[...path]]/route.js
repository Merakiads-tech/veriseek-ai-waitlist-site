import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildThankYouEmail } from '@/lib/email-template';

// Node runtime is required for the Resend SDK (uses Node APIs).
export const runtime = 'nodejs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL || 'VeriSeek <no-reply@veriseek.ai>';

function admin() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim());

const ok = (data = {}) => NextResponse.json({ ok: true, ...data });
const fail = (msg, status = 400) =>
  NextResponse.json({ ok: false, error: msg }, { status });

/**
 * Fire the thank-you email. Errors are logged but never propagated to the
 * client — a failed email send must not break the signup flow.
 */
async function sendThankYouEmail(email, source) {
  if (!resendKey) {
    console.warn('RESEND_API_KEY missing — skipping thank-you email');
    return { sent: false, reason: 'no_api_key' };
  }
  try {
    const resend = new Resend(resendKey);
    const { html, text } = buildThankYouEmail({ source });
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "You're on the VeriSeek waitlist 🎉",
      html,
      text,
      headers: {
        'List-Unsubscribe': '<mailto:no-reply@veriseek.ai?subject=unsubscribe>',
      },
      tags: [
        { name: 'campaign', value: 'waitlist' },
        { name: 'source', value: source || 'unknown' },
      ],
    });
    if (error) {
      console.error('Resend send error:', error);
      return { sent: false, error };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error('Resend exception:', err);
    return { sent: false, error: String(err?.message || err) };
  }
}

export async function GET(request, { params }) {
  const path = (params?.path || []).join('/');
  if (path === '' || path === 'health') {
    return ok({ service: 'veriseek-waitlist' });
  }
  return fail('Not found', 404);
}

export async function POST(request, { params }) {
  const path = (params?.path || []).join('/');
  let body = {};
  try {
    body = await request.json();
  } catch {
    return fail('Invalid JSON');
  }

  // Hero / footer email capture
  if (path === 'waitlist/email') {
    const { email, source } = body || {};
    if (!isValidEmail(email)) return fail('Please enter a valid email address.');
    const clean = email.trim().toLowerCase();
    const src = ['hero_cta', 'footer_cta'].includes(source) ? source : 'hero_cta';
    const { error } = await admin()
      .from('waitlist_emails')
      .insert([{ email: clean, source: src }]);

    if (error) {
      if (error.code === '23505' || /duplicate/i.test(error.message || '')) {
        // Already on the list — still send the email so user has a record
        sendThankYouEmail(clean, src).catch(() => {});
        return NextResponse.json(
          { ok: true, duplicate: true, message: "You're already on the list!" },
          { status: 200 }
        );
      }
      console.error('waitlist/email error:', error);
      return fail('Something went wrong. Please try again.', 500);
    }

    // Fire and forget — don't block the response on email delivery
    sendThankYouEmail(clean, src).catch(() => {});
    return ok({ message: "You're on the list!" });
  }

  // Survey submission
  if (path === 'waitlist/survey') {
    const { email, q1, q2, q3, q4, q5 } = body || {};
    if (!isValidEmail(email)) return fail('Please enter a valid email address.');
    const clean = email.trim().toLowerCase();
    const payload = {
      email: clean,
      q1_answer: q1 || null,
      q2_answer: q2 || null,
      q3_answer: q3 || null,
      q4_answer: q4 || null,
      q5_answer: q5 || null,
      source: 'waitlist_page',
    };
    const { error } = await admin().from('waitlist_responses').insert([payload]);
    if (error) {
      console.error('waitlist/survey error:', error);
      return fail('Something went wrong. Please try again.', 500);
    }
    // Best-effort dedupe add to emails table
    await admin()
      .from('waitlist_emails')
      .insert([{ email: clean, source: 'survey' }])
      .then(() => {})
      .catch(() => {});

    sendThankYouEmail(clean, 'waitlist_page').catch(() => {});
    return ok({ message: "You're on the list!" });
  }

  return fail('Not found', 404);
}

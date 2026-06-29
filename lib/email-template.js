/**
 * Branded VeriSeek thank-you email (HTML + text)
 * Used for hero / footer / survey signups.
 */

export function buildThankYouEmail({ source = 'hero_cta' } = {}) {
  const isSurvey = source === 'waitlist_page' || source === 'survey';

  // Resolve URLs from env so dev/preview/production all link correctly.
  // Fallbacks point to the production brand domain.
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://veriseek.ai';
  const WAITLIST_URL =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://waitlist.veriseek.ai';
  // For display in copy ("you signed up at <domain>"), strip protocol.
  const WAITLIST_DOMAIN = WAITLIST_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const heroLine = isSurvey
    ? "Thank you for taking the time to share your experience — your responses directly shape how VeriSeek works."
    : "Founder-tier early access is locked in. We'll be in touch the moment we launch.";

  const text = [
    "You're on the VeriSeek waitlist 🎉",
    '',
    "Thanks for signing up for early access to VeriSeek — the AI-powered review verification platform.",
    '',
    heroLine,
    '',
    "What happens next:",
    "  1. Check your inbox — we'll send updates as we approach launch.",
    "  2. We'll keep you posted on early-access perks as they roll out.",
    "  3. The day VeriSeek goes live, you'll get founder-tier access — completely free.",
    '',
    `In the meantime, learn more at ${SITE_URL}`,
    '',
    '— The VeriSeek team',
    'Truth you can act on.',
    '',
    `You're receiving this because you joined the waitlist at ${WAITLIST_DOMAIN}.`,
    "If this wasn't you, you can safely ignore this email.",
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>You're on the VeriSeek waitlist 🎉</title>
  </head>
  <body style="margin:0;padding:0;background:#F2FBFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1A1A2E;">
    <!-- Preheader (hidden in inbox preview) -->
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#F2FBFB;">
      You're officially on the VeriSeek waitlist. Founder-tier early access locked in.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2FBFB;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,48,73,0.08);">

            <!-- Header: navy with logo -->
            <tr>
              <td align="center" style="background:#003049;padding:36px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:8px;">
                      <!-- Magnifying glass + check SVG (inline) -->
                      <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                        <circle cx="13.5" cy="13.5" r="10.5" fill="none" stroke="#FFFFFF" stroke-width="2.3"/>
                        <path d="M8.8 13.8 l3.4 3.4 l7.2 -7.2" fill="none" stroke="#01B5B6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="21.2" y1="21.2" x2="27.5" y2="27.5" stroke="#01B5B6" stroke-width="2.6" stroke-linecap="round"/>
                      </svg>
                    </td>
                    <td style="vertical-align:middle;font-size:22px;font-weight:700;letter-spacing:-0.01em;line-height:1;">
                      <span style="color:#FFFFFF;">Veri</span><span style="color:#01B5B6;">Seek</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Eyebrow + Hero -->
            <tr>
              <td style="padding:40px 36px 8px 36px;" align="center">
                <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(1,181,182,0.12);border:1px solid rgba(1,181,182,0.3);font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#01B5B6;">
                  You're officially in
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px 8px 36px;" align="center">
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;font-weight:700;color:#003049;text-align:center;">
                  You're on the<br/>
                  <span style="color:#01B5B6;font-style:italic;">VeriSeek</span> waitlist 🎉
                </h1>
              </td>
            </tr>

            <!-- Body copy -->
            <tr>
              <td style="padding:24px 40px 8px 40px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#475569;">
                  Thanks for signing up for early access to <strong style="color:#003049;">VeriSeek</strong> — the AI-powered review verification platform built to help you buy with confidence, not anxiety.
                </p>
                <p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#475569;">
                  ${heroLine}
                </p>
              </td>
            </tr>

            <!-- What's next card -->
            <tr>
              <td style="padding:0 40px 24px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0FAFA;border:1px solid #D7EDEE;border-radius:12px;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#01B5B6;">
                        What happens next
                      </p>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding:8px 0;font-size:14px;line-height:1.6;color:#1A1A2E;">
                            <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:rgba(1,181,182,0.18);color:#01B5B6;font-weight:700;font-size:12px;text-align:center;line-height:22px;margin-right:10px;">1</span>
                            Keep an eye on your inbox — we'll send updates as we approach launch.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;font-size:14px;line-height:1.6;color:#1A1A2E;">
                            <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:rgba(1,181,182,0.18);color:#01B5B6;font-weight:700;font-size:12px;text-align:center;line-height:22px;margin-right:10px;">2</span>
                            We'll keep you posted on early-access perks as they roll out.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;font-size:14px;line-height:1.6;color:#1A1A2E;">
                            <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:rgba(1,181,182,0.18);color:#01B5B6;font-weight:700;font-size:12px;text-align:center;line-height:22px;margin-right:10px;">3</span>
                            The day VeriSeek goes live, you'll get founder-tier access — completely free.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:8px 40px 36px 40px;">
                <a href="${SITE_URL}" style="display:inline-block;background:#01B5B6;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;border-radius:999px;">
                  Visit veriseek.ai
                </a>
              </td>
            </tr>

            <!-- Sign-off -->
            <tr>
              <td style="padding:0 40px 36px 40px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
                  — The VeriSeek team<br/>
                  <em style="color:#01B5B6;">Truth you can act on.</em>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#F2FBFB;border-top:1px solid #D7EDEE;padding:20px 36px;" align="center">
                <p style="margin:0 0 6px 0;font-size:12px;color:#64748B;line-height:1.6;">
                  © 2026 VeriSeek · <span style="color:#01B5B6;">veriseek.ai</span>
                </p>
                <p style="margin:0;font-size:11px;color:#94A3B8;line-height:1.6;">
                  You're receiving this because you joined the waitlist at ${WAITLIST_DOMAIN}.<br/>
                  If this wasn't you, you can safely ignore this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
}

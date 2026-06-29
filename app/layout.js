import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'VeriSeek — Truth you can act on',
  description:
    'VeriSeek is an AI-powered review verification platform. Join the waitlist for early access.',
  metadataBase: new URL('https://join-veriseek.preview.emergentagent.com'),
  openGraph: {
    title: 'VeriSeek — Truth you can act on',
    description:
      'Join the VeriSeek waitlist — AI-verified reviews you can actually trust.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#003049',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to font + tracking origins early so DNS / TLS happen in parallel with HTML parse */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />

        {/* Only the weights actually used: DM Serif Display (display) + DM Sans 400/600/700 */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />

        {/* Meta Pixel Code — lazy-loaded so it doesn't block first paint on mobile.
            PageView still fires; the global noscript fallback below covers JS-off users. */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1304756355125527');
            fbq('track', 'PageView');`}
        </Script>
        {/* End Meta Pixel Code */}
      </head>
      <body>
        {/* Meta Pixel noscript fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1304756355125527&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}

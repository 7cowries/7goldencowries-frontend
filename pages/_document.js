import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const orgJson = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "7GoldenCowries",
    "url": "https://7goldencowries.com"
  };

  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b2240" />
        <link rel="mask-icon" href="/logo.svg" color="#ffd445" />
        <link rel="preload" as="image" href="/logo.svg" />
        <link rel="preconnect" href="https://plausible.io" />
        <script defer data-domain="7goldencowries.com" src="https://plausible.io/js/script.tagged-events.js"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

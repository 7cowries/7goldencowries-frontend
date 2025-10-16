import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const title = '7GoldenCowries — XP to Earn across the Seven Isles';
  const description = 'Explore the Seven Isles, complete quests, climb tiers, unlock partner perks, and grow your legend.';
  const url = 'https://7goldencowries.com';
  const ogImage = `${url}/og.png`;
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b2240" />
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
    <link rel="preload" as="image" href="/logo.svg" />
    <link rel="preconnect" href="https://plausible.io" />
    <script type="application/ld+json">{
      "@context":"https://schema.org",
      "@type":"Organization",
      "name":"7GoldenCowries",
      "url":"https://7goldencowries.com",
      "logo":"https://7goldencowries.com/logo.svg"
    }</script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

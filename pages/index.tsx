import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head><title>7GoldenCowries — Home</title></Head>
      <main style={{minHeight:'100vh',background:'#0b2240',color:'#fff',padding:'2rem'}}>
        <h1>Welcome to 7GoldenCowries</h1>
        <p>Home is live. Continue to <Link href="/isles">Isles</Link> or use the menu.</p>
      </main>
    </>
  );
}

import dynamic from 'next/dynamic';

// Render the existing blueprint app from src/
const ClientApp = dynamic(() => import('../src/ClientApp'), { ssr: false });

export default function Home() {
  return <ClientApp />;
}

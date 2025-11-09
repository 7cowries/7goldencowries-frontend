import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('../src/ClientApp.jsx'), {
  ssr: false,
});

export default function IndexPage() {


  return <ClientApp />;
}

/** Server session probe (safe, optional) */

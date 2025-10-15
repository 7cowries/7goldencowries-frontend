import dynamic from 'next/dynamic';
const ClientApp = dynamic(() => import('../src/App.jsx'), { ssr: false });
export default function CatchAll() { return <ClientApp />; }

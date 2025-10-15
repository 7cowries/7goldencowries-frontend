import dynamic from 'next/dynamic';
const AppNoSSR = dynamic(() => import('../src/App'), { ssr: false });

export default function CatchAll() {
  return <AppNoSSR />;
}

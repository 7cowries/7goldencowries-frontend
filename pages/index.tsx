import dynamic from 'next/dynamic';

const Home = dynamic(() => import('../src/pages/index'), { ssr: false });

export default function IndexPage() {
  return <Home />;
}

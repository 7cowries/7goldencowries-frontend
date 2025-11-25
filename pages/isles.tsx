import dynamic from 'next/dynamic';

const Isles = dynamic(() => import('../src/pages/isles'), { ssr: false });

export default function IslesPage() {
  return <Isles />;
}

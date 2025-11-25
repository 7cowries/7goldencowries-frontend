import dynamic from 'next/dynamic';

const Quests = dynamic(() => import('../src/pages/quests'), { ssr: false });

export default function QuestsPage() {
  return <Quests />;
}

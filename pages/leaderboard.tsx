import dynamic from 'next/dynamic';

const Leaderboard = dynamic(() => import('../src/pages/leaderboard'), { ssr: false });

export default function LeaderboardPage() {
  return <Leaderboard />;
}

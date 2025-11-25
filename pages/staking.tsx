import dynamic from 'next/dynamic';

const Staking = dynamic(() => import('../src/pages/staking'), { ssr: false });

export default function StakingPage() {
  return <Staking />;
}

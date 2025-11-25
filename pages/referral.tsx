import dynamic from 'next/dynamic';

const Referral = dynamic(() => import('../src/pages/referral'), { ssr: false });

export default function ReferralPage() {
  return <Referral />;
}

import dynamic from 'next/dynamic';

const Subscription = dynamic(() => import('../src/pages/subscription'), { ssr: false });

export default function SubscriptionPage() {
  return <Subscription />;
}

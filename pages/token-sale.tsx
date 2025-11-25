import dynamic from 'next/dynamic';

const TokenSale = dynamic(() => import('../src/pages/token-sale'), { ssr: false });

export default function TokenSalePage() {
  return <TokenSale />;
}

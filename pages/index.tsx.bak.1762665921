import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('../src/ClientApp.jsx'), {
  ssr: false,
});

export default function IndexPage() {

export async function getServerSideProps(ctx:any){ const { getWalletFromContext } = await import("@/lib/getSession"); const wallet = getWalletFromContext(ctx); return { props: { _wallet: wallet || null } }; }

  return <ClientApp />;
}

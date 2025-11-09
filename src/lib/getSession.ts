import type { NextApiRequest } from 'next';
import type { GetServerSidePropsContext, NextPageContext } from 'next';

export function readWalletFromCookie(cookieHeader?: string | null) {
  const header = cookieHeader || '';
  const m = header.match(/(?:^|;\s*)gc_wallet=([^;]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

// Use inside getServerSideProps / API routes / getInitialProps
export function getWalletFromContext(ctx: GetServerSidePropsContext | NextPageContext | { req?: NextApiRequest }) {
  const cookie = (ctx as any)?.req?.headers?.cookie ?? '';
  return readWalletFromCookie(cookie);
}

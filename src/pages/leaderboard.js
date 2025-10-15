import React from 'react';

export async function getServerSideProps() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://7goldencowries.com';
    const r = await fetch(`${base}/api/leaderboard`, {headers:{'Accept':'application/json'}});
    const data = await r.json();
    return { props: { data } };
  } catch (e) {
    return { props: { data: { ok:false, error:'fetch_failed' } } };
  }
}

export default function Leaderboard({ data }){
  const items = data?.leaderboard || data?.results || [];
  return (
    <div style={{padding:24}}>
      <h1>🏆 Cowrie Leaderboard</h1>
      {(!items || items.length===0) ? (
        <div style={{opacity:.7, padding:16, border:'1px dashed rgba(255,255,255,0.25)', borderRadius:14}}>
          No champions yet.
        </div>
      ) : (
        <ol>
          {items.map((row, i) => (
            <li key={row.address || i}>{row.address} — {row.score}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

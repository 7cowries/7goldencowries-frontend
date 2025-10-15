import React from 'react';
import Link from 'next/link';
export default function Sidebar(){ 
  return (
    <aside style={{padding:12}}>
      <Link href="/leaderboard">Leaderboard</Link>
    </aside>
  );
}

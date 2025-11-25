import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import LevelChip from "../components/ui/LevelChip";
import XPBarAnimated from "../components/ui/XPBarAnimated";

const leaderboard = [
  { rank: 1, wallet: "EQC-Top1", twitter: "@top1", xp: 9200, level: 7 },
  { rank: 2, wallet: "EQC-Top2", twitter: "@top2", xp: 8800, level: 7 },
  { rank: 3, wallet: "EQC-Top3", twitter: "@top3", xp: 8400, level: 6 },
  { rank: 4, wallet: "EQC-User", twitter: "@you", xp: 6200, level: 5 },
];

export default function Leaderboard() {
  return (
    <PageContainer>
      <SectionHeader title="Leaderboard" subtitle="Top adventurers" />
      <div className="podium card">
        {leaderboard.slice(0, 3).map((row) => (
          <div key={row.rank} className={`podium-slot podium-${row.rank}`}>
            <div className="rank">#{row.rank}</div>
            <LevelChip level={row.level} xp={row.xp} />
            <p className="muted">{row.twitter}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table">
          <div className="table-head">
            <span>Rank</span>
            <span>Wallet</span>
            <span>Twitter</span>
            <span>XP</span>
            <span>Level</span>
          </div>
          {leaderboard.map((row) => (
            <div key={row.rank} className="table-row">
              <span>#{row.rank}</span>
              <span>{row.wallet}</span>
              <span>{row.twitter}</span>
              <span>
                <XPBarAnimated label="" current={row.xp} total={10000} compact />
              </span>
              <span>
                <LevelChip level={row.level} xp={row.xp} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

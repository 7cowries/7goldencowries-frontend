import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../utils/api";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getLeaderboard().then((res) => setLeaders(res?.entries || [])).catch(() => {});
  }, []);

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <Section title="Leaderboard" subtitle="Top explorers across the Seven Isles">
      <div className="grid-2">
        {podium.map((u, i) => (
          <Card key={u.wallet || i}>
            <strong>#{i + 1} {u.wallet}</strong>
            <div className="muted">{u.xp} XP</div>
            <Progress value={(u.progress || 0) * 100} />
          </Card>
        ))}
      </div>
      {rest.length > 0 && (
        <Card className="" style={{ marginTop: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {rest.map((u, i) => (
                <tr key={u.wallet || i}>
                  <td>#{i + 4}</td>
                  <td>
                    {u.twitterHandle ? (
                      <a href={`https://x.com/${u.twitterHandle}`} target="_blank" rel="noreferrer">@{u.twitterHandle}</a>
                    ) : (
                      u.wallet
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>{u.xp} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Section>
  );
}

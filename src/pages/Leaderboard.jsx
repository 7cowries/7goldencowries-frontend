import React from "react";
import Page from "../components/Page";
import { getLeaderboard } from "../utils/api";

export default function Leaderboard() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    getLeaderboard()
      .then((data) => setRows(Array.isArray(data?.entries) ? data.entries : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <Page>
      <section className="glass-panel section-panel">
        <div className="section-head-row">
          <div>
            <p className="section-eyebrow">Competitive Waters</p>
            <h1 className="page-title">Leaderboard</h1>
          </div>
        </div>

        <div className="leaderboard-shell ocean-card">
          <table className="ocean-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Explorer</th>
                <th>Level</th>
                <th>XP</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 12).map((u, i) => (
                <tr key={u.wallet || i}>
                  <td>#{i + 1}</td>
                  <td>{u.wallet ? `${u.wallet.slice(0, 6)}...${u.wallet.slice(-4)}` : "Unknown"}</td>
                  <td>{u.levelName || "Shellborn"}</td>
                  <td>{Number(u.xp || 0).toLocaleString()}</td>
                  <td>{u.tier || "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <p className="muted">No champions recorded yet.</p> : null}
        </div>
      </section>
    </Page>
  );
}

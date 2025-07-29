import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css";

const API = process.env.REACT_APP_API_URL;

const levelLore = {
  "Shell of Curiosity": "Born of the tides, a humble explorer",
  "Wisdom": "Seeker of sea scrolls and forgotten runes",
  "Courage": "Braver of currents, unshaken by storms",
  "Integrity": "Bearer of truth in the chaos of waves",
  "Creativity": "Carver of cowries from ocean dreams",
  "Compassion": "Heart of the tide, voice of Naiā",
  "Resilience": "Tidebound soul who rose through wreckage",
  "Vision": "The one who glimpsed beyond the seventh isle"
};

const Leaderboard = () => {
  const [top, setTop] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/leaderboard`)
      .then((res) => setTop(res.data.top || []))
      .catch((err) => console.error("Failed to fetch leaderboard:", err));
  }, []);

  return (
    <div className="leaderboard-wrapper">
      <h1>🏆 Cowrie Leaderboard</h1>
      <p className="subtitle">The bravest shellborns of Naiā’s realm</p>

      {top.length === 0 ? (
        <p>Ranking will appear here.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Wallet / Twitter</th>
              <th>XP</th>
              <th>Progress</th>
              <th>Level</th>
              <th>Tier</th>
              <th>Badge</th>
            </tr>
          </thead>
          <tbody>
            {top.map((user, i) => (
              <tr key={user.wallet} className={i === 0 ? "first" : i === 1 ? "second" : i === 2 ? "third" : ""}>
                <td>{user.rank}</td>
                <td>
                  {shorten(user.wallet)}
                  {user.twitter && (
                    <div className="twitter-handle">@{user.twitter}</div>
                  )}
                </td>
                <td>{user.xp}</td>
                <td>
                  <div className="xp-bar">
                    <div
                      className="xp-fill"
                      style={{ width: `${(user.progress * 100).toFixed(1)}%` }}
                    ></div>
                  </div>
                </td>
                <td>
                  <strong>{user.name}</strong>
                  <div className="level-lore">{levelLore[user.name]}</div>
                </td>
                <td>{user.tier}</td>
                <td>
                  <img
                    src={`/images/badges/level-${user.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                    alt={user.name}
                    className="badge-icon"
                    onError={(e) => {
                      e.target.src = "/images/badges/level-shellborn.png";
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

function shorten(addr) {
  return addr.slice(0, 5) + "..." + addr.slice(-4);
}

export default Leaderboard;

import React, { useState } from "react";
import { api, getQuests, getLeaderboard } from "../utils/api";
export default function TestAPI() {
  const [log, setLog] = useState([]);
  const add = (s) => setLog((x) => [...x, s]);
  async function run() {
    setLog([]);
    add(`API_BASE = ${api.base || "(same-origin)"}`);
    try {
      const q = await getQuests();
      add(`✓ /api/quests OK (${(q?.quests || []).length})`);
    } catch (e) {
      add(`✗ /api/quests: ${e.message}`);
    }
    try {
      const l = await getLeaderboard();
      add(`✓ /api/leaderboard OK (${(l?.leaders || l || []).length})`);
    } catch (e) {
      add(`✗ /api/leaderboard: ${e.message}`);
    }
  }
  return (
    <div style={{ padding: 24 }}>
      <h2>/test-api</h2>
      <button onClick={run}>Run</button>
      <pre style={{ marginTop: 16 }}>{log.join("\n")}</pre>
    </div>
  );
}

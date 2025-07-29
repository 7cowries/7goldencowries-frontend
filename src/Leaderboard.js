import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const Leaderboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const res = await axios.get(`${API}/leaderboard`);
        setData(res.data.top);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      }
    };
    getLeaderboard();
  }, []);

  return (
    <div>
      <h2>🏆 Cowrie Leaderboard</h2>
      <p>Total Users: {data.length}</p>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Wallet</th>
            <th>XP</th>
            <th>Level</th>
            <th>Tier</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.wallet}>
              <td>{u.rank}</td>
              <td>{u.wallet.slice(0, 6)}...{u.wallet.slice(-4)}</td>
              <td>{u.xp}</td>
              <td>{u.symbol} {u.name}</td>
              <td>{u.tier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;

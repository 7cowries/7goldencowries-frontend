import React from 'react';
import XPBarWave from './XPBarWave';

const LeaderboardRow = ({ entry, index }) => (
  <tr>
    <td>#{index + 1}</td>
    <td>{entry.name}</td>
    <td>{entry.level}</td>
    <td style={{ minWidth: 160 }}>
      <XPBarWave progress={entry.progress} />
    </td>
    <td>{entry.xp} XP</td>
  </tr>
);

export default LeaderboardRow;

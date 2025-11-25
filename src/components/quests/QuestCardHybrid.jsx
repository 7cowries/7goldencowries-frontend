import React from 'react';
import XPBarWave from '../ui/XPBarWave';
import LevelChip from '../ui/LevelChip';

const QuestCardHybrid = ({ quest, onClaim }) => {
  const locked = quest.locked;
  return (
    <div className="glass-panel">
      <div className="glass-inner" style={{ gap: 10 }}>
        <div className="flex-between">
          <div>
            <h3>{quest.title}</h3>
            <p className="small-label">{quest.category} • {quest.points} XP</p>
          </div>
          <LevelChip variant={locked ? 'default' : 'gold'} value={locked ? `Lock Lv ${quest.requiredLevel}` : 'Ready'} />
        </div>
        <p style={{ margin: 0, color: '#cfe6ff' }}>{quest.description}</p>
        <XPBarWave progress={quest.progress || 0} />
        <div className="flex-between">
          <div className="pill">Reward: {quest.reward}</div>
          <button
            className="btn-primary"
            disabled={locked}
            onClick={() => !locked && onClaim?.(quest)}
            style={{ opacity: locked ? 0.6 : 1 }}
          >
            {locked ? 'Locked' : 'Claim XP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestCardHybrid;

import React from "react";
import LevelChip from "./LevelChip";
import XPBarAnimated from "./XPBarAnimated";

export default function ProfileStats({ profile }) {
  return (
    <div className="profile-stats card">
      <div className="profile-header">
        <div>
          <div className="label">Wallet</div>
          <h3>{profile.wallet}</h3>
          <p className="muted">{profile.twitter}</p>
        </div>
        <LevelChip level={profile.level} xp={profile.xp} />
      </div>
      <XPBarAnimated label="Level Progress" current={profile.xp} total={profile.nextLevel} />
      <div className="stat-row">
        <div>
          <div className="label">Subscription</div>
          <strong>{profile.tier}</strong>
        </div>
        <div>
          <div className="label">Quests Completed</div>
          <strong>{profile.completed}</strong>
        </div>
        <div>
          <div className="label">Perks</div>
          <strong>{profile.perks.length}</strong>
        </div>
      </div>
      <div className="badge-row">
        {profile.badges.map((lvl) => (
          <LevelChip key={lvl} level={lvl} xp={lvl * 1000} />
        ))}
      </div>
    </div>
  );
}

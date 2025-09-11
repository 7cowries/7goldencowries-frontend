import React from "react";
import { useMe } from "../state/me";
import { Progress } from "./ui/Progress";

export default function ProfileWidget() {
  const { me } = useMe();
  if (!me) return <div style={{ height: 40 }} />;

  const pct = Math.min(100, Math.max(0, (me.levelProgress || 0) * 100));

  return (
    <div style={{ marginBottom: 16 }}>
      <div>Level {me.levelName}, {me.xp} XP, Next: {me.nextXP}</div>
      <Progress value={pct} />
    </div>
  );
}

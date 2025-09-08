import React, { useEffect, useState } from "react";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import { getMe } from "../utils/api";

export default function Profile() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    getMe().then(setMe).catch(() => {});
  }, []);

  const pct = me && me.nextXP ? (me.xp / me.nextXP) * 100 : 0;

  return (
    <Section title="Profile">
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>{me?.wallet || "Anonymous"}</div>
          {me?.levelName && <span className="pill">{me.levelName}</span>}
        </div>
        <div style={{ marginTop: 12 }}>
          <Progress value={pct} />
        </div>
      </Card>
    </Section>
  );
}

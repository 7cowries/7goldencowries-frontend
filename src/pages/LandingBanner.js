// src/pages/LandingBanner.js
import React from "react";
import { useCountdown, SALE_START_ISO, openCalendarReminder, inviteFriend } from "../utils/launch";

export default function LandingBanner() {
  const { days, hours, minutes, seconds } = useCountdown(SALE_START_ISO);

  return (
    <div className="card gradient-border pad-24 hover" style={{ background: "linear-gradient(180deg, var(--gold), var(--gold-2))", color: "#2a1e00" }}>
      <div className="flex" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 900 }}>🟡 Token Sale begins October 4</span>
          <span style={{ opacity: .8 }}>Countdown</span>
          <span className="pill" style={{ background: "rgba(0,0,0,.15)", color: "#2a1e00" }}>
            {days}d · {hours}h · {minutes}m · {seconds}s
          </span>
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <button className="btn ripple" onClick={() => openCalendarReminder({ startIso: SALE_START_ISO })}>Set Reminder</button>
          <a className="btn ghost ripple" href="/token-sale">Learn More</a>
          <button className="btn ghost ripple" onClick={() => inviteFriend({})}>Invite</button>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function OceanBackdrop({ overlays, particles }) {
  return (
    <div className="ocean-backdrop" aria-hidden>
      <div className="ocean-gradient" />
      {overlays && <div className="glass-layer" />}
      {particles && <div className="particle-haze" />}
    </div>
  );
}

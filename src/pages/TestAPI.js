// src/pages/TestAPI.js
import React, { useEffect, useMemo, useState } from "react";

/**
 * Reads the backend URL from the environment and normalizes trailing slashes.
 * Set on Vercel via: REACT_APP_API_URL = https://sevengoldencowries-backend.onrender.com
 */
const API_URL =
  (process.env.REACT_APP_API_URL ? String(process.env.REACT_APP_API_URL) : "") ||
  "";
const BASE = API_URL.replace(/\/+$/, ""); // trim any trailing /

export default function TestAPI() {
  const [health, setHealth] = useState(null);
  const [healthErr, setHealthErr] = useState(null);

  const [wallet, setWallet] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileErr, setProfileErr] = useState(null);

  const [raw, setRaw] = useState(""); // last raw response text

  const usingUrl = useMemo(() => (BASE ? `${BASE}` : "(not set)"), []);

  // Small helper for fetch with CORS + credentials
  async function hit(path) {
    const url = `${BASE}${path}`;
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });
    const text = await res.text();
    setRaw(text);
    try {
      const json = JSON.parse(text);
      if (!res.ok) {
        const e = new Error(json?.error || `HTTP ${res.status}`);
        e.status = res.status;
        throw e;
      }
      return json;
    } catch (e) {
      // If it wasn't JSON, surface the raw body
      throw new Error(e.message || `Non-JSON response: ${text.slice(0, 200)}`);
    }
  }

  // Health check on mount
  useEffect(() => {
    if (!BASE) {
      setHealthErr(
        "REACT_APP_API_URL is not set. Add it to Vercel env & redeploy."
      );
      return;
    }
    hit("/health")
      .then((j) => setHealth(j))
      .catch((err) => setHealthErr(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFetchProfile = async () => {
    setProfile(null);
    setProfileErr(null);
    if (!wallet.trim()) {
      setProfileErr("Enter a wallet address to test /api/profile");
      return;
    }
    try {
      const j = await hit(`/api/profile?wallet=${encodeURIComponent(wallet)}`);
      setProfile(j);
    } catch (e) {
      setProfileErr(e.message);
    }
  };

  return (
    <div className="page section" style={{ minHeight: "70vh" }}>
      <h1 style={{ marginBottom: 8 }}>Backend Connection Test</h1>

      <p style={{ marginTop: 0, opacity: 0.85 }}>
        API URL:&nbsp;
        <code style={{ fontWeight: 700 }}>{usingUrl}</code>
      </p>

      <div
        className="card pad-16 round"
        style={{ marginTop: 16, marginBottom: 20 }}
      >
        <h3 style={{ marginTop: 0 }}>① Health Check — <code>/health</code></h3>
        {!BASE ? (
          <p style={{ color: "#ffb84d" }}>
            REACT_APP_API_URL is missing. Set it to your Render backend URL
            (e.g. <code>https://sevengoldencowries-backend.onrender.com</code>)
            and redeploy.
          </p>
        ) : healthErr ? (
          <p style={{ color: "#ff6b6b" }}>Error: {healthErr}</p>
        ) : health ? (
          <pre
            style={{
              margin: 0,
              padding: 12,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              overflowX: "auto",
            }}
          >
{JSON.stringify(health, null, 2)}
          </pre>
        ) : (
          <p>Checking…</p>
        )}
      </div>

      <div className="card pad-16 round">
        <h3 style={{ marginTop: 0 }}>
          ② Profile Test — <code>/api/profile?wallet=...</code>
        </h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Enter a wallet address"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              outline: "none",
            }}
          />
          <button className="btn" onClick={onFetchProfile}>
            Fetch Profile
          </button>
        </div>

        {profileErr && (
          <p style={{ color: "#ff6b6b", marginTop: 6 }}>Error: {profileErr}</p>
        )}

        {profile && (
          <pre
            style={{
              marginTop: 12,
              padding: 12,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              overflowX: "auto",
            }}
          >
{JSON.stringify(profile, null, 2)}
          </pre>
        )}
      </div>

      <div
        className="card pad-16 round"
        style={{ marginTop: 20, opacity: 0.9 }}
      >
        <h3 style={{ marginTop: 0 }}>Last Raw Response</h3>
        <pre
          style={{
            margin: 0,
            padding: 12,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            overflowX: "auto",
            maxHeight: 240,
          }}
        >
{raw || "(none yet)"}
        </pre>
        <p className="muted" style={{ marginTop: 10 }}>
          If you see CORS errors in your browser console, ensure your backend
          allows the frontend origin and that you deployed with the updated
          CORS config.
        </p>
      </div>
    </div>
  );
}

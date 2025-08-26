// src/pages/TestAPI.js
import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function TestAPI() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    fetch(`${API}/health`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((err) => setStatus("Error: " + err.message));
  }, []);

  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      <h1>Backend Connection Test</h1>
      <p>API URL: {API}</p>
      <p>Response: {status}</p>
    </div>
  );
}

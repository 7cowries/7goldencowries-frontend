// src/pages/NotFound.js
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function NotFound() {
  return (
    <div className="page">
      <div className="section center">
        <div>
          <h1>🚢 Lost at Sea</h1>
          <p className="subtitle">
            The page you’re looking for drifted beyond the Isles.
          </p>
          <Link to="/" className="btn">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

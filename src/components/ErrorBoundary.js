// src/components/ErrorBoundary.js
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>🌊 Something went wrong</h1>
          <p>Don’t worry—our tides will refresh soon. Please reload the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

import React from "react";
import dynamic from "next/dynamic";
import { BrowserRouter } from "react-router-dom";

// Load the SPA only on the client
const App = dynamic(() => import("../src/App"), { ssr: false });

export default function CatchAll() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

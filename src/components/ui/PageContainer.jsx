import React from "react";
import OceanBackdrop from "./OceanBackdrop";
import { useTheme } from "../../context/ThemeContext";

export default function PageContainer({ children }) {
  const { overlays, particles, theme } = useTheme();

  return (
    <div className="page-container" data-theme={theme}>
      <OceanBackdrop overlays={overlays} particles={particles} />
      {children}
    </div>
  );
}

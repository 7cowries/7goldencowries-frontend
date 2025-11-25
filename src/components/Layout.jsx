import Sidebar from "./layout/Sidebar";
import MagicLayers from "./ui/MagicLayers";
import { useTheme } from "../context/ThemeContext";

/**
 * Responsive application shell shared by every routed page. The sidebar stays
 * fixed on desktop and slides in on mobile via the `Sidebar` component. The
 * main area uses a mobile‑first padding scale so content never overflows the
 * viewport width.
 */
export default function Layout({ children }) {
  const { ambientEnabled } = useTheme();
  return (
    <div className={`app-layout${!ambientEnabled ? " no-ambient" : ""}`}>
      <Sidebar />
      <div className="main-view">
        <div className="main-scroll">{children}</div>
      </div>
      {ambientEnabled ? <MagicLayers /> : null}
    </div>
  );
}

import { useEffect, useState } from "react";

/**
 * usePathname — Router-free way to read the current path.
 * Works even if this component is not inside <>.
 */
export default function usePathname() {
  const getPath = () => (typeof window !== "undefined" ? window.location.pathname : "/");
  const [pathname, setPathname] = useState(getPath());

  useEffect(() => {
    const onPop = () => setPathname(getPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return pathname;
}

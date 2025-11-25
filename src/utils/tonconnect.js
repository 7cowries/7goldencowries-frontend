export function getTonManifestUrl() {
  const envUrl =
    process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
    process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL;

  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/tonconnect-manifest.json`;
  }

  return "/tonconnect-manifest.json";
}

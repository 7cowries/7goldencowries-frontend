import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../utils/api";

export default function RefRedirect() {
  const { code } = useParams();
  useEffect(() => {
    if (code) {
      window.location.href = `${API_BASE}/ref/${encodeURIComponent(code)}`;
    }
  }, [code]);
  return <div className="section">Setting referral cookie…</div>;
}

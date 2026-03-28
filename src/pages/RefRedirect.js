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

  return (
    <div className="section">
      <h2>Applying referral…</h2>
      <p className="muted">We are redirecting you to secure your referral credit.</p>
      {!!code && (
        <p className="muted">
          If this takes too long,{" "}
          <a href={`${API_BASE}/ref/${encodeURIComponent(code)}`}>continue manually</a>.
        </p>
      )}
    </div>
  );
}

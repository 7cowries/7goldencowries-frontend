import React, { useCallback, useEffect, useRef, useState } from "react";
import PaywallButton from "./PaywallButton";
import { getJSON } from "../utils/api";

export default function PaymentGuard({ children, loadingFallback = null }) {
  const [status, setStatus] = useState({ paid: null });
  const [error, setError] = useState("");
  const inflightRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (inflightRef.current) {
      return inflightRef.current;
    }
    const pending = getJSON("/api/v1/payments/status", { dedupe: true })
      .then((res) => {
        if (!mountedRef.current) return res;
        setStatus({ paid: Boolean(res?.paid), raw: res });
        setError("");
        return res;
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        setError(err?.message || "Unable to load payment status");
        setStatus({ paid: false });
        return null;
      })
      .finally(() => {
        inflightRef.current = null;
      });
    inflightRef.current = pending;
    return pending;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchStatus();
    const rerun = () => {
      fetchStatus();
    };
    window.addEventListener("profile-updated", rerun);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("profile-updated", rerun);
    };
  }, [fetchStatus]);

  if (status.paid == null) {
    return loadingFallback || <p>Checking subscription status…</p>;
  }

  if (status.paid) {
    return <>{children}</>;
  }

  return (
    <>
      {error ? (
        <p className="error" style={{ marginBottom: 12 }}>
          {error}
        </p>
      ) : (
        <p style={{ marginBottom: 12 }}>
          Become a subscriber to unlock this reward.
        </p>
      )}
      <PaywallButton onSuccess={fetchStatus} />
    </>
  );
}

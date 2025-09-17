import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { beginCell, Cell, toNano } from "@ton/core";
import Toast from "./Toast";
import { postJSON } from "../utils/api";

const PLACEHOLDER_ADDRESS = "EQC7GCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const PAYMENT_MINUTES = 10;

function toHex(bytes) {
  if (!bytes) return "";
  if (typeof bytes.toString === "function") {
    try {
      const maybeHex = bytes.toString("hex");
      if (maybeHex && maybeHex !== "[object Object]") {
        return maybeHex;
      }
    } catch (_) {
      /* ignore */
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function encodeComment(comment) {
  try {
    return beginCell()
      .storeUint(0, 32)
      .storeStringTail(comment)
      .endCell()
      .toBoc()
      .toString("base64");
  } catch (err) {
    console.warn("[PaywallButton] failed to encode comment", err);
    return "";
  }
}

function computeHash(result) {
  if (!result) return null;
  const direct =
    result.transaction?.hash ||
    result.txid?.hash ||
    result.hash ||
    null;
  if (direct) return String(direct);
  if (result.boc) {
    try {
      const cell = Cell.fromBase64(result.boc);
      return toHex(cell.hash());
    } catch (err) {
      console.warn("[PaywallButton] unable to derive hash from BOC", err);
    }
  }
  return null;
}

function toNanoSafe(value) {
  try {
    return toNano(String(value || "0")).toString();
  } catch (err) {
    console.warn("[PaywallButton] unable to convert amount", err);
    return "0";
  }
}

export default function PaywallButton({ onSuccess }) {
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const receiveAddress = useMemo(() => {
    const env = process.env.REACT_APP_TON_RECEIVE_ADDRESS || "";
    return env.trim() || PLACEHOLDER_ADDRESS;
  }, []);

  const tonAmount = useMemo(() => {
    if (typeof window !== "undefined" && window.__TON_PAYMENT_TON) {
      return String(window.__TON_PAYMENT_TON);
    }
    return process.env.REACT_APP_TON_PAYMENT_TON || "0.5";
  }, []);

  const amountNano = useMemo(() => toNanoSafe(tonAmount), [tonAmount]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = window.setTimeout(() => {
      setToast("");
      timeoutRef.current = null;
    }, 3200);
  }, []);

  const requestPayment = useCallback(async () => {
    if (loading) return;
    if (!tonConnectUI) {
      showToast("TonConnect UI unavailable");
      return;
    }
    if (!receiveAddress || receiveAddress === PLACEHOLDER_ADDRESS) {
      showToast("Payment address not configured");
      return;
    }
    setLoading(true);

    const comment = `7GC-SUB:${Date.now()}`;
    const payload = encodeComment(comment);
    const validUntil = Math.floor(Date.now() / 1000) + PAYMENT_MINUTES * 60;

    try {
      const transactionRequest = {
        validUntil,
        messages: [
          {
            address: receiveAddress,
            amount: amountNano,
            payload,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transactionRequest);
      const txHash = computeHash(result);
      if (!txHash) {
        throw new Error("Transaction hash unavailable");
      }

      const verifyResponse = await postJSON("/api/v1/payments/verify", {
        txHash,
        amount: amountNano,
        to: receiveAddress,
        comment,
      });

      if (!verifyResponse?.verified) {
        throw new Error("Payment verification failed");
      }

      window.dispatchEvent(new Event("profile-updated"));
      showToast("Payment verified 🎉");
      onSuccess?.();
    } catch (err) {
      const rejected =
        err?.code === "USER_REJECTS_ERROR" ||
        err?.code === 4001 ||
        (typeof err?.message === "string" &&
          err.message.toLowerCase().includes("reject"));
      if (rejected) {
        showToast("Payment cancelled");
      } else {
        const message = err?.message || "Payment failed";
        showToast(message.startsWith("Network error") ? message : `${message}`);
      }
      console.warn("[PaywallButton] payment failed", err);
    } finally {
      setLoading(false);
    }
  }, [amountNano, loading, onSuccess, receiveAddress, showToast, tonConnectUI]);

  const walletLabel = tonWallet?.account?.address
    ? `${tonWallet.account.address.slice(0, 4)}…${tonWallet.account.address.slice(-4)}`
    : null;

  return (
    <div className="paywall-card">
      <p style={{ marginBottom: 12 }}>
        Unlock premium quests by sending <strong>{tonAmount} TON</strong> to our secure vault.
      </p>
      {walletLabel ? (
        <p className="muted" style={{ marginBottom: 12 }}>
          Connected wallet: {walletLabel}
        </p>
      ) : null}
      <button className="btn" onClick={requestPayment} disabled={loading}>
        {loading ? "Processing…" : `Unlock with TonConnect`}
      </button>
      <Toast message={toast} />
    </div>
  );
}

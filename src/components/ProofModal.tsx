import React, { useState } from "react";

type Props = {
  questId: number;
  requirement?: string | null;
  onClose: () => void;
  onSubmitted: (nextStatus: "pending" | "approved") => void;
};

export default function ProofModal({ questId, requirement, onClose, onSubmitted }: Props) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const vendor = requirement?.startsWith("twitter")
    ? "twitter"
    : requirement?.startsWith("telegram")
    ? "telegram"
    : requirement?.startsWith("discord")
    ? "discord"
    : "link";

  async function submit() {
    if (!url) return;
    try {
      localStorage.getItem("wallet");
    } catch {}
    setBusy(true);
    try {
      const res = await fetch(`/api/quests/${questId}/proofs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, vendor }),
      });
      if (!res.ok) throw new Error("Submit failed");
      const data = await res.json();
      onSubmitted(data.status === "approved" ? "approved" : "pending");
      onClose();
    } catch (e) {
      alert("Could not submit proof. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-[#12161d] p-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Submit proof</h3>
        <p className="text-sm opacity-80 mb-3">
          Paste the link that proves you completed this quest.
        </p>
        <input
          className="w-full rounded-md bg-[#0f131a] border border-white/10 p-2 mb-3"
          placeholder="https://x.com/… or https://t.me/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-md bg-white/10">Cancel</button>
          <button
            onClick={submit}
            disabled={busy || !url}
            className="px-3 py-2 rounded-md bg-yellow-500 text-black disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

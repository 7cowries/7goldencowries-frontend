const DEFAULT_LIMIT = 20;

function toBigInt(value) {
  if (value == null) return 0n;
  try {
    return BigInt(String(value));
  } catch (err) {
    return 0n;
  }
}

function normalizeAddress(value) {
  if (!value) return "";
  return String(value).trim();
}

function decodeComment(message) {
  if (!message) return "";
  if (typeof message.comment === "string" && message.comment) {
    return message.comment;
  }
  const data = message.msg_data || message.body || {};
  if (typeof data.text === "string" && data.text) {
    return data.text;
  }
  const body = data.body || message.body;
  if (typeof body === "string" && body) {
    try {
      const buf = Buffer.from(body, "base64");
      const text = buf.toString("utf8").replace(/\0+$/g, "");
      if (text) return text;
    } catch (err) {
      /* ignore */
    }
  }
  return "";
}

async function fetchToncenterTransactions(address, limit = DEFAULT_LIMIT) {
  const network = (process.env.TON_NETWORK || "mainnet").toLowerCase();
  const base = network === "testnet"
    ? "https://testnet.toncenter.com/api/v2"
    : "https://toncenter.com/api/v2";
  const apiKey = process.env.TONCENTER_API_KEY || "";
  const params = new URLSearchParams({
    address: normalizeAddress(address),
    limit: String(limit),
  });
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-API-Key'] = apiKey;
  const res = await fetch(`${base}/getTransactions?${params.toString()}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error(`toncenter responded with ${res.status}`);
  }
  const data = await res.json();
  const items = data?.result || data?.transactions || [];
  return Array.isArray(items) ? items : [];
}

function collectHashes(tx) {
  const hashes = [];
  if (!tx || typeof tx !== "object") return hashes;
  const candidates = [
    tx.hash,
    tx.transaction_id?.hash,
    tx.transaction_id?.lt,
    tx.in_msg?.hash,
    tx.in_msg?.msg_id,
  ];
  candidates.forEach((value) => {
    if (value) hashes.push(String(value).toLowerCase());
  });
  return hashes;
}

function resolveDestination(tx) {
  const inMsg = tx?.in_msg || tx?.inMessage || tx || {};
  const dest =
    inMsg.destination?.address ||
    inMsg.destination ||
    tx?.account_addr ||
    tx?.address ||
    null;
  return normalizeAddress(dest);
}

function resolveAmount(tx) {
  const inMsg = tx?.in_msg || tx?.inMessage || tx || {};
  const values = [
    inMsg.value,
    inMsg.amount,
    tx?.in_msg_value,
    tx?.value,
  ];
  for (const value of values) {
    if (value != null) {
      return toBigInt(value);
    }
  }
  return 0n;
}

async function verifyTonPayment({ txHash, to, minAmount = 0, comment }) {
  if (!txHash) throw new Error("txHash is required");
  if (!to) throw new Error("destination address is required");
  const provider = (process.env.TON_VERIFIER || "toncenter").toLowerCase();
  if (provider !== "toncenter") {
    throw new Error(`Unsupported TON verifier: ${provider}`);
  }
  const targetHash = String(txHash).toLowerCase();
  const expectedTo = normalizeAddress(to);
  const min = typeof minAmount === "string" || typeof minAmount === "number"
    ? toBigInt(minAmount)
    : (typeof minAmount === "bigint" ? minAmount : 0n);

  const transactions = await fetchToncenterTransactions(expectedTo);
  const match = transactions.find((tx) => collectHashes(tx).includes(targetHash));
  if (!match) {
    return { verified: false };
  }

  const destination = resolveDestination(match) || expectedTo;
  if (normalizeAddress(destination) !== expectedTo) {
    return {
      verified: false,
      amount: resolveAmount(match).toString(),
      to: normalizeAddress(destination),
      comment: decodeComment(match?.in_msg),
    };
  }

  const amount = resolveAmount(match);
  if (amount < min) {
    return {
      verified: false,
      amount: amount.toString(),
      to: expectedTo,
      comment: decodeComment(match?.in_msg),
    };
  }

  const memo = decodeComment(match?.in_msg);
  if (comment && typeof comment === "string") {
    const needle = comment.includes("7GC-SUB") ? "7GC-SUB" : comment;
    if (!memo || !memo.includes(needle)) {
      return {
        verified: false,
        amount: amount.toString(),
        to: expectedTo,
        comment: memo,
      };
    }
  }

  return {
    verified: true,
    amount: amount.toString(),
    to: expectedTo,
    comment: memo,
  };
}

module.exports = {
  verifyTonPayment,
};

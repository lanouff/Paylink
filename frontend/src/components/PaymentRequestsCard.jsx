import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function PaymentRequestsCard({ token }) {
  const [tab, setTab] = useState("outgoing"); // outgoing | incoming

  const [targetHandle, setTargetHandle] = useState("");
  const [amount, setAmount] = useState(""); // pounds input
  const [note, setNote] = useState("");

  const [requests, setRequests] = useState([]);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  async function load(which = tab) {
    setErr("");
    try {
      const path =
        which === "incoming"
          ? "/payment-requests/incoming/"
          : "/payment-requests/outgoing/";

      const data = await apiFetch(path, { token });
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function create(e) {
    e.preventDefault();
    setErr("");
    setInfo("");

    const pounds = Number(amount);
    if (!Number.isFinite(pounds) || pounds <= 0) {
      setErr("Enter a valid amount (e.g. 10 or 10.50)");
      return;
    }
    const amount_in_minor = Math.round(pounds * 100);

    try {
      const data = await apiFetch("/payment-requests/", {
        method: "POST",
        token,
        body: {
          target_handle: targetHandle.trim().toLowerCase().replace(/^@/, ""),
          amount_in_minor,
          currency: "GBP",
          note,
        },
      });

      setInfo(`Created request to @${data.target_handle} for £${(data.amount_in_minor / 100).toFixed(2)}`);
      setTargetHandle("");
      setAmount("");
      setNote("");

      // after creating, show outgoing and refresh
      setTab("outgoing");
      await load("outgoing");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 18,
    display: "grid",
    gap: 12,
  };

  const inputStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #3a3a3a",
    background: "#1b1b1b",
    color: "white",
    outline: "none",
  };

  const buttonStyle = {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #2a2a2a",
    background: "#101010",
    color: "white",
    cursor: "pointer",
  };

  const tabBtn = (active) => ({
    ...buttonStyle,
    flex: 1,
    opacity: active ? 0.85 : 1,
  });

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Payment Requests</h2>
        <button onClick={() => load(tab)} style={{ ...buttonStyle, opacity: 0.9 }}>
          Refresh
        </button>
      </div>

      {/* Create form */}
      <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
        <input
          value={targetHandle}
          onChange={(e) => setTargetHandle(e.target.value)}
          placeholder="Target handle (e.g. @john)"
          style={inputStyle}
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in £ (e.g. 10.50)"
          style={inputStyle}
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Create Payment Request
        </button>
      </form>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setTab("outgoing")} style={tabBtn(tab === "outgoing")}>
          Outgoing
        </button>
        <button onClick={() => setTab("incoming")} style={tabBtn(tab === "incoming")}>
          Incoming
        </button>
      </div>

      {info && (
        <div style={{ background: "#0f1a10", border: "1px solid #1f5a2a", padding: 12, borderRadius: 12 }}>
          <b style={{ color: "#39d353" }}>OK:</b> {info}
        </div>
      )}

      {err && (
        <div style={{ background: "#1a0f0f", border: "1px solid #5a1f1f", padding: 12, borderRadius: 12 }}>
          <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {requests.length === 0 ? (
          <div style={{ opacity: 0.8 }}>
            {tab === "incoming" ? "No incoming requests yet." : "No outgoing requests yet."}
          </div>
        ) : (
          requests.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: 12,
                background: "#101010",
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {tab === "incoming" ? (
                  <>From: {r.requester} → You (@{r.target_handle})</>
                ) : (
                  <>To: @{r.target_handle}</>
                )}
                {" — "}£{(r.amount_in_minor / 100).toFixed(2)}
              </div>

              <div style={{ opacity: 0.8, marginTop: 4 }}>
                Status: {r.status} • {new Date(r.created_at).toLocaleString()}
              </div>

              {r.note && <div style={{ marginTop: 6 }}>Note: {r.note}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
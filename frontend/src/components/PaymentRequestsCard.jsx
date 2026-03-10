import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function PaymentRequestsCard({ token }) {
  const [tab, setTab] = useState("outgoing");

  const [targetHandle, setTargetHandle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [requests, setRequests] = useState([]);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  async function load(which = tab) {
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
    let cancelled = false;

    async function fetchRequests() {
      try {
        const path =
          tab === "incoming"
            ? "/payment-requests/incoming/"
            : "/payment-requests/outgoing/";

        const data = await apiFetch(path, { token });

        if (!cancelled) {
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.message);
        }
      }
    }

    fetchRequests();

    return () => {
      cancelled = true;
    };
  }, [tab, token]);

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

      setInfo(`Created request to @${data.target_handle}`);
      setTargetHandle("");
      setAmount("");
      setNote("");

      setTab("outgoing");
      await load("outgoing");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function payNow(id) {
    setErr("");
    setInfo("");

    try {
      const data = await apiFetch(`/truelayer/payment-requests/${id}/start/`, {
        method: "POST",
        token,
      });

      setInfo(data.message);
      await load("incoming");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function declineRequest(id) {
    setErr("");
    setInfo("");

    try {
      const data = await apiFetch(`/payment-requests/${id}/decline/`, {
        method: "POST",
        token,
      });

      setInfo(data.message);
      await load("incoming");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function cancelRequest(id) {
    setErr("");
    setInfo("");

    try {
      const data = await apiFetch(`/payment-requests/${id}/cancel/`, {
        method: "POST",
        token,
      });

      setInfo(data.message);
      await load("outgoing");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function refreshCurrentTab() {
    setErr("");
    setInfo("");
    await load(tab);
  }

  function statusBadge(status) {
    const styles = {
      CREATED: { background: "#3a3a00", color: "#facc15" },
      PAID: { background: "#052e16", color: "#22c55e" },
      FAILED: { background: "#3a0000", color: "#ef4444" },
      CANCELLED: { background: "#2a2a2a", color: "#9ca3af" },
    };

    const s = styles[status] || styles.CREATED;

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.3,
          ...s,
        }}
      >
        {status}
      </span>
    );
  }

  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 22,
    display: "grid",
    gap: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  };

  const inputStyle = {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #3a3a3a",
    background: "#1b1b1b",
    color: "white",
    fontSize: 15,
    outline: "none",
  };

  const buttonStyle = {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #2a2a2a",
    background: "#101010",
    color: "white",
    cursor: "pointer",
    fontSize: 15,
  };

  const activeTabStyle = {
    ...buttonStyle,
    flex: 1,
    background: "#ffffff",
    color: "#111111",
    border: "1px solid #ffffff",
    fontWeight: 700,
  };

  const inactiveTabStyle = {
    ...buttonStyle,
    flex: 1,
    background: "#101010",
    color: "white",
    border: "1px solid #2a2a2a",
    opacity: 0.9,
  };

  const requestCardStyle = {
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 16,
    background: "#101010",
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Payment Requests</h2>
          <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
            Request, track, and manage payments by handle
          </div>
        </div>

        <button onClick={refreshCurrentTab} style={buttonStyle}>
          Refresh
        </button>
      </div>

      <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
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

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={() => setTab("outgoing")}
          style={tab === "outgoing" ? activeTabStyle : inactiveTabStyle}
        >
          Outgoing
        </button>

        <button
          type="button"
          onClick={() => setTab("incoming")}
          style={tab === "incoming" ? activeTabStyle : inactiveTabStyle}
        >
          Incoming
        </button>
      </div>

      {err && (
        <div
          style={{
            background: "#1a0f0f",
            border: "1px solid #5a1f1f",
            padding: 12,
            borderRadius: 12,
          }}
        >
          <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
        </div>
      )}

      {info && (
        <div
          style={{
            background: "#052e16",
            border: "1px solid #14532d",
            padding: 12,
            borderRadius: 12,
          }}
        >
          {info}
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ opacity: 0.7 }}>
          {tab === "incoming" ? "No incoming requests." : "No outgoing requests yet."}
        </div>
      ) : (
        requests.map((r) => (
          <div key={r.id} style={requestCardStyle}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {tab === "incoming" ? (
                <>From: {r.requester_username} → You (@{r.target_handle})</>
              ) : (
                <>To: @{r.target_handle}</>
              )}{" "}
              — £{(r.amount_in_minor / 100).toFixed(2)}
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ opacity: 0.8 }}>Status:</span>
              {statusBadge(r.status)}
              <span style={{ opacity: 0.6 }}>• {new Date(r.created_at).toLocaleString()}</span>
            </div>

            {r.note && <div style={{ marginTop: 10, opacity: 0.92 }}>Note: {r.note}</div>}

            {tab === "incoming" && r.status === "CREATED" && (
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button type="button" onClick={() => payNow(r.id)} style={buttonStyle}>
                  Pay now
                </button>

                <button
                  type="button"
                  onClick={() => declineRequest(r.id)}
                  style={{ ...buttonStyle, borderColor: "#5a1f1f" }}
                >
                  Decline
                </button>
              </div>
            )}

            {tab === "outgoing" && r.status === "CREATED" && (
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => cancelRequest(r.id)}
                  style={{ ...buttonStyle, borderColor: "#5a1f1f" }}
                >
                  Cancel
                </button>
              </div>
            )}

            {r.status === "PAID" && r.payer_username && (
              <div style={{ marginTop: 10, opacity: 0.85 }}>
                Paid by: {r.payer_username}
              </div>
            )}

            {r.paid_at && (
              <div style={{ marginTop: 4, opacity: 0.7 }}>
                Paid at: {new Date(r.paid_at).toLocaleString()}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function BankCard({ token }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [balance, setBalance] = useState(null);
  const [tx, setTx] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 18,
    display: "grid",
    gap: 12,
  };

  const buttonStyle = {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #2a2a2a",
    background: "#101010",
    color: "white",
    cursor: "pointer",
  };

  const selectStyle = {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #3a3a3a",
    background: "#1b1b1b",
    color: "white",
    outline: "none",
    width: "100%",
  };

  async function connectBank() {
    setErr("");
    try {
      const d = await apiFetch("/truelayer/auth-url/", { token });
      window.location.href = d.auth_url; // backend returns {auth_url}
    } catch (e) {
      setErr(e.message);
    }
  }

  async function loadAccounts() {
    setErr("");
    setLoading(true);
    try {
      const d = await apiFetch("/truelayer/accounts/", { token });
      const results = d?.results || [];
      setAccounts(results);

      // auto-select first account if none selected
      if (!selectedId && results.length > 0) {
        setSelectedId(results[0].account_id);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadBalanceAndTx(accountId) {
    if (!accountId) return;
    setErr("");
    setLoading(true);
    try {
      const b = await apiFetch(`/truelayer/accounts/${accountId}/balance/`, { token });
      setBalance(b);

      const t = await apiFetch(`/truelayer/accounts/${accountId}/transactions/`, { token });
      const txResults = t?.results || [];
      setTx(txResults.slice(0, 5)); // show latest 5
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    if (!token) return;
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // when selected changes, load details
  useEffect(() => {
    if (!selectedId) return;
    loadBalanceAndTx(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const connected = accounts.length > 0;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <b>Bank</b>
        <button onClick={connectBank} style={buttonStyle}>
          {connected ? "Reconnect Bank" : "Connect Bank"}
        </button>
      </div>

      <button onClick={loadAccounts} style={buttonStyle} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>

      {accounts.length > 0 && (
        <>
          <div>
            <div style={{ opacity: 0.85, marginBottom: 6 }}>Select account</div>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={selectStyle}>
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>
                  {a.display_name} • {a.account_type} • {a.currency}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <b>Balance</b>
            <pre
              style={{
                margin: 0,
                background: "#101010",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: 12,
                overflowX: "auto",
              }}
            >
              {balance ? JSON.stringify(balance, null, 2) : "No balance loaded yet."}
            </pre>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <b>Latest transactions (5)</b>
            <pre
              style={{
                margin: 0,
                background: "#101010",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: 12,
                overflowX: "auto",
              }}
            >
              {tx.length ? JSON.stringify(tx, null, 2) : "No transactions found."}
            </pre>
          </div>
        </>
      )}

      {!connected && (
        <div style={{ opacity: 0.85 }}>
          Not connected yet. Click <b>Connect Bank</b> to link a bank via TrueLayer.
        </div>
      )}

      {err && (
        <div style={{ background: "#1a0f0f", border: "1px solid #5a1f1f", padding: 12, borderRadius: 12 }}>
          <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
        </div>
      )}
    </div>
  );
}
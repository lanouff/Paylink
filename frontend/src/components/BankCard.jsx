import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

export default function BankCard({ token }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [balance, setBalance] = useState(null);
  const [paylinkBalance, setPaylinkBalance] = useState(null);
  const [tx, setTx] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 22,
    display: "grid",
    gap: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
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

  const selectStyle = {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #3a3a3a",
    background: "#1b1b1b",
    color: "white",
    outline: "none",
    width: "100%",
    fontSize: 15,
  };

  const panelStyle = {
    background: "#101010",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 16,
  };

  async function connectBank() {
    setErr("");
    try {
      const d = await apiFetch("/truelayer/auth-url/", { token });
      window.location.href = d.auth_url;
    } catch (e) {
      setErr(e.message);
    }
  }

  async function loadPayLinkBalance() {
    try {
      const data = await apiFetch("/paylink/balance/", { token });
      setPaylinkBalance(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function loadAccounts() {
    setLoading(true);
    try {
      const d = await apiFetch("/truelayer/accounts/", { token });
      const results = d?.results || [];
      setAccounts(results);

      if (!selectedId && results.length > 0) {
        setSelectedId(results[0].account_id);
      }
    } catch {
      setAccounts([]);
      setSelectedId("");
      setBalance(null);
      setTx([]);
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
      setTx(txResults.slice(0, 5));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function initialLoad() {
      try {
        const data = await apiFetch("/paylink/balance/", { token });
        if (!cancelled) {
          setPaylinkBalance(data);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.message);
        }
      }

      try {
        const d = await apiFetch("/truelayer/accounts/", { token });
        const results = d?.results || [];
        if (!cancelled) {
          setAccounts(results);
          if (!selectedId && results.length > 0) {
            setSelectedId(results[0].account_id);
          }
        }
      } catch {
        if (!cancelled) {
          setAccounts([]);
          setSelectedId("");
          setBalance(null);
          setTx([]);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedId) return;
    loadBalanceAndTx(selectedId);
  }, [selectedId]);

  const connected = accounts.length > 0;

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.account_id === selectedId) || accounts[0] || null,
    [accounts, selectedId]
  );

  const balanceItem = balance?.results?.[0] || null;
  const availableAmount =
    balanceItem?.available ?? balanceItem?.current ?? balanceItem?.amount ?? null;
  const currency =
    balanceItem?.currency || selectedAccount?.currency || "GBP";

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Bank</h2>
          <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
            Connect your bank and view account details
          </div>
        </div>

        <button onClick={connectBank} style={buttonStyle}>
          {connected ? "Reconnect Bank" : "Connect Bank"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={async () => {
            setErr("");
            await loadPayLinkBalance();
            await loadAccounts();
            if (selectedId) {
              await loadBalanceAndTx(selectedId);
            }
          }}
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div style={{ ...panelStyle, border: "1px solid #1f5a2a", background: "#0f1a10" }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>PayLink simulated balance</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>
          {paylinkBalance
            ? `GBP ${(paylinkBalance.amount_in_minor / 100).toFixed(2)}`
            : "Balance unavailable"}
        </div>
        <div style={{ marginTop: 8, opacity: 0.75 }}>
          This balance changes when PayLink payments are settled in the demo.
        </div>
      </div>

      {!connected && (
        <div style={{ ...panelStyle, opacity: 0.85 }}>
          Not connected yet. Click <b>Connect Bank</b> to link a bank via TrueLayer.
        </div>
      )}

      {connected && (
        <>
          <div>
            <div style={{ opacity: 0.85, marginBottom: 8 }}>Select account</div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={selectStyle}
            >
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>
                  {a.display_name} • {a.account_type} • {a.currency}
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div style={panelStyle}>
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Connected account</div>

              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {selectedAccount.display_name || "Unnamed account"}
              </div>

              <div style={{ marginTop: 8, opacity: 0.85 }}>
                Type: {selectedAccount.account_type || "N/A"}
              </div>

              <div style={{ marginTop: 4, opacity: 0.85 }}>
                Currency: {selectedAccount.currency || "N/A"}
              </div>

              {selectedAccount.provider?.display_name && (
                <div style={{ marginTop: 4, opacity: 0.85 }}>
                  Provider: {selectedAccount.provider.display_name}
                </div>
              )}

              <div style={{ marginTop: 4, opacity: 0.65, fontSize: 13 }}>
                Account ID: {selectedAccount.account_id}
              </div>
            </div>
          )}

          <div style={panelStyle}>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Bank balance (TrueLayer)</div>

            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {availableAmount !== null && availableAmount !== undefined
                ? `${currency} ${availableAmount}`
                : "Balance unavailable"}
            </div>
          </div>

          <div style={panelStyle}>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
              Latest transactions
            </div>

            {tx.length === 0 ? (
              <div style={{ opacity: 0.75 }}>No transactions found.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {tx.map((item, index) => (
                  <div
                    key={item.transaction_id || item.timestamp || index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingBottom: 10,
                      borderBottom:
                        index === tx.length - 1 ? "none" : "1px solid #242424",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {item.description || item.merchant_name || "Transaction"}
                      </div>
                      <div style={{ opacity: 0.65, fontSize: 13, marginTop: 4 }}>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : "Unknown date"}
                      </div>
                    </div>

                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                      {item.currency || currency}{" "}
                      {item.amount !== undefined && item.amount !== null
                        ? item.amount
                        : item.running_balance?.amount ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {err && (
        <div style={{ background: "#1a0f0f", border: "1px solid #5a1f1f", padding: 12, borderRadius: 12 }}>
          <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
        </div>
      )}
    </div>
  );
}
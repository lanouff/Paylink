import { useEffect, useState } from "react";
import AuthCard from "./components/AuthCard";
import HandleCard from "./components/HandleCard";
import PaymentRequestsCard from "./components/PaymentRequestsCard";
import { apiFetch, clearToken, getToken } from "./api/client";
import BankCard from "./components/BankCard";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken());
  const [err, setErr] = useState("");

  // auto-load user if token exists
  useEffect(() => {
    if (!token) return;

    apiFetch("/auth/me/", { token })
      .then((d) => {
        setUser(d.username);
      })
      .catch(() => {
        clearToken();
        setToken("");
        setUser(null);
      });
  }, [token]);

  async function logout() {
    setErr("");
    try {
      await apiFetch("/auth/logout/", { method: "POST", token });
    } catch {
      // ignore
    }
    clearToken();
    setToken("");
    setUser(null);
  }

  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 18,
  };

  const buttonStyle = {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #2a2a2a",
    background: "#101010",
    color: "white",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "white",
        fontFamily: "Arial",
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 700, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 42, letterSpacing: 0.3 }}>PayLink</h1>

          {user && (
            <button onClick={logout} style={buttonStyle}>
              Logout
            </button>
          )}
        </div>

        {!user ? (
          <AuthCard
            onAuthed={({ username, token: t }) => {
              setUser(username);
              setToken(t);
            }}
          />
        ) : (
          <>
            <div style={{ ...cardStyle }}>
              Logged in as <b>{user}</b>
            </div>

            <HandleCard token={token} />
            <BankCard token={token} />
            <PaymentRequestsCard token={token} />
          </>
        )}

        {err && (
          <div style={{ ...cardStyle, borderColor: "#5a1f1f", background: "#1a0f0f" }}>
            <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
          </div>
        )}
      </div>
    </div>
  );
}
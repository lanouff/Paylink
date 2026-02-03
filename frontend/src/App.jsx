import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

export default function App() {
  const [mode, setMode] = useState("login"); // login | signup
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);

  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState(null);

  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  // Get CSRF cookie (good practice)
  useEffect(() => {
    fetch(`${API}/csrf/`, { credentials: "include" }).catch(() => {});
  }, []);

  // Check handle availability
  useEffect(() => {
    if (!handle.trim()) {
      setAvailability(null);
      return;
    }

    const h = handle.trim().toLowerCase();
    const t = setTimeout(() => {
      fetch(`${API}/handle/check/?handle=${encodeURIComponent(h)}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => setAvailability(d.available))
        .catch(() => setAvailability(null));
    }, 350);

    return () => clearTimeout(t);
  }, [handle]);

  async function auth(endpoint) {
    setErr("");
    setResult(null);

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");

      setUser(data.username);
      setResult(data);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  async function doLogout() {
    setErr("");
    setResult(null);

    await fetch(`${API}/auth/logout/`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  async function createHandle(e) {
    e.preventDefault();
    setErr("");
    setResult(null);

    try {
      const res = await fetch(`${API}/handle/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ handle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 18,
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
      <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 42, letterSpacing: 0.3 }}>PayLink</h1>

        {!user ? (
          <div style={{ ...cardStyle, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setMode("login")}
                disabled={mode === "login"}
                style={{
                  ...buttonStyle,
                  opacity: mode === "login" ? 0.7 : 1,
                  flex: 1,
                }}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                disabled={mode === "signup"}
                style={{
                  ...buttonStyle,
                  opacity: mode === "signup" ? 0.7 : 1,
                  flex: 1,
                }}
              >
                Signup
              </button>
            </div>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              style={inputStyle}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password (min 6)"
              type="password"
              style={inputStyle}
            />

            {mode === "login" ? (
              <button
                onClick={() => auth("/auth/login/")}
                style={{ ...buttonStyle, marginTop: 4 }}
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => auth("/auth/signup/")}
                style={{ ...buttonStyle, marginTop: 4 }}
              >
                Signup
              </button>
            )}
          </div>
        ) : (
          <div style={{ ...cardStyle, display: "grid", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <p style={{ margin: 0 }}>
                Logged in as <b>{user}</b>
              </p>
              <button onClick={doLogout} style={buttonStyle}>
                Logout
              </button>
            </div>

            <form
              onSubmit={createHandle}
              style={{ display: "grid", gap: 10 }}
            >
              <div>
                <div style={{ marginBottom: 8 }}>Create your handle (no @)</div>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="noufel"
                  style={inputStyle}
                />
              </div>

              {availability !== null && (
                <div style={{ marginTop: 2 }}>
                  Availability:{" "}
                  <b style={{ color: availability ? "#39d353" : "#ff5c5c" }}>
                    {availability ? "Available ✅" : "Taken ❌"}
                  </b>
                </div>
              )}

              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  marginTop: 8,
                }}
              >
                Create Handle
              </button>
            </form>
          </div>
        )}

        {/* Messages/results BELOW cards with safe spacing */}
        {err && (
          <div
            style={{
              ...cardStyle,
              borderColor: "#5a1f1f",
              background: "#1a0f0f",
            }}
          >
            <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
          </div>
        )}

        {result && (
          <pre
            style={{
              ...cardStyle,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowX: "auto",
              background: "#101010",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

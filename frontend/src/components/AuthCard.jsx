import { useState } from "react";
import { apiFetch, setToken } from "../api/client";

export default function AuthCard({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    try {
      const endpoint = mode === "login" ? "/auth/login/" : "/auth/signup/";

      const body =
        mode === "login"
          ? { username, password }
          : { username, email, password };

      const data = await apiFetch(endpoint, {
        method: "POST",
        body,
      });

      setToken(data.token);
      onAuthed(data.token);
    } catch (e) {
      setErr(e.message);
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

  function switchMode(nextMode) {
    setErr("");
    setMode(nextMode);
    if (nextMode === "login") setEmail("");
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => switchMode("login")}
          disabled={mode === "login"}
          style={{ ...buttonStyle, opacity: mode === "login" ? 0.7 : 1, flex: 1 }}
        >
          Login
        </button>
        <button
          onClick={() => switchMode("signup")}
          disabled={mode === "signup"}
          style={{ ...buttonStyle, opacity: mode === "signup" ? 0.7 : 1, flex: 1 }}
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

      {mode === "signup" && (
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          type="email"
          style={inputStyle}
        />
      )}

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password (min 6)"
        type="password"
        style={inputStyle}
      />

      <button onClick={submit} style={{ ...buttonStyle, marginTop: 4 }}>
        {mode === "login" ? "Login" : "Signup"}
      </button>

      {err && (
        <div style={{ background: "#1a0f0f", border: "1px solid #5a1f1f", padding: 12, borderRadius: 12 }}>
          <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
        </div>
      )}
    </div>
  );
}
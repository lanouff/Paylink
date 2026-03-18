import { useState } from "react";
import { apiFetch, setToken } from "../api/client";

export default function AuthCard({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  async function submit() {
    setErr("");
    setInfo("");

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

  async function submitForgotPassword() {
    setErr("");
    setInfo("");

    try {
      const data = await apiFetch("/auth/forgot-password/", {
        method: "POST",
        body: { email },
      });

      setResetToken(data.reset_token || "");
      setInfo("Reset request recorded. You can now set a new password below.");
      setMode("reset");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function submitResetPassword() {
    setErr("");
    setInfo("");

    if (!resetToken) {
      setErr("No reset token found. Please request password reset again.");
      return;
    }

    try {
      const data = await apiFetch("/auth/reset-password/", {
        method: "POST",
        body: {
          email,
          token: resetToken,
          new_password: newPassword,
        },
      });

      setInfo(data.message || "Password reset successfully.");
      setMode("login");
      setPassword("");
      setNewPassword("");
      setResetToken("");
    } catch (e) {
      setErr(e.message);
    }
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
    outline: "none",
    fontSize: 15,
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

  function switchMode(nextMode) {
    setErr("");
    setInfo("");
    setMode(nextMode);

    if (nextMode === "login") {
      setEmail("");
      setResetToken("");
      setNewPassword("");
    }
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => switchMode("login")}
          disabled={mode === "login"}
          style={{ ...buttonStyle, opacity: mode === "login" ? 0.7 : 1, flex: 1 }}
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => switchMode("signup")}
          disabled={mode === "signup"}
          style={{ ...buttonStyle, opacity: mode === "signup" ? 0.7 : 1, flex: 1 }}
        >
          Signup
        </button>

        <button
          type="button"
          onClick={() => switchMode("forgot")}
          disabled={mode === "forgot"}
          style={{ ...buttonStyle, opacity: mode === "forgot" ? 0.7 : 1, flex: 1 }}
        >
          Forgot Password
        </button>
      </div>

      {mode !== "forgot" && mode !== "reset" && (
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          style={inputStyle}
        />
      )}

      {(mode === "signup" || mode === "forgot" || mode === "reset") && (
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          type="email"
          style={inputStyle}
        />
      )}

      {mode !== "forgot" && mode !== "reset" && (
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password (min 6)"
          type="password"
          style={inputStyle}
        />
      )}

      {mode === "reset" && (
        <>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Setting a new password for: <b>{email}</b>
          </div>

          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="new password (min 6)"
            type="password"
            style={inputStyle}
          />
        </>
      )}

      {mode === "forgot" ? (
        <button type="button" onClick={submitForgotPassword} style={buttonStyle}>
          Continue
        </button>
      ) : mode === "reset" ? (
        <button type="button" onClick={submitResetPassword} style={buttonStyle}>
          Reset Password
        </button>
      ) : (
        <button type="button" onClick={submit} style={buttonStyle}>
          {mode === "login" ? "Login" : "Signup"}
        </button>
      )}

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
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {info}
        </div>
      )}
    </div>
  );
}
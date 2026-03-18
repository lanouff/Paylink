import { useState } from "react";
import "./App.css";

import AuthCard from "./components/AuthCard";
import HandleCard from "./components/HandleCard";
import BankCard from "./components/BankCard";
import PaymentRequestsCard from "./components/PaymentRequestsCard";
import HelpCard from "./components/HelpCard";
import ContactCard from "./components/ContactCard";

import { getToken, setToken, clearToken } from "./api/client";

export default function App() {
  const [token, setTokenState] = useState(getToken());
  const [page, setPage] = useState("dashboard");

  function handleAuthed(t) {
    setToken(t);
    setTokenState(t);
    setPage("dashboard");
  }

  function handleLogout() {
    clearToken();
    setTokenState("");
    setPage("dashboard");
  }

  const navBtnStyle = (active) => ({
    padding: "10px 16px",
    borderRadius: 12,
    border: active ? "1px solid #ffffff" : "1px solid #2a2a2a",
    background: active ? "#ffffff" : "#101010",
    color: active ? "#111111" : "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  });

  if (!token) {
    return (
      <div className="app-shell">
        <div className="app-container">
          <div className="app-header auth-header-only">
            <div className="app-title">PayLink</div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setPage("dashboard")}
              style={navBtnStyle(page === "dashboard")}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setPage("help")}
              style={navBtnStyle(page === "help")}
            >
              Help
            </button>
            <button
              type="button"
              onClick={() => setPage("contact")}
              style={navBtnStyle(page === "contact")}
            >
              Contact Us
            </button>
          </div>

          {page === "dashboard" && (
            <div className="auth-wrap">
              <AuthCard onAuthed={handleAuthed} />
            </div>
          )}

          {page === "help" && (
            <div className="section">
              <HelpCard />
            </div>
          )}

          {page === "contact" && (
            <div className="section">
              <ContactCard />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="app-header">
          <div className="app-title">PayLink</div>
          <button className="top-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setPage("dashboard")}
            style={navBtnStyle(page === "dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setPage("help")}
            style={navBtnStyle(page === "help")}
          >
            Help
          </button>
          <button
            type="button"
            onClick={() => setPage("contact")}
            style={navBtnStyle(page === "contact")}
          >
            Contact Us
          </button>
        </div>

        {page === "dashboard" && (
          <>
            <div className="section">
              <HandleCard token={token} />
            </div>

            <div className="section">
              <BankCard token={token} />
            </div>

            <div className="section">
              <PaymentRequestsCard token={token} />
            </div>
          </>
        )}

        {page === "help" && (
          <div className="section">
            <HelpCard />
          </div>
        )}

        {page === "contact" && (
          <div className="section">
            <ContactCard />
          </div>
        )}
      </div>
    </div>
  );
}
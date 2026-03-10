import { useState } from "react";
import "./App.css";

import AuthCard from "./components/AuthCard";
import HandleCard from "./components/HandleCard";
import BankCard from "./components/BankCard";
import PaymentRequestsCard from "./components/PaymentRequestsCard";

import { getToken, setToken, clearToken } from "./api/client";

export default function App() {
  const [token, setTokenState] = useState(getToken());

  function handleAuthed(t) {
    setToken(t);
    setTokenState(t);
  }

  function handleLogout() {
    clearToken();
    setTokenState("");
  }

  if (!token) {
    return (
      <div className="app-shell">
        <div className="app-container">
          <div className="app-header auth-header-only">
            <div className="app-title">PayLink</div>
          </div>

          <div className="auth-wrap">
            <AuthCard onAuthed={handleAuthed} />
          </div>
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

        <div className="section">
          <HandleCard token={token} />
        </div>

        <div className="section">
          <BankCard token={token} />
        </div>

        <div className="section">
          <PaymentRequestsCard token={token} />
        </div>
      </div>
    </div>
  );
}
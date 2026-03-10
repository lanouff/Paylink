import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function HandleCard({ token }) {
  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const h = handle.trim().toLowerCase();
    if (!h) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const d = await apiFetch(`/handles/check/?value=${encodeURIComponent(h)}`);
        if (!cancelled) setAvailability(Boolean(d.available));
      } catch {
        if (!cancelled) setAvailability(null);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [handle]);

  async function createHandle(e) {
    e.preventDefault();
    setErr("");
    setResult(null);

    try {
      const data = await apiFetch("/handles/", {
        method: "POST",
        token,
        body: { value: handle.trim().toLowerCase(), display_name: "" },
      });

      setResult(data);
      setHandle("");
      setAvailability(null);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  const shownAvailability = handle.trim() ? availability : null;

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

  const resultCardStyle = {
    background: "#101010",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 16,
    display: "grid",
    gap: 8,
  };

  return (
    <div style={cardStyle}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Handle</h2>
        <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
          Create your unique PayLink username
        </div>
      </div>

      <form onSubmit={createHandle} style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ marginBottom: 8, opacity: 0.9 }}>Choose a handle</div>
          <input
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
              setErr("");
              setResult(null);
            }}
            placeholder="noufel"
            style={inputStyle}
          />
        </div>

        {shownAvailability !== null && (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${shownAvailability ? "#1f5a2a" : "#5a1f1f"}`,
              background: shownAvailability ? "#0f1a10" : "#1a0f0f",
            }}
          >
            <span style={{ opacity: 0.8 }}>Availability: </span>
            <b style={{ color: shownAvailability ? "#39d353" : "#ff5c5c" }}>
              {shownAvailability ? "Available" : "Taken"}
            </b>
          </div>
        )}

        <button type="submit" style={buttonStyle}>
          Create Handle
        </button>
      </form>

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

      {result && (
        <div
          style={{
            ...resultCardStyle,
            border: "1px solid #1f5a2a",
            background: "#0f1a10",
          }}
        >
          <div style={{ fontWeight: 700, color: "#39d353" }}>Handle created successfully</div>

          <div>
            <span style={{ opacity: 0.75 }}>Your handle</span>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
              @{result.value}
            </div>
          </div>

          {"display_name" in result && (
            <div>
              <span style={{ opacity: 0.75 }}>Display name</span>
              <div style={{ marginTop: 4 }}>{result.display_name || "Not set"}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function HandleCard({ token }) {
  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState(null); // only for async results
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  // availability check (no setState when input empty)
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
        body: { value: handle, display_name: "" },
      });
      setResult(data);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  // ✅ derived value so when handle is empty we show nothing
  const shownAvailability = handle.trim() ? availability : null;

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

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Handle</h2>

      <form onSubmit={createHandle} style={{ display: "grid", gap: 10 }}>
        <div>
          <div style={{ marginBottom: 8 }}>Create your handle (no @)</div>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="noufel"
            style={inputStyle}
          />
        </div>

        {shownAvailability !== null && (
          <div style={{ marginTop: 2 }}>
            Availability:{" "}
            <b style={{ color: shownAvailability ? "#39d353" : "#ff5c5c" }}>
              {shownAvailability ? "Available ✅" : "Taken ❌"}
            </b>
          </div>
        )}

        <button type="submit" style={{ ...buttonStyle, marginTop: 8 }}>
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
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowX: "auto",
            background: "#101010",
            border: "1px solid #2a2a2a",
            padding: 12,
            borderRadius: 12,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function HandleCard({ token }) {
  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState(null);
  const [currentHandle, setCurrentHandle] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function fetchExistingHandle() {
      try {
        const data = await apiFetch("/handles/", { token });
        const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (!cancelled) {
          setCurrentHandle(first);
        }
      } catch {
        if (!cancelled) {
          setCurrentHandle(null);
        }
      }
    }

    fetchExistingHandle();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const h = handle.trim().toLowerCase();
    if (!h || currentHandle) return;

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
  }, [handle, currentHandle]);

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
      setCurrentHandle(data);
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

  const panelStyle = {
    background: "#101010",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 16,
  };

  return (
    <div style={cardStyle}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Handle</h2>
        <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
          Your unique PayLink username
        </div>
      </div>

      {currentHandle ? (
        <div style={{ ...panelStyle, border: "1px solid #1f5a2a", background: "#0f1a10" }}>
          <div style={{ fontWeight: 700, color: "#39d353" }}>Current handle</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
            @{currentHandle.value}
          </div>
          <div style={{ marginTop: 8, opacity: 0.75 }}>
            This account already has a handle.
          </div>
        </div>
      ) : (
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

      {result && !currentHandle && (
        <div
          style={{
            ...panelStyle,
            border: "1px solid #1f5a2a",
            background: "#0f1a10",
          }}
        >
          <div style={{ fontWeight: 700, color: "#39d353" }}>Handle created successfully</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
            @{result.value}
          </div>
        </div>
      )}
    </div>
  );
}
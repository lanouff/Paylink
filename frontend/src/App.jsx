import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

export default function App() {
  const [username, setUsername] = useState("testuser");
  const [handle, setHandle] = useState("");
  const [availability, setAvailability] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!handle.trim()) {
      setAvailability(null);
      return;
    }

    const t = setTimeout(() => {
      fetch(`${API}/handle/check/?handle=${handle.toLowerCase()}`)
        .then((r) => r.json())
        .then((d) => setAvailability(d.available))
        .catch(() => setAvailability(null));
    }, 400);

    return () => clearTimeout(t);
  }, [handle]);

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    setResult(null);

    try {
      const res = await fetch(`${API}/handle/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, handle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 24, maxWidth: 600 }}>
      <h1>PayLink</h1>

      <form onSubmit={onCreate}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />

        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="handle"
        />

        <button>Create handle</button>
      </form>

      {availability !== null && (
        <p>{availability ? "Available ✅" : "Taken ❌"}</p>
      )}

      {err && <p style={{ color: "red" }}>{err}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

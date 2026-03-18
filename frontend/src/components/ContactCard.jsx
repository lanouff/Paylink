import { useState } from "react";
import { apiFetch } from "../api/client";

export default function ContactCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

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
    fontSize: 15,
    outline: "none",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 120,
    resize: "vertical",
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

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");

    try {
      const data = await apiFetch("/contact/", {
        method: "POST",
        body: { name, email, subject, message },
      });

      setInfo(data.message || "Message sent successfully.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div style={cardStyle}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Contact Us</h2>
        <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
          Send us a message if you need support or have feedback
        </div>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" type="email" style={inputStyle} />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={inputStyle} />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message" style={textareaStyle} />
        <button type="submit" style={buttonStyle}>Send Message</button>
      </form>

      {err && (
        <div style={{ background: "#1a0f0f", border: "1px solid #5a1f1f", padding: 12, borderRadius: 12 }}>
          <b style={{ color: "#ff5c5c" }}>Error:</b> {err}
        </div>
      )}

      {info && (
        <div style={{ background: "#052e16", border: "1px solid #14532d", padding: 12, borderRadius: 12 }}>
          {info}
        </div>
      )}
    </div>
  );
}
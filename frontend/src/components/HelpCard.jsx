export default function HelpCard() {
  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 22,
    display: "grid",
    gap: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  };

  const itemStyle = {
    background: "#101010",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 14,
  };

  return (
    <div style={cardStyle}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Help</h2>
        <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
          How PayLink works
        </div>
      </div>

      <div style={itemStyle}>
        <b>1. Create an account</b>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Sign up or log in to access your PayLink dashboard.
        </div>
      </div>

      <div style={itemStyle}>
        <b>2. Create your handle</b>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Choose a unique PayLink handle that others can use to send payment requests to you.
        </div>
      </div>

      <div style={itemStyle}>
        <b>3. Connect your bank</b>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Link your bank account using TrueLayer to view accounts, balances, and transactions.
        </div>
      </div>

      <div style={itemStyle}>
        <b>4. Create payment requests</b>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Enter a target handle, amount, and optional note to send a request.
        </div>
      </div>

      <div style={itemStyle}>
        <b>5. Manage requests</b>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Incoming requests can be paid or declined. Outgoing requests can be cancelled.
        </div>
      </div>
    </div>
  );
}
export default function StatCard({ label, value, hint }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{value}</div>
      {hint ? <div style={{ color: "#cbd5e1", fontSize: 13 }}>{hint}</div> : null}
    </div>
  );
}
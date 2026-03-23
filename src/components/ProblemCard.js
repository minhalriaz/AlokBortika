export default function ProblemCard({
  title,
  description,
  category,
  status,
  organizationName,
  location,
  actionText,
  onAction,
  disabled = false,
}) {
  const statusColor =
    status === "done"
      ? "#22c55e"
      : status === "in-progress"
      ? "#f59e0b"
      : "#38bdf8";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 18,
        boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div>
          <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>{title}</h3>
          <p style={{ margin: "0 0 12px", color: "#cbd5e1", lineHeight: 1.5 }}>{description}</p>
        </div>

        <span
          style={{
            whiteSpace: "nowrap",
            padding: "6px 10px",
            borderRadius: 999,
            background: `${statusColor}22`,
            color: statusColor,
            border: `1px solid ${statusColor}55`,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
        <span
          style={{
            fontSize: 13,
            color: "#cbd5e1",
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.05)",
          }}
        >
          Category: {category || "General"}
        </span>

        {organizationName ? (
          <span
            style={{
              fontSize: 13,
              color: "#cbd5e1",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            Organization: {organizationName}
          </span>
        ) : null}

        {location ? (
          <span
            style={{
              fontSize: 13,
              color: "#cbd5e1",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            Location: {location}
          </span>
        ) : null}
      </div>

      {actionText && onAction ? (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={onAction}
            disabled={disabled}
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: disabled ? "#475569" : "#2563eb",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {actionText}
          </button>
        </div>
      ) : null}
    </div>
  );
}
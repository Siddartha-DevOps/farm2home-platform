function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: t.type === "success" ? "#1a7a4a" : t.type === "error" ? "#c0392b" : "#2c3e50",
          color: "#fff", padding: "12px 20px", borderRadius: 12, cursor: "pointer",
          fontSize: 14, fontFamily: "'Sora', sans-serif", fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 10,
          animation: "slideIn 0.3s ease", maxWidth: 320
        }}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
export default Toast;

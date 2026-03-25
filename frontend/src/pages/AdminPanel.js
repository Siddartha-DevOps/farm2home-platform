import { FARMERS, PRODUCTS } from "../data/mockData";
import { fmt } from "../utilities/helpers";

function AdminPanel() {
  const totalRevenue = FARMERS.reduce((s, f) => s + f.totalRevenue, 0);
  const totalOrders = FARMERS.reduce((s, f) => s + f.orders, 0);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 5%", fontFamily: "'Sora', sans-serif" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "#0d4f2e", marginTop: 0 }}>⚡ Admin Panel</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Platform Revenue", value: fmt(totalRevenue), icon: "💰", bg: "#e8f5e9", color: "#1a7a4a" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: "📦", bg: "#e3f2fd", color: "#1565c0" },
          { label: "Active Farmers", value: FARMERS.length, icon: "👨‍🌾", bg: "#fff3e0", color: "#e65100" },
          { label: "Products Listed", value: PRODUCTS.length, icon: "🥦", bg: "#f3e5f5", color: "#7b1fa2" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 20, padding: 24, border: `1px solid ${s.color}22` }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Farmers Table */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", marginBottom: 28 }}>
        <h3 style={{ color: "#0d4f2e", marginTop: 0, fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Manage Farmers</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0faf4" }}>
              {["Farmer", "Location", "Products", "Orders", "Revenue", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FARMERS.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{f.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: "#f9a825" }}>★ {f.rating}</div>
                  </div>
                </td>
                <td style={{ padding: 16, color: "#555", fontSize: 13 }}>{f.location}</td>
                <td style={{ padding: 16, fontWeight: 600 }}>{f.products}</td>
                <td style={{ padding: 16, fontWeight: 600 }}>{f.orders}</td>
                <td style={{ padding: 16, fontWeight: 700, color: "#1a7a4a" }}>{fmt(f.totalRevenue)}</td>
                <td style={{ padding: 16 }}><span style={{ background: "#e8f5e9", color: "#1a7a4a", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>✓ Active</span></td>
                <td style={{ padding: 16, display: "flex", gap: 6 }}>
                  <button style={{ background: "#e8f5e9", color: "#0d4f2e", border: "none", padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>View</button>
                  <button style={{ background: "#fdecea", color: "#c62828", border: "none", padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminPanel;

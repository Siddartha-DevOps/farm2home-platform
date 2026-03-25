import { FARMERS, PRODUCTS, ORDERS } from "../data/mockData";
import { fmt } from "../utilities/helpers";

function FarmerDashboard({ user }) {
  const farmer = FARMERS.find(f => f.name === user?.name) || FARMERS[0];
  const myProducts = PRODUCTS.filter(p => p.farmerId === farmer.id);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 5%", fontFamily: "'Sora', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "#0d4f2e", margin: 0 }}>Farmer Dashboard</h2>
          <p style={{ color: "#888", marginTop: 6 }}>Welcome back, {farmer.name} 👨‍🌾</p>
        </div>
        <button style={{ background: "#0d4f2e", color: "#fff", padding: "12px 24px", borderRadius: 30, border: "none", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>+ Add Product</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Total Revenue", value: fmt(farmer.totalRevenue), icon: "💰", color: "#1a7a4a" },
          { label: "Total Orders", value: farmer.orders, icon: "📦", color: "#1565c0" },
          { label: "Active Products", value: farmer.products, icon: "🥦", color: "#e65100" },
          { label: "Pending Orders", value: farmer.pendingOrders, icon: "⏳", color: "#7b1fa2" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Products */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", marginBottom: 28 }}>
        <h3 style={{ color: "#0d4f2e", marginTop: 0, fontFamily: "'Playfair Display', serif", fontSize: 22 }}>My Products</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0faf4" }}>
              {["Product", "Category", "Price", "Stock", "Rating", "Organic", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myProducts.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{p.img}</span>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </td>
                <td style={{ padding: "16px", color: "#555", fontSize: 13 }}>{p.category}</td>
                <td style={{ padding: "16px", fontWeight: 700, color: "#0d4f2e" }}>{fmt(p.price)}/{p.unit}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{ color: p.stock < 50 ? "#e74c3c" : "#1a7a4a", fontWeight: 600 }}>{p.stock} units</span>
                </td>
                <td style={{ padding: "16px", color: "#f9a825" }}>★ {p.rating}</td>
                <td style={{ padding: "16px" }}>{p.organic ? <span style={{ background: "#e8f5e9", color: "#1a7a4a", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Yes</span> : "No"}</td>
                <td style={{ padding: "16px" }}>
                  <button style={{ background: "#e8f5e9", color: "#0d4f2e", border: "none", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700, marginRight: 6 }}>Edit</button>
                  <button style={{ background: "#fdecea", color: "#c62828", border: "none", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Orders */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
        <h3 style={{ color: "#0d4f2e", marginTop: 0, fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Recent Orders</h3>
        {ORDERS.map(o => (
          <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid #f5f5f5" }}>
            <span style={{ fontSize: 32 }}>{o.img}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{o.product} × {o.qty}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Order #{o.id} · {o.date}</div>
            </div>
            <div style={{ fontWeight: 700, color: "#0d4f2e" }}>₹{o.total}</div>
            <span style={{ background: "#e8f5e9", color: "#1a7a4a", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{o.status}</span>
            <button style={{ background: "#f0faf4", border: "none", color: "#0d4f2e", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Update →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default FarmerDashboard;

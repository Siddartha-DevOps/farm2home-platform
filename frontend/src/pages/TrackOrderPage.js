import { ORDERS } from "../data/mockData";

function TrackOrderPage() {
  const steps = ["ordered", "confirmed", "packed", "shipped", "delivered"];
  const stepLabels = { ordered: "Order Placed", confirmed: "Confirmed", packed: "Packed", shipped: "Out for Delivery", delivered: "Delivered" };
  const stepIcons = { ordered: "📝", confirmed: "✅", packed: "📦", shipped: "🚚", delivered: "🏡" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 5%", fontFamily: "'Sora', sans-serif" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0d4f2e", marginTop: 0 }}>Track Your Orders</h2>
      {ORDERS.map(order => {
        const curIdx = steps.indexOf(order.status);
        return (
          <div key={order.id} style={{ background: "#fff", borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ fontSize: 48 }}>{order.img}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{order.product}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>Order #{order.id} · by {order.farmer}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>Placed: {order.date} · Qty: {order.qty}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#0d4f2e" }}>₹{order.total}</div>
                <div style={{ background: order.status === "delivered" ? "#e8f5e9" : order.status === "shipped" ? "#e3f2fd" : "#fff3e0", color: order.status === "delivered" ? "#1a7a4a" : order.status === "shipped" ? "#1565c0" : "#e65100", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginTop: 6, textTransform: "capitalize" }}>
                  {stepIcons[order.status]} {order.status}
                </div>
              </div>
            </div>
            {/* Tracker */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      background: i <= curIdx ? "#1a7a4a" : "#f0f0f0",
                      boxShadow: i === curIdx ? "0 0 0 4px rgba(26,122,74,0.2)" : "none",
                      transition: "all 0.3s"
                    }}>{i <= curIdx ? stepIcons[s] : "○"}</div>
                    <span style={{ fontSize: 10, color: i <= curIdx ? "#0d4f2e" : "#aaa", fontWeight: i === curIdx ? 700 : 400, textAlign: "center", width: 70 }}>{stepLabels[s]}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 3, background: i < curIdx ? "#1a7a4a" : "#e0e0e0", margin: "0 4px", marginBottom: 24, borderRadius: 2 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default TrackOrderPage;

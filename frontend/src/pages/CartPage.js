import { useApp } from "../context/AppContext";
import { fmt, discounted } from "../utilities/helpers";

function CartPage({ cart, setCart, setPage }) {
  const { addToast } = useApp();
  const total = cart.reduce((s, i) => s + discounted(i.price, i.discount) * i.qty, 0);
  const deliveryFee = total > 500 ? 0 : 40;
  const savings = cart.reduce((s, i) => s + (i.price - discounted(i.price, i.discount)) * i.qty, 0);

  const updateQty = (id, qty) => {
    if (qty < 1) { setCart(c => c.filter(x => x.id !== id)); return; }
    setCart(c => c.map(x => x.id === id ? { ...x, qty } : x));
  };

  if (cart.length === 0) return (
    <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "'Sora', sans-serif" }}>
      <div style={{ fontSize: 80 }}>🛒</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#0d4f2e", fontSize: 32 }}>Your cart is empty</h2>
      <p style={{ color: "#888" }}>Add fresh produce to get started</p>
      <button onClick={() => setPage("products")} style={{ background: "#0d4f2e", color: "#fff", padding: "14px 32px", borderRadius: 30, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginTop: 16 }}>Shop Now →</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5%", fontFamily: "'Sora', sans-serif", display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0d4f2e", marginTop: 0 }}>Your Cart ({cart.length} items)</h2>
        {cart.map(item => {
          const fp = discounted(item.price, item.discount);
          return (
            <div key={item.id} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, display: "flex", gap: 20, alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 56, width: 80, height: 80, background: "#f0faf4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.img}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#111" }}>{item.name}</div>
                <div style={{ color: "#888", fontSize: 13, marginTop: 3 }}>by {item.farmer} · {item.location}</div>
                <div style={{ color: item.organic ? "#1a7a4a" : "#888", fontSize: 12, marginTop: 4 }}>{item.organic ? "🌿 Organic" : "Conventional"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0faf4", borderRadius: 30, padding: "6px 14px" }}>
                <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#0d4f2e", fontWeight: 800 }}>−</button>
                <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#0d4f2e", fontWeight: 800 }}>+</button>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0d4f2e" }}>{fmt(fp * item.qty)}</div>
                {item.discount > 0 && <div style={{ fontSize: 12, color: "#e74c3c" }}>Save {fmt((item.price - fp) * item.qty)}</div>}
                <div style={{ fontSize: 12, color: "#aaa" }}>{fmt(fp)}/{item.unit}</div>
              </div>
              <button onClick={() => { setCart(c => c.filter(x => x.id !== item.id)); addToast("Item removed", "info"); }} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", position: "sticky", top: 100 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0d4f2e", marginTop: 0 }}>Order Summary</h3>
        {[
          ["Subtotal", fmt(total)],
          ["Delivery", total > 500 ? "FREE 🎉" : fmt(deliveryFee)],
          ["You save", `−${fmt(savings)}`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 15, color: k === "You save" ? "#1a7a4a" : "#555" }}>
            <span>{k}</span><span style={{ fontWeight: k === "You save" ? 700 : 400 }}>{v}</span>
          </div>
        ))}
        <div style={{ borderTop: "2px solid #e8f5e9", paddingTop: 16, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 20, color: "#0d4f2e", marginTop: 8 }}>
          <span>Total</span><span>{fmt(total + deliveryFee)}</span>
        </div>
        {total < 500 && <div style={{ fontSize: 12, color: "#1a7a4a", marginTop: 8, background: "#e8f5e9", padding: "8px 12px", borderRadius: 8 }}>Add {fmt(500 - total)} more for FREE delivery!</div>}
        <button onClick={() => setPage("checkout")} style={{
          width: "100%", background: "linear-gradient(135deg, #0d4f2e, #1a7a4a)", color: "#fff",
          padding: "16px", borderRadius: 14, border: "none", cursor: "pointer",
          fontSize: 16, fontWeight: 800, marginTop: 20, fontFamily: "'Sora', sans-serif"
        }}>Proceed to Checkout →</button>
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
          {["💳", "🏦", "📱", "💵"].map((ic, i) => (
            <div key={i} style={{ background: "#f0faf4", padding: "6px 10px", borderRadius: 8, fontSize: 16 }}>{ic}</div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 8 }}>Secure Payment · SSL Encrypted</div>
      </div>
    </div>
  );
}
export default CartPage;

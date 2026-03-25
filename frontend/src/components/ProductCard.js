import { useApp } from "../context/AppContext";
import { fmt, discounted } from "../utilities/helpers";

function ProductCard({ product: p, addToCart }) {
  const { addToast } = useApp();
  const finalPrice = discounted(p.price, p.discount);

  return (
    <div style={{
      background: "#fff", borderRadius: 20, overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
      transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
      fontFamily: "'Sora', sans-serif"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,79,46,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
    >
      <div style={{ height: 160, background: "linear-gradient(135deg, #e8f5e9, #f0faf4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, position: "relative" }}>
        {p.img}
        {p.discount > 0 && (
          <div style={{ position: "absolute", top: 12, left: 12, background: "#e74c3c", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{p.discount}% OFF</div>
        )}
        {p.organic && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "#1a7a4a", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>🌿 Organic</div>
        )}
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
          <span>{p.category}</span>
          <span style={{ color: p.stock < 50 ? "#e74c3c" : "#1a7a4a" }}>
            {p.stock < 50 ? `Only ${p.stock} left!` : "In stock"}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#111", marginBottom: 4 }}>{p.name}</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>by {p.farmer} · 📍 {p.location}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ color: "#f9c74f", fontSize: 12 }}>{"★".repeat(Math.floor(p.rating))}</span>
          <span style={{ fontSize: 12, color: "#555" }}>{p.rating} ({p.reviews})</span>
          <span style={{ fontSize: 11, color: "#aaa", marginLeft: "auto" }}>⚡ {p.deliveryDays}d delivery</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#0d4f2e" }}>{fmt(finalPrice)}</span>
            <span style={{ fontSize: 12, color: "#aaa" }}>/{p.unit}</span>
            {p.discount > 0 && <div style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>{fmt(p.price)}</div>}
          </div>
          <button onClick={() => { addToCart(p); addToast(`${p.name} added to cart!`, "success"); }} style={{
            background: "#0d4f2e", color: "#fff", border: "none", padding: "10px 18px",
            borderRadius: 30, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif",
            transition: "background 0.2s"
          }}>Add +</button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

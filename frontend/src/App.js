import { useState, useEffect, createContext, useContext } from "react";

// ─── Context ────────────────────────────────────────────────────────────────
const AppContext = createContext();
const useApp = () => useContext(AppContext);

// ─── Mock Data ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Organic Tomatoes", farmer: "Ravi Kumar", farmerId: 1, location: "Pune, MH", price: 45, unit: "kg", rating: 4.8, reviews: 234, stock: 150, category: "Vegetables", organic: true, img: "🍅", discount: 10, deliveryDays: 1 },
  { id: 2, name: "Fresh Spinach", farmer: "Lakshmi Devi", farmerId: 2, location: "Nashik, MH", price: 30, unit: "bunch", rating: 4.6, reviews: 189, stock: 80, category: "Leafy Greens", organic: true, img: "🥬", discount: 0, deliveryDays: 1 },
  { id: 3, name: "Alphonso Mangoes", farmer: "Suresh Patil", farmerId: 3, location: "Ratnagiri, MH", price: 320, unit: "dozen", rating: 4.9, reviews: 567, stock: 40, category: "Fruits", organic: false, img: "🥭", discount: 15, deliveryDays: 2 },
  { id: 4, name: "Baby Potatoes", farmer: "Meera Singh", farmerId: 4, location: "Shimla, HP", price: 55, unit: "kg", rating: 4.5, reviews: 143, stock: 200, category: "Vegetables", organic: false, img: "🥔", discount: 0, deliveryDays: 2 },
  { id: 5, name: "Green Capsicum", farmer: "Ravi Kumar", farmerId: 1, location: "Pune, MH", price: 60, unit: "kg", rating: 4.7, reviews: 98, stock: 60, category: "Vegetables", organic: true, img: "🫑", discount: 5, deliveryDays: 1 },
  { id: 6, name: "Strawberries", farmer: "Anita Sharma", farmerId: 5, location: "Mahabaleshwar, MH", price: 180, unit: "250g", rating: 4.8, reviews: 412, stock: 30, category: "Fruits", organic: true, img: "🍓", discount: 20, deliveryDays: 1 },
  { id: 7, name: "Sweet Corn", farmer: "Suresh Patil", farmerId: 3, location: "Ratnagiri, MH", price: 25, unit: "piece", rating: 4.4, reviews: 76, stock: 120, category: "Vegetables", organic: false, img: "🌽", discount: 0, deliveryDays: 1 },
  { id: 8, name: "Dragon Fruit", farmer: "Anita Sharma", farmerId: 5, location: "Mahabaleshwar, MH", price: 220, unit: "kg", rating: 4.6, reviews: 203, stock: 25, category: "Fruits", organic: true, img: "🍈", discount: 10, deliveryDays: 2 },
];

const FARMERS = [
  { id: 1, name: "Ravi Kumar", location: "Pune, MH", rating: 4.8, products: 12, orders: 1240, joined: "2022", avatar: "👨‍🌾", verified: true, totalRevenue: 284000, pendingOrders: 8 },
  { id: 2, name: "Lakshmi Devi", location: "Nashik, MH", rating: 4.6, products: 8, orders: 890, joined: "2023", avatar: "👩‍🌾", verified: true, totalRevenue: 178000, pendingOrders: 3 },
  { id: 3, name: "Suresh Patil", location: "Ratnagiri, MH", rating: 4.9, products: 15, orders: 2100, joined: "2021", avatar: "👨‍🌾", verified: true, totalRevenue: 520000, pendingOrders: 14 },
];

const ORDERS = [
  { id: "ORD-2401", product: "Alphonso Mangoes", qty: 2, total: 544, status: "delivered", date: "2024-01-15", farmer: "Suresh Patil", img: "🥭", tracking: ["ordered", "confirmed", "packed", "shipped", "delivered"] },
  { id: "ORD-2389", product: "Organic Tomatoes", qty: 3, total: 121, status: "shipped", date: "2024-01-18", farmer: "Ravi Kumar", img: "🍅", tracking: ["ordered", "confirmed", "packed", "shipped"] },
  { id: "ORD-2401", product: "Strawberries", qty: 1, total: 144, status: "packed", date: "2024-01-20", farmer: "Anita Sharma", img: "🍓", tracking: ["ordered", "confirmed", "packed"] },
];

const CATEGORIES = ["All", "Vegetables", "Fruits", "Leafy Greens", "Herbs", "Grains", "Dairy"];

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;
const discounted = (price, disc) => Math.round(price - (price * disc) / 100);

// ─── Components ──────────────────────────────────────────────────────────────

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

function Navbar({ page, setPage, cart, wishlist, user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useApp();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: "linear-gradient(135deg, #0d4f2e 0%, #1a7a4a 50%, #0d4f2e 100%)",
      boxShadow: "0 4px 24px rgba(13,79,46,0.4)", fontFamily: "'Sora', sans-serif"
    }}>
      {/* Top bar */}
      <div style={{ background: "#0a3d22", padding: "6px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#7deba8" }}>
        <span>🚜 Direct from farm to your doorstep | Same-day delivery available</span>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ cursor: "pointer" }} onClick={() => setPage("track")}>📦 Track Order</span>
          <span style={{ cursor: "pointer" }}>💬 Help</span>
          <span style={{ cursor: "pointer" }}>🌐 EN</span>
        </div>
      </div>
      {/* Main nav */}
      <div style={{ padding: "14px 32px", display: "flex", alignItems: "center", gap: 24 }}>
        {/* Logo */}
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #52d68a, #f9c74f)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🌿</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -0.5 }}>Farm2Home</div>
            <div style={{ fontSize: 10, color: "#7deba8", letterSpacing: 2, textTransform: "uppercase" }}>Fresh · Local · Pure</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 600, position: "relative" }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") setPage("products"); }}
            placeholder="Search fresh vegetables, fruits, grains..."
            style={{
              width: "100%", padding: "12px 50px 12px 20px", borderRadius: 40,
              border: "2px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none",
              backdropFilter: "blur(10px)", boxSizing: "border-box",
              transition: "all 0.2s"
            }}
          />
          <button onClick={() => setPage("products")} style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            background: "#f9c74f", border: "none", borderRadius: 30, padding: "7px 18px",
            cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#0d4f2e", fontFamily: "'Sora', sans-serif"
          }}>Search</button>
        </div>

        {/* Nav Items */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!user ? (
            <button onClick={() => setPage("auth")} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "9px 20px", borderRadius: 30, cursor: "pointer", fontSize: 13, fontFamily: "'Sora', sans-serif", fontWeight: 600 }}>
              Sign In
            </button>
          ) : (
            <div onClick={() => setPage("profile")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", padding: "7px 16px", borderRadius: 30 }}>
              <div style={{ width: 28, height: 28, background: "#f9c74f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{user.avatar}</div>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user.name.split(" ")[0]}</span>
            </div>
          )}

          {[
            { icon: "❤️", label: "Wishlist", count: wishlist, pg: "products" },
            { icon: "🛒", label: "Cart", count: cart.length, pg: "cart" },
          ].map(item => (
            <button key={item.pg} onClick={() => setPage(item.pg)} style={{
              position: "relative", background: "rgba(255,255,255,0.1)", border: "none",
              color: "#fff", padding: "9px 16px", borderRadius: 30, cursor: "pointer",
              fontSize: 13, fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 6
            }}>
              <span>{item.icon}</span>
              <span style={{ display: "none" }}>{item.label}</span>
              {item.count > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2, background: "#f9c74f", color: "#0d4f2e",
                  borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{item.count}</span>
              )}
            </button>
          ))}

          {user?.role === "farmer" && (
            <button onClick={() => setPage("dashboard")} style={{ background: "#f9c74f", border: "none", color: "#0d4f2e", padding: "9px 18px", borderRadius: 30, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
              🌾 Dashboard
            </button>
          )}
          {user?.role === "admin" && (
            <button onClick={() => setPage("admin")} style={{ background: "#e74c3c", border: "none", color: "#fff", padding: "9px 18px", borderRadius: 30, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
              ⚡ Admin
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px 32px", display: "flex", gap: 6, overflowX: "auto" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setPage("products")} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#e8f5e9", padding: "5px 18px", borderRadius: 20, cursor: "pointer",
            fontSize: 12, fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap",
            transition: "all 0.2s"
          }}>{cat}</button>
        ))}
      </div>
    </nav>
  );
}

function HomePage({ setPage, addToCart }) {
  const { addToast } = useApp();
  const featured = PRODUCTS.slice(0, 4);

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Hero */}
      <div style={{
        minHeight: 480, background: "linear-gradient(135deg, #0a3d22 0%, #1a7a4a 40%, #2ecc71 100%)",
        display: "flex", alignItems: "center", padding: "60px 5%", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative circles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%",
            width: 80 + i * 60, height: 80 + i * 60,
            right: -20 + i * 40, top: -20 + i * 30,
            background: `rgba(255,255,255,${0.03 - i * 0.005})`,
            border: "1px solid rgba(255,255,255,0.05)"
          }} />
        ))}
        <div style={{ maxWidth: 500, zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "#f9c74f22", border: "1px solid #f9c74f55", color: "#f9c74f", padding: "6px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>
            🌿 Farm Fresh • Zero Middlemen
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: "0 0 20px", letterSpacing: -1 }}>
            From Farm<br /><span style={{ color: "#f9c74f" }}>to Your</span><br />Doorstep
          </h1>
          <p style={{ color: "#a8dbb8", fontSize: 18, lineHeight: 1.6, marginBottom: 32 }}>
            Fresh, organic produce delivered directly from 500+ verified farmers across India. No preservatives. No cold storage delays.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <button onClick={() => setPage("products")} style={{
              background: "#f9c74f", color: "#0d4f2e", padding: "16px 36px", borderRadius: 40,
              border: "none", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3
            }}>Shop Fresh Now →</button>
            <button onClick={() => setPage("auth")} style={{
              background: "transparent", color: "#fff", padding: "16px 28px", borderRadius: 40,
              border: "2px solid rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}>Become a Farmer</button>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
            {[["500+", "Farmers"], ["50K+", "Customers"], ["₹2Cr+", "Revenue"], ["1-Day", "Delivery"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: "#f9c74f" }}>{n}</div>
                <div style={{ color: "#a8dbb8", fontSize: 12, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 180, lineHeight: 1, zIndex: 1, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))", display: "flex", flexWrap: "wrap", width: 320, gap: 10, justifyContent: "center" }}>
          {["🍅", "🥬", "🥭", "🍓", "🌽", "🥔", "🫑", "🍈"].map((e, i) => (
            <span key={i} style={{ fontSize: 48, animation: `float ${2 + i * 0.3}s ease-in-out infinite alternate` }}>{e}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ background: "#f0faf4", padding: "48px 5%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
          {[
            { icon: "🚜", title: "Direct from Farmer", desc: "No middlemen — buy straight from the source" },
            { icon: "⚡", title: "Same-Day Delivery", desc: "Harvested in the morning, at your door by evening" },
            { icon: "✅", title: "Quality Guaranteed", desc: "100% fresh or full refund. No questions asked." },
            { icon: "💰", title: "Best Prices", desc: "30-50% cheaper than supermarkets" },
          ].map(f => (
            <div key={f.title} style={{ background: "#fff", padding: "28px 24px", borderRadius: 20, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e8f5e9" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0d4f2e", marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: "#666", fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ padding: "60px 5%", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, color: "#0d4f2e", margin: 0 }}>Today's Fresh Picks</h2>
            <p style={{ color: "#666", marginTop: 6, fontSize: 14 }}>Harvested in the last 24 hours</p>
          </div>
          <button onClick={() => setPage("products")} style={{ background: "#0d4f2e", color: "#fff", padding: "10px 24px", borderRadius: 30, border: "none", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 600 }}>View All →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {featured.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} />)}
        </div>
      </div>

      {/* Farmer Spotlight */}
      <div style={{ background: "linear-gradient(135deg, #fff9e6, #fff3cc)", padding: "60px 5%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, color: "#0d4f2e", marginBottom: 8 }}>Meet Our Farmers</h2>
          <p style={{ color: "#666", marginBottom: 32, fontSize: 14 }}>The hands that grow your food</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {FARMERS.map(f => (
              <div key={f.id} style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #ffe082" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 50 }}>{f.avatar}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 17, color: "#0d4f2e" }}>{f.name}</span>
                      {f.verified && <span style={{ background: "#e8f5e9", color: "#1a7a4a", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>✓ Verified</span>}
                    </div>
                    <div style={{ color: "#888", fontSize: 13, marginTop: 3 }}>📍 {f.location}</div>
                    <div style={{ color: "#f9c74f", fontSize: 13, marginTop: 2 }}>{"★".repeat(Math.floor(f.rating))} {f.rating}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, background: "#f9fdf9", borderRadius: 12, padding: 14 }}>
                  {[["Products", f.products], ["Orders", f.orders], ["Since", f.joined]].map(([k, v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#1a7a4a" }}>{v}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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

function ProductsPage({ addToCart }) {
  const { addToast } = useApp();
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [organic, setOrganic] = useState(false);
  const [priceRange, setPriceRange] = useState(1000);

  const filtered = PRODUCTS
    .filter(p => (category === "All" || p.category === category) && (!organic || p.organic) && p.price <= priceRange)
    .sort((a, b) => sortBy === "price_asc" ? a.price - b.price : sortBy === "price_desc" ? b.price - a.price : b.rating - a.rating);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Sora', sans-serif", background: "#f9fdf9" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, padding: "28px 20px", background: "#fff", borderRight: "1px solid #e8f5e9", flexShrink: 0 }}>
        <h3 style={{ color: "#0d4f2e", fontWeight: 800, marginTop: 0, marginBottom: 20, fontSize: 16 }}>Filters</h3>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Category</div>
          {CATEGORIES.map(c => (
            <div key={c} onClick={() => setCategory(c)} style={{
              padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 14, marginBottom: 4,
              background: category === c ? "#e8f5e9" : "transparent",
              color: category === c ? "#0d4f2e" : "#555", fontWeight: category === c ? 700 : 400,
              border: category === c ? "1px solid #b2dfdb" : "1px solid transparent"
            }}>{c}</div>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Sort By</div>
          {[["popular", "Most Popular"], ["price_asc", "Price: Low to High"], ["price_desc", "Price: High to Low"]].map(([v, l]) => (
            <div key={v} onClick={() => setSortBy(v)} style={{
              padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 14, marginBottom: 4,
              background: sortBy === v ? "#e8f5e9" : "transparent",
              color: sortBy === v ? "#0d4f2e" : "#555", fontWeight: sortBy === v ? 700 : 400
            }}>{l}</div>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Max Price: {fmt(priceRange)}</div>
          <input type="range" min={20} max={1000} value={priceRange} onChange={e => setPriceRange(+e.target.value)}
            style={{ width: "100%", accentColor: "#1a7a4a" }} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#555" }}>
          <input type="checkbox" checked={organic} onChange={e => setOrganic(e.target.checked)} style={{ accentColor: "#1a7a4a", width: 16, height: 16 }} />
          🌿 Organic Only
        </label>
      </aside>

      {/* Products Grid */}
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#0d4f2e" }}>
            {category === "All" ? "All Products" : category}
            <span style={{ fontSize: 14, fontWeight: 400, color: "#888", marginLeft: 12 }}>({filtered.length} items)</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} />)}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, color: "#aaa" }}>
            <div style={{ fontSize: 60 }}>🔍</div>
            <div style={{ fontSize: 18, marginTop: 16 }}>No products match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

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

function CheckoutPage({ cart, setCart, setPage }) {
  const { addToast } = useApp();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", pincode: "", city: "", state: "", street: "" });
  const [payMethod, setPayMethod] = useState("upi");
  const [upi, setUpi] = useState("");
  const [placing, setPlacing] = useState(false);
  const total = cart.reduce((s, i) => s + discounted(i.price, i.discount) * i.qty, 0);

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 2000));
    setCart([]);
    addToast("🎉 Order placed successfully! Track it in your profile.", "success");
    setPage("track");
    setPlacing(false);
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 5%", fontFamily: "'Sora', sans-serif" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0d4f2e", marginTop: 0 }}>Checkout</h2>

      {/* Steps */}
      <div style={{ display: "flex", gap: 0, marginBottom: 40 }}>
        {["Delivery Address", "Payment", "Confirm"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, fontFamily: "'Sora', sans-serif",
                background: step > i + 1 ? "#1a7a4a" : step === i + 1 ? "#0d4f2e" : "#e0e0e0",
                color: step >= i + 1 ? "#fff" : "#999"
              }}>{step > i + 1 ? "✓" : i + 1}</div>
              <span style={{ fontSize: 14, fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? "#0d4f2e" : "#888" }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? "#1a7a4a" : "#e0e0e0", margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
        <div>
          {step === 1 && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <h3 style={{ color: "#0d4f2e", marginTop: 0 }}>Delivery Address</h3>
              {[["Full Name", "name", "text"], ["Phone Number", "phone", "tel"], ["Street / Area", "street", "text"], ["Pincode", "pincode", "text"], ["City", "city", "text"], ["State", "state", "text"]].map(([label, key, type]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
                  <input type={type} value={address[key]} onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "12px 16px", border: "2px solid #e8f5e9", borderRadius: 12, fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none", boxSizing: "border-box", color: "#111" }} />
                </div>
              ))}
              <button onClick={() => setStep(2)} style={{ background: "#0d4f2e", color: "#fff", padding: "14px 32px", borderRadius: 30, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>Continue to Payment →</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <h3 style={{ color: "#0d4f2e", marginTop: 0 }}>Payment Method</h3>
              {[["upi", "📱 UPI / GPay / PhonePe"], ["card", "💳 Credit / Debit Card"], ["netbanking", "🏦 Net Banking"], ["cod", "💵 Cash on Delivery"]].map(([v, l]) => (
                <label key={v} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", border: `2px solid ${payMethod === v ? "#0d4f2e" : "#e8f5e9"}`, borderRadius: 14, marginBottom: 12, cursor: "pointer", background: payMethod === v ? "#f0faf4" : "#fff" }}>
                  <input type="radio" value={v} checked={payMethod === v} onChange={() => setPayMethod(v)} style={{ accentColor: "#0d4f2e" }} />
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{l}</span>
                </label>
              ))}
              {payMethod === "upi" && (
                <input placeholder="Enter UPI ID (e.g. name@upi)" value={upi} onChange={e => setUpi(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e8f5e9", borderRadius: 12, fontSize: 14, fontFamily: "'Sora', sans-serif", marginBottom: 16, boxSizing: "border-box" }} />
              )}
              <div style={{ display: "flex", gap: 14 }}>
                <button onClick={() => setStep(1)} style={{ background: "#f0f0f0", color: "#555", padding: "14px 28px", borderRadius: 30, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "'Sora', sans-serif" }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ background: "#0d4f2e", color: "#fff", padding: "14px 32px", borderRadius: 30, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>Review Order →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <h3 style={{ color: "#0d4f2e", marginTop: 0 }}>Review & Confirm</h3>
              {cart.map(i => (
                <div key={i.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 32 }}>{i.img}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{i.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>Qty: {i.qty} {i.unit}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#0d4f2e" }}>{fmt(discounted(i.price, i.discount) * i.qty)}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
                <button onClick={() => setStep(2)} style={{ background: "#f0f0f0", color: "#555", padding: "14px 28px", borderRadius: 30, border: "none", cursor: "pointer", fontSize: 14, fontFamily: "'Sora', sans-serif" }}>← Back</button>
                <button onClick={placeOrder} disabled={placing} style={{ flex: 1, background: placing ? "#aaa" : "linear-gradient(135deg, #0d4f2e, #1a7a4a)", color: "#fff", padding: "16px", borderRadius: 30, border: "none", cursor: placing ? "wait" : "pointer", fontSize: 16, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                  {placing ? "⏳ Placing Order..." : `🛒 Place Order — ${fmt(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mini summary */}
        <div style={{ background: "#f0faf4", borderRadius: 16, padding: 20, border: "1px solid #b2dfdb" }}>
          <h4 style={{ color: "#0d4f2e", margin: "0 0 16px" }}>Order Items ({cart.length})</h4>
          {cart.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "#555" }}>{i.name} × {i.qty}</span>
              <span style={{ fontWeight: 600, color: "#0d4f2e" }}>{fmt(discounted(i.price, i.discount) * i.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #b2dfdb", paddingTop: 12, marginTop: 8, fontWeight: 800, fontSize: 17, color: "#0d4f2e", display: "flex", justifyContent: "space-between" }}>
            <span>Total</span><span>{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function AuthPage({ setUser, setPage }) {
  const { addToast } = useApp();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const submit = () => {
    if (!form.email || !form.password) { addToast("Please fill all fields", "error"); return; }
    const user = { name: form.name || (role === "farmer" ? "Ravi Kumar" : role === "admin" ? "Admin User" : "Siddhartha"), email: form.email, role, avatar: role === "farmer" ? "👨‍🌾" : role === "admin" ? "⚡" : "👤" };
    setUser(user);
    addToast(`Welcome${mode === "login" ? " back" : ""}, ${user.name}! 🎉`, "success");
    setPage(role === "farmer" ? "dashboard" : role === "admin" ? "admin" : "home");
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0faf4, #e8f5e9)", fontFamily: "'Sora', sans-serif", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 40, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(13,79,46,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🌿</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#0d4f2e", margin: "8px 0 4px" }}>{mode === "login" ? "Welcome Back" : "Join Farm2Home"}</h2>
          <p style={{ color: "#888", fontSize: 14 }}>{mode === "login" ? "Sign in to your account" : "Create your account"}</p>
        </div>

        {/* Role */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#f0faf4", padding: 4, borderRadius: 14 }}>
          {[["customer", "👤 Customer"], ["farmer", "👨‍🌾 Farmer"], ["admin", "⚡ Admin"]].map(([v, l]) => (
            <button key={v} onClick={() => setRole(v)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Sora', sans-serif", background: role === v ? "#0d4f2e" : "transparent", color: role === v ? "#fff" : "#555", transition: "all 0.2s" }}>{l}</button>
          ))}
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e8f5e9", borderRadius: 12, fontSize: 14, fontFamily: "'Sora', sans-serif", boxSizing: "border-box", outline: "none" }} />
          </div>
        )}

        {[["Email Address", "email", "email"], ["Password", "password", "password"]].map(([label, key, type]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={label}
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e8f5e9", borderRadius: 12, fontSize: 14, fontFamily: "'Sora', sans-serif", boxSizing: "border-box", outline: "none" }} />
          </div>
        ))}

        <button onClick={submit} style={{ width: "100%", background: "linear-gradient(135deg, #0d4f2e, #1a7a4a)", color: "#fff", padding: "16px", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 16 }}>
          {mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        <div style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: "#0d4f2e", fontWeight: 700, cursor: "pointer" }}>
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </div>

        <div style={{ marginTop: 20, padding: "14px", background: "#f0faf4", borderRadius: 12, fontSize: 12, color: "#555" }}>
          <strong>Quick Demo:</strong> Use any email & password. Select role to see different dashboards!
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, setUser, setPage }) {
  const { addToast } = useApp();
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 5%", fontFamily: "'Sora', sans-serif" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0d4f2e", marginTop: 0 }}>My Profile</h2>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", marginBottom: 24, display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, #1a7a4a, #0d4f2e)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{user?.avatar}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: 22, color: "#0d4f2e" }}>{user?.name}</h3>
          <p style={{ color: "#888", margin: "4px 0" }}>{user?.email}</p>
          <span style={{ background: "#e8f5e9", color: "#1a7a4a", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{user?.role}</span>
        </div>
        <button onClick={() => { setUser(null); setPage("home"); addToast("Logged out successfully", "info"); }} style={{ marginLeft: "auto", background: "#fdecea", color: "#c62828", border: "none", padding: "10px 20px", borderRadius: 30, cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>Sign Out</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
        <h3 style={{ color: "#0d4f2e", marginTop: 0 }}>Order History</h3>
        {ORDERS.map(o => (
          <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid #f5f5f5" }}>
            <span style={{ fontSize: 36 }}>{o.img}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{o.product}</div>
              <div style={{ fontSize: 12, color: "#888" }}>#{o.id} · {o.date}</div>
            </div>
            <span style={{ fontWeight: 700, color: "#0d4f2e" }}>₹{o.total}</span>
            <span style={{ background: "#e8f5e9", color: "#1a7a4a", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(0);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const addToCart = (product) => {
    setCart(c => {
      const ex = c.find(x => x.id === product.id);
      if (ex) return c.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { ...product, qty: 1 }];
    });
  };

  const pages = {
    home: <HomePage setPage={setPage} addToCart={addToCart} />,
    products: <ProductsPage addToCart={addToCart} />,
    cart: <CartPage cart={cart} setCart={setCart} setPage={setPage} />,
    checkout: <CheckoutPage cart={cart} setCart={setCart} setPage={setPage} />,
    track: <TrackOrderPage />,
    auth: <AuthPage setUser={setUser} setPage={setPage} />,
    profile: user ? <ProfilePage user={user} setUser={setUser} setPage={setPage} /> : <AuthPage setUser={setUser} setPage={setPage} />,
    dashboard: user?.role === "farmer" ? <FarmerDashboard user={user} /> : <AuthPage setUser={setUser} setPage={setPage} />,
    admin: user?.role === "admin" ? <AdminPanel /> : <AuthPage setUser={setUser} setPage={setPage} />,
  };

  return (
    <AppContext.Provider value={{ addToast }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f9fdf9; }
        input::placeholder { color: #aaa; }
        input:focus { border-color: #1a7a4a !important; }
        @keyframes float { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-12px) rotate(5deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f0f0f0; } ::-webkit-scrollbar-thumb { background: #1a7a4a; border-radius: 3px; }
      `}</style>

      <Navbar page={page} setPage={setPage} cart={cart} wishlist={wishlist} user={user} setUser={setUser} />

      <main style={{ minHeight: "calc(100vh - 180px)" }}>
        {pages[page] || pages.home}
      </main>

      {/* Footer */}
      <footer style={{ background: "#0a3d22", color: "#7deba8", padding: "48px 5% 24px", fontFamily: "'Sora', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>🌿</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#fff", fontWeight: 800 }}>Farm2Home</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#7deba8", maxWidth: 280 }}>Connecting 500+ farmers directly to 50,000+ customers across India. Fresh, pure, and straight from the soil.</p>
          </div>
          {[
            { title: "Shop", links: ["Vegetables", "Fruits", "Grains", "Herbs", "Dairy"] },
            { title: "Sellers", links: ["Become a Farmer", "Farmer Dashboard", "Sell on Farm2Home", "Pricing"] },
            { title: "Support", links: ["Track Order", "Returns", "Contact Us", "FAQ"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 16, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>{col.title}</h4>
              {col.links.map(l => <div key={l} style={{ fontSize: 13, color: "#7deba8", marginBottom: 10, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, textAlign: "center", fontSize: 12, color: "#4a9b6a" }}>
          © 2026 Farm2Home · Built with ❤️ for Indian Farmers · Siddartha DevOps-Engineer
        </div>
      </footer>

      <Toast toasts={toasts} remove={id => setToasts(t => t.filter(x => x.id !== id))} />
    </AppContext.Provider>
  );
}


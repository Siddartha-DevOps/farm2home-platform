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

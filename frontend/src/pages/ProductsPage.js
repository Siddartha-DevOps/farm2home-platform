import { useState } from "react";
import { useApp } from "../context/AppContext";
import { PRODUCTS, CATEGORIES } from "../data/mockData";
import ProductCard from "../components/ProductCard";
import { fmt } from "../utilities/helpers";

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

export default ProductsPage;

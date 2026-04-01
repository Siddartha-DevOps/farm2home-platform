import { useState, useEffect, createContext, useContext } from "react";
import { AppContext, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminPanel from "./pages/AdminPanel";



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
    auth: <AuthPage key="auth" setUser={setUser} setPage={setPage} />,
    farmerAuth: <AuthPage key="farmerAuth" setUser={setUser} setPage={setPage} initialRole="farmer" initialMode="register" />,
    profile: user ? <ProfilePage user={user} setUser={setUser} setPage={setPage} /> : <AuthPage key="auth-profile" setUser={setUser} setPage={setPage} />,
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
              {col.links.map(l => (
                <div 
                  key={l} 
                  onClick={() => {
                    if (l === "Become a Farmer" || l === "Sell on Farm2Home") setPage("farmerAuth");
                    else if (l === "Farmer Dashboard") setPage("dashboard");
                    else if (l === "Track Order") setPage("track");
                    else if (col.title === "Shop") setPage("products");
                  }}
                  style={{ fontSize: 13, color: "#7deba8", marginBottom: 10, cursor: "pointer" }}
                >
                  {l}
                </div>
              ))}
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


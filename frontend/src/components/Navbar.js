import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";

function Navbar({ page, setPage, cart, wishlist, user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState("Detecting location...");
  const [locationInput, setLocationInput] = useState("");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const { addToast } = useApp();

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.county || "Unknown Location";
            const state = data.address?.state ? data.address.state.substring(0, 2).toUpperCase() : "";
            const detectedLocation = `${city}${state ? ", " + state : ""}`;
            setUserLocation(detectedLocation);
            setLocationInput(detectedLocation);
            setIsLoadingLocation(false);
            addToast(`📍 Location: ${detectedLocation}`, "success");
          } catch (e) {
            setUserLocation("Unable to detect location");
            setIsLoadingLocation(false);
            console.log("Couldn't detect exact location");
          }
        },
        (error) => {
          setUserLocation("Allow location access");
          setIsLoadingLocation(false);
          console.log("Geolocation not available");
        }
      );
    } else {
      setUserLocation("Location not available");
      setIsLoadingLocation(false);
    }
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: "linear-gradient(135deg, #0d4f2e 0%, #1a7a4a 50%, #0d4f2e 100%)",
      boxShadow: "0 4px 24px rgba(13,79,46,0.4)", fontFamily: "'Sora', sans-serif"
    }}>
      {/* Top bar */}
      <div style={{ background: "#0a3d22", padding: "6px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#7deba8" }}>
        <span>🚜 Direct from farm to your doorstep | Same-day delivery available</span>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* Current Location Display with Manual Edit */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
            <div
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              style={{
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                borderRadius: 20, background: "rgba(125, 235, 168, 0.15)", border: "1px solid rgba(125, 235, 168, 0.3)",
                transition: "all 0.2s", minWidth: 160
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(125, 235, 168, 0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(125, 235, 168, 0.15)"}
            >
              <span>📍</span>
              <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, fontWeight: 500 }}>
                {isLoadingLocation ? "🔄 Detecting..." : userLocation}
              </span>
              <span style={{ fontSize: 9 }}>✎</span>
            </div>

            {locationDropdownOpen && (
              <div style={{
                position: "absolute", top: 32, left: 0, background: "#1a5a3a", border: "1px solid #2d8659",
                borderRadius: 12, zIndex: 1001, minWidth: 260, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", padding: 12
              }}>
                <div style={{ marginBottom: 10 }}>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Search or enter location..."
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #2d8659",
                      background: "rgba(255,255,255,0.1)", color: "#7deba8", fontSize: 11,
                      fontFamily: "'Sora', sans-serif", outline: "none", boxSizing: "border-box"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && locationInput.trim()) {
                        setUserLocation(locationInput.trim());
                        setLocationDropdownOpen(false);
                        addToast(`📍 Location updated: ${locationInput.trim()}`, "info");
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    if (locationInput.trim() && locationInput !== userLocation) {
                      setUserLocation(locationInput.trim());
                      setLocationDropdownOpen(false);
                      addToast(`📍 Location updated: ${locationInput.trim()}`, "info");
                    }
                  }}
                  style={{
                    width: "100%", padding: "6px 12px", borderRadius: 6, border: "none", background: "#2ecc71",
                    color: "#0d4f2e", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif"
                  }}
                >
                  Update Location
                </button>
                <div style={{ fontSize: 10, color: "#a8dbb8", marginTop: 8, textAlign: "center" }}>
                  Or close to keep current location
                </div>
              </div>
            )}
          </div>

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
export default Navbar;

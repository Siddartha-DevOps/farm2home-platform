import { useApp } from "../context/AppContext";
import { ORDERS } from "../data/mockData";

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
export default ProfilePage;

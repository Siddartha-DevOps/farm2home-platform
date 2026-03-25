import { useState } from "react";
import { useApp } from "../context/AppContext";

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
export default AuthPage;

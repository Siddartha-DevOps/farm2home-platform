import { useState } from "react";
import { useApp } from "../context/AppContext";
import { fmt, discounted } from "../utilities/helpers";

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
export default CheckoutPage;

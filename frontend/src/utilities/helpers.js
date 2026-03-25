// ─── Utilities ────────────────────────────────────────────────────────────────
export const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;
export const discounted = (price, disc) => Math.round(price - (price * disc) / 100);

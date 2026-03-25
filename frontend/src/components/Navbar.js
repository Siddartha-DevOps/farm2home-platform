
import React from "react";

const Navbar = ({ cartCount }) => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px",
      background: "#2c3e50",
      color: "white"
    }}>
      <h2>🌾 Farm2Home</h2>
      <p>Cart: {cartCount}</p>
    </div>
  );
};

export default Navbar;

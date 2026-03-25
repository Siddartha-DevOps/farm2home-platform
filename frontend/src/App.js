import React, { useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

function App() {
  const [cart, setCart] = useState(null);
  const userId = "123";

  const fetchCart = async () => {
    const res = await axios.get(`http://localhost:5002/cart/${userId}`);
    setCart(res.data);
  };

  const addToCart = async (product) => {
    await axios.post("http://localhost:5002/cart/add", {
      userId,
      product: { ...product, quantity: 1 }
    });
    fetchCart();
  };

  return (
    <div>
      <Navbar cartCount={cart?.items?.length || 0} />

      <div style={{ padding: "20px" }}>
        <ProductList onAdd={addToCart} />
        <Cart />
      </div>
    </div>
  );
}

export default App;

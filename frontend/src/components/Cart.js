import React, { useEffect, useState } from "react";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const userId = "123"; // temp (later JWT)

  const fetchCart = async () => {
    const res = await axios.get(`http://localhost:5002/cart/${userId}`);
    setCart(res.data);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async () => {
    await axios.post("http://localhost:5002/cart/add", {
      userId,
      product: {
        productId: "p1",
        name: "Tomatoes",
        price: 50,
        quantity: 1
      }
    });
    fetchCart();
  };

  const removeItem = async (productId) => {
    await axios.delete("http://localhost:5002/cart/remove", {
      data: { userId, productId }
    });
    fetchCart();
  };

  const total = cart?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Farm2Home Cart</h2>

      <button onClick={addItem}>Add Tomatoes</button>

      {cart?.items?.map((item) => (
        <div key={item.productId} style={{ marginTop: "10px" }}>
          <p>{item.name} - ₹{item.price} x {item.quantity}</p>
          <button onClick={() => removeItem(item.productId)}>Remove</button>
        </div>
      ))}

      <h3>Total: ₹{total || 0}</h3>
    </div>
  );
};

export default Cart;

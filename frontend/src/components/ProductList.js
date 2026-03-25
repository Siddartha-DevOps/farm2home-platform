import React from "react";
import ProductCard from "./ProductCard";

const products = [
  { productId: "p1", name: "Tomatoes", price: 50 },
  { productId: "p2", name: "Potatoes", price: 30 },
  { productId: "p3", name: "Onions", price: 40 },
];

const ProductList = ({ onAdd }) => {
  return (
    <div>
      <h2>🛍️ Products</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        {products.map((p) => (
          <ProductCard key={p.productId} product={p} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;

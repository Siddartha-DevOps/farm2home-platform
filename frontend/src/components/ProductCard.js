import React from "react";

const ProductCard = ({ product, onAdd }) => {
  return (
    <div style={{ 
      border: "1px solid #ccc",
      borderRadius: "10px", 
      padding: "15px", 
      width: "150px"
    }}>
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={() => onAdd(product)}>
         Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

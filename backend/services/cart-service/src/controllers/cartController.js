const Cart = require("../models/Cart");

// Add to cart
exports.addToCart = async (req, res) => {
  const { userId, product } = req.body;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [product] });
  } else {
    const itemIndex = cart.items.findIndex(
      item => item.productId === product.productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += product.quantity;
    } else {
      cart.items.push(product);
    }
  }

  await cart.save();
  res.json(cart);
};

// Get cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  res.json(cart);
};

// Remove item
exports.removeItem = async (req, res) => {
  const { userId, productId } = req.body;

  const cart = await Cart.findOne({ userId });

  cart.items = cart.items.filter(item => item.productId !== productId);

  await cart.save();
  res.json(cart);
};

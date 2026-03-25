const express = require("express");

const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Cart Service Running 🛒");
});

app.use("/cart", cartRoutes);

module.exports = app;

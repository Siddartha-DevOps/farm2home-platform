const express = require("express");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use("/products", productRoutes);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Product Service API Running 🚀");
});

module.exports = app;

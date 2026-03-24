const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());
app.use(cors());

// routes
app.use("/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Product Service API Running 🚀");
});

module.exports = app;

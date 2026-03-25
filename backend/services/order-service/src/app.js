const express = require("express");
const cors = require("cors");

const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(express.json());
app.use(cors());

// routes
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Order Service API Running 🚀");
});

module.exports = app;

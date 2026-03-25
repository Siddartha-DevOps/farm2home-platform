const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());
app.use(cors());

// routes
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("User Service API Running 🚀");
});

module.exports = app;

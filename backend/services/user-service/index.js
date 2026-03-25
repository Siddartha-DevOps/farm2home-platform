require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

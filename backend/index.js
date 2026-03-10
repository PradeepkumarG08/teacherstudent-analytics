const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/student/highlights", require("./routes/highlights"));
app.use("/api/tracking", require("./routes/tracking"));


app.listen(5000, () => {
  console.log("Server running on 5000");
});
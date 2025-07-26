const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Database Connected"));

// Configure CORS
app.use(cors({
  origin: ['http://localhost:19000', 'http://localhost:19006', 'exp://10.124.170.141:19000', 'http://192.168.100.33:5000'],
  credentials: true
}));

// Configure middleware
app.use(express.json());
app.use(morgan("dev"));

// Import routes
const deliveryRoutes = require('./routes/delivery');
app.get("/", (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", require("./routes/auth")); // Authentication routes
app.use("/user", require("./routes/user")); // User routes
app.use("/ai", require("./routes/ai")); // Ai
app.use("/vegetables", require("./routes/vegetableManagement")); // vegetable management
app.use("/plant", require("./routes/plantScan"));
app.use("/openai", require("./routes/openai"));
app.use("/user", require("./routes/fetchGardener")); 
app.use("/api/delivery", deliveryRoutes); // Delivery routes
app.use("/orders", require("./routes/orders")); // Orders route (RESTful, now handles POST and GET)
// Start server on all network interfaces
app.listen(5000, '0.0.0.0', () => {
  console.log("Server is running on port 5000");
  console.log("Local access: http://localhost:5000");
  console.log("Network access: http://10.124.170.141:5000");
});

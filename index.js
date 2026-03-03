const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");

// Initialize configuration IMMEDIATELY before any other imports
dotenv.config();

const { registerUser } = require("./controllers/mail.controller");
const { getAdminDashboard, sendBulkNewsletter, getLoginPage, handleLogin, handleLogout } = require("./controllers/admin.controller");
const { checkAdmin } = require("./middleware/auth.middleware");
const apiRouter = require("./routers/api.router");
const connectDB = require("./database/connectDB");

const app = express();

// Enable CORS
app.use(cors({
  origin: "http://localhost:5173", // React dev server
  credentials: true
}));
const PORT = process.env.PORT || 4500;

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'rccg-btc-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Database connection
// const MONGODB_URI = process.env.MONGODB_URI;
// mongoose
//   .connect(MONGODB_URI)
//   .then(() => console.log("Connected to MongoDB successfully"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api", apiRouter);

// Routes
app.get("/register", (req, res) => {
  res.render("Register", { message: null });
});

app.post("/register", registerUser);

// Admin Routes
app.get("/admin/login", getLoginPage);
app.post("/admin/login", handleLogin);
app.get("/admin/logout", handleLogout);

app.get("/admin", checkAdmin, getAdminDashboard);
app.post("/admin/send", checkAdmin, sendBulkNewsletter);

// Redirect root to register for now
app.get("/", (req, res) => {
  res.redirect("/register");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



module.exports= async(req, res)=>{
  await connectDB()
  return app(req, res)
}

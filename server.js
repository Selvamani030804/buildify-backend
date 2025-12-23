const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// --- 1. Validate ALL required env variables ---
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env file");
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env file");
  process.exit(1);
}

if (!process.env.HUGGINGFACE_API_KEY) {
  console.error("❌ HUGGINGFACE_API_KEY missing in .env file");
  process.exit(1);
}

// --- 2. Import Routes ---
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const logoRoutes = require("./routes/logo");
const projectRoutes = require("./routes/projects");
const userRoutes = require("./routes/user");
const studioRoutes = require("./routes/studio"); // <--- NEW: Import Studio Routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// We increase the limit because Base64 images are HUGE
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// --- 3. Use Routes ---
app.use("/api/auth", authRoutes);        // Login & Register
app.use("/api/ai", aiRoutes);            // Names, Slogans, Chat
app.use("/api/logo", logoRoutes);        // Logo Generation
app.use("/api/projects", projectRoutes); // Save Projects
app.use("/api/user", userRoutes);        // Upgrade Plans & Profile
app.use("/api/studio", studioRoutes);    // <--- NEW: Image Editor & Video

// Health Check
app.get("/", (req, res) => {
  res.status(200).send("🚀 Buildify Backend is Running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
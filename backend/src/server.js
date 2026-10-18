
import dns from "node:dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

// DNS workaround for local development
dns.setServers(["8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Retain API is running!",
  });
});

// Connect to MongoDB, then start the server
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Retain API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Retain API:", error.message);
    process.exit(1);
  }
};

startServer();

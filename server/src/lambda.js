import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import serverless from "serverless-http";
// Import routes
import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Database connection caching
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" Connected to MongoDB");
    cachedDb = mongoose;
    return cachedDb;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error; // Rethrow to handle in the initialization
  }
}
(async () => {
  try {
    await connectToDatabase();
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Initial database connection failed:", error);
  }
})();
// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use((req, res, next) => {
  // Remove stage prefix from path
  if (req.url.startsWith('/dev/')) {
    req.url = req.url.substring('/dev'.length);
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/admin", adminRoutes);

// Add a root route for debugging
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// AWS Lambda Handler
export const handler = serverless(app);

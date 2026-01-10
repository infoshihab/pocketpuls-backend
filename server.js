import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import "./config/cloudinary.js";

import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// ✅ Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://ec2-65-2-63-162.ap-south-1.compute.amazonaws.com",
  "https://www.pocketpuls.com",
  "https://pocketpuls.com",
];

// ✅ CORS (FIXED)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Handle preflight explicitly (VERY IMPORTANT)
app.options("*", cors());

app.use(express.json());

// API routes
app.use("/api/user", userRouter);

// Health check
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend works!" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

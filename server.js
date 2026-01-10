import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import "./config/cloudinary.js";

import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const allowedOrigins = [
  "http://localhost:5173",
  //"https://pocketpulse-vrkx.onrender.com",
  "https://www.pocketpuls.com",
  "https://pocketpuls.com",
  //"https://pocketpulse-1.onrender.com",
  "https://api.pocketpuls.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API routes
app.use("/api/user", userRouter);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend works!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

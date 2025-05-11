import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import customerRoutes from "../routes/customer.js";
import orderRoutes from "../routes/orders.js";
import authRoutes from "../routes/auth.js";
import cookieParser from "cookie-parser";
import passport from "./passport.js";
import { requireAuth } from "../middleware/auth.js";
import userRoutes from "../routes/user.js";
import segmentRoutes from "../routes/segments.js";

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/api", requireAuth, userRoutes);
app.use("/api/segments", segmentRoutes);
app.use("/api/customers", requireAuth, customerRoutes);
app.use("/api/orders", requireAuth, orderRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error", err));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

let PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening to the port ${PORT}`);
});

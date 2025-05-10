import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import healthRouter from "../routes/health.js";
import customerRoutes from "../routes/customer.js";
import orderRoutes from "../routes/orders.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

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

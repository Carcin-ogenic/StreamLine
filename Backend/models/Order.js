import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  amount: {
    type: Number,
    required: [true, "Order amount is required"],
    min: 0,
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);

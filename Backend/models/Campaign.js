import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Campaign name is required"],
    trim: true,
  },
  segmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Segment",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  appliedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Campaign", campaignSchema);

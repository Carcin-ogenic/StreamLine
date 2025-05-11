import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  query: { type: Object, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Segment", segmentSchema);

import mongoose from "mongoose";

const systemActivitySchema = new mongoose.Schema({
  event: { type: String, required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["success", "warning", "pending", "info"],
    required: true,
  },
  ipAddress: { type: String, required: true },
});

const SystemActivity = mongoose.model("SystemActivity", systemActivitySchema);

export default SystemActivity;

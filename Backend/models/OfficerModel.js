import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    department: {
      type: String,
      enum: ["Customer Support", "Meter Reading", "Maintenance"],
      required: true,
    },
    assignedArea: {
      type: String,
      required: true,
    },
    password: String,
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date },
    lastPasswordReset: { type: Date },
  },
  { timestamps: true }
);

export const Officer = mongoose.model("OfficerModel", officerSchema);

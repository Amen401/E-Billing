import mongoose from "mongoose";

const adminActivityTrackerSchema = mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  activity: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

export const adminAT = mongoose.model(
  "AdminActivityTracker",
  adminActivityTrackerSchema
);

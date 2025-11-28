import mongoose, { Schema } from "mongoose";

const officerATSchema = mongoose.Schema({
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OfficerModel",
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

export const officerAT = mongoose.model(
  "OfficerActivityTracker",
  officerATSchema
);

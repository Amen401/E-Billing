import mongoose from "mongoose";

const officerADHistorySchema = mongoose.Schema({
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OfficerModel",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
});

export const officerADHistory = mongoose.model(
  "OfficerADHistory",
  officerADHistorySchema
);

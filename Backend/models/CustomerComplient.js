import mongoose, { Schema } from "mongoose";

const customerComp = mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerAccNumber: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: "OfficerModel",
    default: null,
  },
});

export const CustomerComplient = mongoose.model(
  "CustomerComplient",
  customerComp
);

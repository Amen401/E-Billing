import mongoose from "mongoose";
const customerADH = mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerAccount",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

export const customerADHistory = mongoose.model(
  "CustomerADHistory",
  customerADH
);

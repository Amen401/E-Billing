import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    serviceCenter: {
      type: String,
      required: true,
    },
    addressRegion: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    woreda: {
      type: String,
      required: true,
    },
    town: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    powerApproved: {
      type: Number,
      required: true,
    },
    killowat: {
      type: Number,
      required: true,
    },
    applicableTarif: {
      type: Number,
      required: true,
    },
    volt: {
      type: Number,
      required: true,
    },
    depositBirr: {
      type: Number,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", customerSchema);

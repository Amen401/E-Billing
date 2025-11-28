import mongoose, { Schema } from "mongoose";

const meterReadingSchema = mongoose.Schema(
  {
    photo: {
      secure_url: {
        type: String,
        required: true,
        default: "",
      },
      public_id: {
        type: String,
        required: true,
        default: "",
      },
    },
    killowatRead: {
      type: Number,
      required: true,
    },
    monthlyUsage: {
      type: Number,
      required: true,
    },
    anomalyStatus: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Paid", "Not Paid"],
      default: "Not Paid",
    },
    fee: {
      type: Number,
      default: null,
    },
    dateOfSubmission: {
      type: String,
      required: true,
    },
    paymentMonth: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "PaymentSchedule",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
  },
  {
    timestamps: true,
  }
);

export const merterReading = mongoose.model(
  "MeterReadings",
  meterReadingSchema
);

import mongoose, { Schema } from "mongoose";

const meterReadingSchema = mongoose.Schema(
  {
    txRef: {
      type: String,
      unique: true,
    },

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
      default: "Unknown",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
      required: true,
    },
    monthName: {
      type: String,
      required: true,
      default: "",
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
      ref: "PaymentSchedule",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    officerId: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
      required: false,
    },
  },
  { timestamps: true }
);

export const merterReading = mongoose.model(
  "MeterReadings",
  meterReadingSchema
);

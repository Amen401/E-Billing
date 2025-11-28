import mongoose from "mongoose";

const paymentScheduleSchema = mongoose.Schema(
  {
    yearAndMonth: {
      type: String,
      required: true,
    },
    normalPaymentStartDate: {
      type: String,
      required: true,
    },
    normalPaymentEndDate: {
      type: String,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const paymentSchedule = mongoose.model(
  "PaymentSchedule",
  paymentScheduleSchema
);

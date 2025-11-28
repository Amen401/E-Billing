import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
  meterReading: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "MeterReadings",
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  paymentMonth: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "PaymentSchedule",
  },
});

export const customerPayments = mongoose.model(
  "CustomerPayments",
  paymentSchema
);

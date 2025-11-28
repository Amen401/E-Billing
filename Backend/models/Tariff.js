import mongoose, { Schema } from "mongoose";

const tariffSchema = mongoose.Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  energyTariff: {
    type: Number,
    required: true,
  },
  serviceCharge: {
    type: Number,
    required: true,
  },
});

export const customerTariff = mongoose.model("CustomerTariff", tariffSchema);

import mongoose, { Schema } from "mongoose";

const tariffSchema = mongoose.Schema({
  block1: {
    type: Number,
    required: true,
  },
  block2: {
    type: Number,
    required: true,
  },
  block3: {
    type: Number,
    required: true,
  },
  block4: {
    type: Number,
    required: true,
  },
  block5: {
    type: Number,
    required: true,
  },
  block6: {
    type: Number,
    required: true,
  },
  block7: {
    type: Number,
    required: true,
  },
  domesticUnder50: {
    type: Number,
    required: true,
  },
  domesticAbove50: {
    type: Number,
    required: true,
  },
  allUsage: {
    type: Number,
    required: true,
  },
});

export const CustomerTariff = mongoose.model("CustomerTariff", tariffSchema);

import mongoose from "mongoose";

const officerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
      role: {
        type: String,
        required: true
    },
      username: {
        type: String,
        required: true
    },
      password: {
        type: String,
        required: true
    },
    isActive: {
      type: Boolean,
      required: true
    }
});

export const Officer = mongoose.model("OfficerModel", officerSchema);

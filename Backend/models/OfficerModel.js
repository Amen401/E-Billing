import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    department: {
      type: String,
      enum: ["Customer Support", "Meter Reading", "Maintenance"],
      required: true,
    },
    assignedArea: {
      type: String,
      required: true,
    },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },

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
  },

  { timestamps: true }
);

export const Officer = mongoose.model("OfficerModel", officerSchema);

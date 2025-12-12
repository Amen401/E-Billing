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
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
  },

  { timestamps: true }
);

export const Officer = mongoose.model("OfficerModel", officerSchema);

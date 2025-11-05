import mongoose from "mongoose";

const passwordResetHistorySchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

export const passwordResetHistory = mongoose.model(
  "PasswordResetHistory",
  passwordResetHistory
);

import mongoose from "mongoose";
import { Customer } from "./CustomerModel.js";

const customerAS = mongoose.Schema({
    customerInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    accountNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

export const CustomerAccount = mongoose.model("CustomerAccount", customerAS)
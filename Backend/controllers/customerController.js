import mongoose from "mongoose";
import { Customer } from "../models/CustomerModel.js";
import { CustomerAccount } from "../models/customerAccount.js";
import { createAccountNumberForCustomer } from "../Util/accountNumberGeneratorUtil.js";
import { endcodePassword } from "../Util/passwordEncDec.js";

export const addCustomer = async (req, res) => {
  try {
    const regForm = req.body;
    const newCustomer = new Customer(regForm);
    const save = await newCustomer.save();
    const password = endcodePassword("12345678");

    const customerAccount = new CustomerAccount({
      customerInfo: save._id,
      accountNumber: createAccountNumberForCustomer(),
      password,
    });

    res.status(200).json({
      message: "Account created Successfully",
      accountNumber: accountNumber,
      password: "12345678",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

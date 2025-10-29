import mongoose from "mongoose";
import { Customer } from "../models/CustomerModel.js";
import { CustomerAccount } from "../models/customerAccount.js";
import { createAccountNumberForCustomer } from "../Util/accountNumberGeneratorUtil.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";

export const addCustomer = async (req, res) => {
  try {
    const regForm = req.body;
    console.log(regForm);
    const newCustomer = new Customer(regForm);
    const save = await newCustomer.save();
    const password = await endcodePassword("12345678");

    const customerAccount = new CustomerAccount({
      customerInfo: save._id,
      accountNumber: createAccountNumberForCustomer(),
      password,
    });

    const savedAccount = await customerAccount.save();
    res.status(200).json({
      message: "Account created Successfully",
      accountNumber: savedAccount.accountNumber,
      password: "12345678",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
export const customerLogin = async (req, res) => {
  const { username, password } = req.body;

  const checkUsername = await CustomerAccount.findOne({
    accountNumber: username,
  }).populate("customerInfo");

  if (!checkUsername) {
    res.status(200).json({ message: "bad credentials" });
  }

  const checkPassword = await comparePassword(password, checkUsername.password);

  if (!checkPassword) {
    res.status(200).json({ message: "bad credentials" });
  }

  res.status(200).json({
    message: "login successful",
    customerInfo: checkUsername.customerInfo,
    id: checkUsername._id,
    accountNumber: checkUsername.accountNumber,
    token: generateToken(checkUsername._id, username),
  });
};

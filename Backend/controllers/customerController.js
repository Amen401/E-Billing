import { CustomerComplient } from "../models/CustomerComplient.js";
import { Customer } from "../models/CustomerModel.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { complientCustomDto } from "./officerController.js";

export const customerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const checkUsername = await Customer.findOne({
      accountNumber: username,
    });

    if (!checkUsername) {
      res.status(200).json({ message: "bad credentials" });
    }

    const checkPassword = await comparePassword(
      password,
      checkUsername.password
    );

    if (!checkPassword) {
      res.status(200).json({ message: "bad credentials" });
    }

    if (!checkUsername.isActive) {
      res
        .status(200)
        .json({ message: "Account deactivated. Please contact the district" });
    }
    res.status(200).json({
      message: "login successful",
      customerInfo: checkUsername,
      token: generateToken(checkUsername._id, username),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;

    const account = await Customer.findById(req.authUser.id);

    if (await comparePassword(oldPass, account.password)) {
      const updatedAcc = await Customer.findByIdAndUpdate(req.authUser.id, {
        password: await endcodePassword(newPass),
      });

      res.status(200).json({ message: "Password updated successfully!!" });
    }
    res.status(200).json({ message: "Your old password is not correct" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


export const writeComplain = async (req, res) => {
  try {
    const complain = req.body;

    complain.customerAccNumber = req.authUser.username;
    complain.customerName = req.authUser.name || req.authUser.username;
    complain.date = new Date().toISOString();
    complain.status = "Pending";

    const newComplain = new CustomerComplient(complain);
    const savedComplain = await newComplain.save();
    return res.status(200).json(savedComplain);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const myComplains = async (req, res) => {
  try {
    let complaints = await CustomerComplient.find({
      customerAccNumber: req.authUser.username,
    }).sort({ date: -1 }); 

    complaints = complaints.slice(0, 10);


    const result = complientCustomDto ? complientCustomDto(complaints) : complaints;

    return res.status(200).json({ myComplains: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const searchMyComplain = async (req, res) => {
  try {
    const { filter, value } = req.query;
    const complients = await CustomerComplient.find({
      [filter]: new RegExp(value, "i"),
      customerAccNumber: req.authUser.username,
    }).populate("resolvedBy");

    if (!complients) {
      res.status(200).json(complients);
    }

    res.status(200).json(complientCustomDto(complients));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

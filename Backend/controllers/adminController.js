import { adminAT } from "../models/AdminActivityTracker.js";
import { admin } from "../models/AdminModel.js";
import { CustomerAccount } from "../models/customerAccount.js";
import { customerADHistory } from "../models/CustomerActivationDeactivationHistory.js";
import { officerADHistory } from "../models/OfficerActivationDeactivationHistory.js";
import { Officer } from "../models/OfficerModel.js";
import { passwordResetHistory } from "../models/PasswordResetHistory.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
export const createAdmin = async (req, res) => {
  try {
    const newAdmin = req.body;
    newAdmin.password = await endcodePassword(newAdmin.password);
    const newAdminSchema = new admin(newAdmin);
    const saveAdmin = await newAdminSchema.save();
    res
      .status(200)
      .json({ message: "Account created successfully", account: saveAdmin });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const searchOfficer = async (req, res) => {
  try {
    const { query } = req.query;
    const searchRegex = new RegExp(query || "", "i");

    const searchResult = await Officer.find({
      $or: [{ name: searchRegex }, { department: searchRegex }],
    });

    res.status(200).json(searchResult);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOfficerStats = async (req, res) => {
  try {
    const total = await Officer.countDocuments();
    const active = await Officer.countDocuments({ isActive: true });
    const inactive = await Officer.countDocuments({ isActive: false });

    res.status(200).json({ total, active, inactive });
  } catch (error) {
    console.error("Officer Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchCustomer = async (req, res) => {
  try {
    const { searchBy, value } = req.body;
  } catch (error) {}
};

export const activateDeactivateOfficer = async (req, res) => {
  try {
    const isActive = req.body.isActive;
    const id = req.body.id;
    const updatedResult = await Officer.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    res.status(200).json(updatedResult);
  } catch (error) {
    console.error("Activate/Deactivate Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateUsernameOrPassword = async (req, res) => {
  try {
    const username = req.body.username;
    const oldPassword = req.body.oldPass;
    const newPass = req.body.newPass;
    const id = req.body.id;
    let result;
    if (oldPassword == "" && newPass == "" && username != "") {
      result = await admin.findByIdAndUpdate(id, { username }, { new: true });

      await saveActivity(id, `Updated your username to ${username}`);

      res.status(200).json({
        message: "Username updated Successfully!!",
        result: {
          _id: result._id,
          name: result.name,
          username: result.username,
        },
      });
    } else if ((oldPassword != "" && newPass != "") || username != "") {
      const update = { username, password: newPass };

      const myProfile = await admin.findById(id);

      if (await comparePassword(oldPassword, myProfile.password)) {
        result = await admin.findByIdAndUpdate(id, update, { new: true });

        await saveActivity(id, `Updated your username  and password`);

        res.status(200).json({
          message: "Username and password updated Successfully!!",
          result: {
            _id: result._id,
            name: result.name,
            username: result.username,
          },
        });
      } else {
        res.status(200).json({ message: "your old password is incorrect!!" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const updateName = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const updatedName = await admin.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    await saveActivity(id, `Updated your name to ${name}`);

    res.status(200).json({
      message: "Name updated successfully",
      result: {
        id: updatedName._id,
        name: updatedName.name,
        username: updatedName.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const compareUsername = await admin.findOne({
    username,
  });

  if (compareUsername) {
    const comarePass = await comparePassword(
      password,
      compareUsername.password
    );

    if (comarePass) {
      const token = generateToken(
        compareUsername._id,
        compareUsername.username
      );
      res.status(200).json({
        message: "Login successful",
        userInfo: {
          name: compareUsername.name,
          username: compareUsername.username,
        },
        token,
      });
    }
    res.status(200).json({ message: "bad credentials" });
  }
  res.status(200).json({ message: "bad credentials" });
};

export const officerResetPassword = async (req, res) => {
  const id = req.body.id;
  const password = await endcodePassword("12345678");
  const officer = await Officer.findByIdAndUpdate(
    id,
    { password },
    { new: false }
  );
  res.status(200).json({
    message: "Officer password reseted successfully",
    password: "12345678",
  });
};

export const customerResetPassword = async (req, res) => {
  const id = req.body.id;
  const password = await endcodePassword("12345678");
  const customer = await CustomerAccount.findOneAndUpdate(
    { customerInfo: id },
    { password },
    { new: true }
  );
  res.status(200).json({
    message: "Officer password reseted successfully",
    password: "12345678",
  });
};

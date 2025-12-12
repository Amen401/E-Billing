import { adminAT } from "../models/AdminActivityTracker.js";
import { admin } from "../models/AdminModel.js";

import { customerADHistory } from "../models/CustomerActivationDeactivationHistory.js";
import { Customer } from "../models/CustomerModel.js";
import { officerADHistory } from "../models/OfficerActivationDeactivationHistory.js";
import { Officer } from "../models/OfficerModel.js";
import { passwordResetHistory } from "../models/PasswordResetHistory.js";
import { formattedDate } from "../Util/FormattedDate.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";

export const createOfficer = async (req, res) => {
  try {
    const { newOfficer, adminId } = req.body;
    const existingOfficer = await Officer.findOne({ email: newOfficer.email });
    if (existingOfficer) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await Officer.findOne({
      username: newOfficer.username,
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    newOfficer.password = await endcodePassword(newOfficer.password);
    const newOfficerSchema = new Officer(newOfficer);

    const saveOfficer = await newOfficerSchema.save();
    await saveActivity(
      adminId,
      `created an officer account called name: ${saveOfficer.name} with username: ${saveOfficer.username}`
    );
    res.status(200).json({
      message: "New Officer added successfully",
      newOfficer: {
        fullName: saveOfficer.name,
        username: saveOfficer.username,
        email: saveOfficer.email,
        role: saveOfficer.role,
        department: saveOfficer.department,
        password: "12345678",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

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
    const searchResult = await Officer.find({
      name: new RegExp(req.query.q, "i"),
    });

    res.status(200).json(searchResult);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchCustomer = async (req, res) => {
  try {
    const { searchBy, value } = req.body;
    const searchResult = await Customer.find({
      [searchBy]: new RegExp(value, "i"),
    });
    res.status(200).json(searchResult);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const activateDeactivateOfficer = async (req, res) => {
  try {
    const isActive = req.body.isActive;
    const id = req.body.id;
    const adminId = req.body.adminId;
    const updatedResult = await Officer.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    const saveHistory = new officerADHistory({
      officerId: id,
      date: formattedDate(),
      action: isActive ? "Activate" : "Deactivate",
    });

    await saveHistory.save();
    await saveActivity(
      adminId,
      `${
        updatedResult.isActive ? "Activated " : "Deactivated "
      } an officer account called name: ${updatedResult.name} with username: ${
        updatedResult.username
      }`
    );
    res.status(200).json({
      message: `Officer ${
        updatedResult.isActive ? "Activated " : "Deactivated "
      } Successfully!!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
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
      const myProfile = await admin.findById(id);
      const password = await endcodePassword(newPass);
      if (await comparePassword(oldPassword, myProfile.password)) {
        result = await admin.findByIdAndUpdate(id, { password }, { new: true });

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
  try {
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

        await saveActivity(compareUsername._id, `loged in to the system`);

        res.status(200).json({
          message: "Login successful",
          userInfo: {
            id: compareUsername._id,
            name: compareUsername.name,
            username: compareUsername.username,
          },
          token,
        });
      }
      res.status(200).json({ message: "bad credentials" });
    }
    res.status(200).json({ message: "bad credentials" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const officerResetPassword = async (req, res) => {
  try {
    const id = req.body.id;
    const password = await endcodePassword("12345678");
    const officer = await Officer.findByIdAndUpdate(
      id,
      { password },
      { new: true }
    );

    await saveActivity(
      req.authUser.id,
      `Password reset for username: ${officer.username}, name: ${officer.name}`
    );
    const passwordHistory = new passwordResetHistory({
      userId: id,
      date: formattedDate(),
    });
    await passwordHistory.save();
    res.status(200).json({
      message: "Officer password reseted successfully",
      password: "12345678",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const customerResetPassword = async (req, res) => {
  try {
    const id = req.body.id;
    const password = await endcodePassword("12345678");
    const customer = await Customer.findOneAndUpdate(
      { _id: id },
      { password },
      { new: true }
    );

    await saveActivity(
      req.authUser.id,
      `Password reset for accountNumber: ${customer.accountNumber}`
    );
    const passwordHistory = new passwordResetHistory({
      userId: id,
      date: formattedDate(),
    });
    await passwordHistory.save();
    res.status(200).json({
      message: "Officer password reseted successfully",
      password: "12345678",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const officersInformationAndList = async (req, res) => {
  try {
    const allOfficers = await Officer.find();
    const numberOfOfficers = allOfficers.length;
    const activeOfficers = allOfficers.filter(
      (officer) => officer.isActive == true
    );
    const inactiveOfficers = numberOfOfficers - activeOfficers.length;

    res.status(200).json({
      allOfficers,
      numberOfOfficers,
      activeOfficers: activeOfficers.length,
      inactiveOfficers,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const customerInformationAndList = async (req, res) => {
  try {
    const allCustomers = await Customer.find();
    const numberOfCustomers = allCustomers.length;
    const activeCustomers = allCustomers.filter(
      (customer) => customer.isActive
    );
    const inactiveCustomers = allCustomers.filter(
      (customer) => !customer.isActive
    );
    let customerList = [];
    if (allCustomers.length > 10) {
      for (let index = 0; index < 10; index++) {
        customerList.push(allCustomers[index]);
      }
    } else {
      customerList = allCustomers;
    }
    res.status(200).json({
      customerList,
      numberOfCustomers,
      activeCustomers: activeCustomers.length,
      inactiveCustomers: inactiveCustomers.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const myActivities = async (req, res) => {
  try {
    const myActivities = await adminAT.find({ adminId: req.authUser.id });
    let result = [];

    if (myActivities.length <= 10) {
      result = myActivities.slice().reverse();
    } else {
      const recentActivities = myActivities.slice().reverse();
      for (let index = 0; index < 10; index++) {
        result.push(recentActivities[index]);
      }
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const searchMyActivities = async (req, res) => {
  try {
    const { filter, value } = req.query;
    const result = await adminAT.find({
      [filter]: new RegExp(value, "i"),
      adminId: req.authUser.id,
    });
    console.log(filter, value, result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
export const activateDeactivateCustomer = async (req, res) => {
  try {
    const { id, isActive, adminId } = req.body;

    const getCustomerAndUPdate = await Customer.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    const history = new customerADHistory({
      customerId: id,
      action: isActive ? "Activate" : "Deactivate",
      date: formattedDate(),
    });
    await history.save();

    await saveActivity(
      adminId,
      `${
        getCustomerAndUPdate.isActive ? "Activated" : "Deactivated"
      } getCustomerAndUPdate.accountNumber
      }  account number`
    );

    res.status(200).json({
      message: `Customer ${
        getCustomerAndUPdate.isActive ? "Activated" : "Deactivated"
      } Successfully!!`,
      result: getCustomerAndUPdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const adminlogout = async (req, res) => {
  try {
    await saveActivity(req.authUser.id, `You logged out from the system!!`);
    res.status(200).json({ message: "Bye!!!!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

async function saveActivity(id, activity) {
  const AdminActivity = new adminAT({
    adminId: id,
    activity: activity,
    date: formattedDate(),
  });
  await AdminActivity.save();
}

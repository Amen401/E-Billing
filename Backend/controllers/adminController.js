import { adminAT } from "../models/AdminActivityTracker.js";
import { admin } from "../models/AdminModel.js";
import { CustomerAccount } from "../models/customerAccount.js";
import { customerADHistory } from "../models/CustomerActivationDeactivationHistory.js";
import { officerADHistory } from "../models/OfficerActivationDeactivationHistory.js";
import { Officer } from "../models/OfficerModel.js";
import { passwordResetHistory } from "../models/PasswordResetHistory.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
const date = new Date();
const formatted = date.toLocaleString("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
export const createOfficer = async (req, res) => {
  try {
    const { newOfficer, adminId } = req.body;

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
}; //will be removed after adding one admin!!

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

// export const getOfficerStats = async (req, res) => {
//   try {
//     const total = await Officer.countDocuments();
//     const active = await Officer.countDocuments({ isActive: true });
//     const inactive = await Officer.countDocuments({ isActive: false });

//     res.status(200).json({ total, active, inactive });
//   } catch (error) {
//     console.error("Officer Stats Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const searchCustomer = async (req, res) => {
  try {
    const { searchBy, value } = req.body;
  } catch (error) {}
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
      date: formatted,
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
      id,
      `Password reset for username: ${officer.username}, name: ${officer.name}`
    );
    const passwordHistory = new passwordResetHistory({
      userId: id,
      date: formatted,
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
    const customer = await CustomerAccount.findOneAndUpdate(
      { customerInfo: id },
      { password },
      { new: true }
    );

    await saveActivity(
      id,
      `Password reset for accountNumber: ${customer.accountNumber}`
    );
    const passwordHistory = new passwordResetHistory({
      userId: id,
      date: formatted,
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
    const allCustomers = await CustomerAccount.find().populate("Customer");
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
    const id = req.body.id;
    const isActive = req.body.isActive;

    const getCustomerAndUPdate = await CustomerAccount.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    const history = new customerADHistory({
      customerId: id,
      action: isActive ? "Activate" : "Deactivate",
      date: formatted,
    });
    await history.save();
    await saveActivity(
      req.userAuth.id,
      `${isActive ? "Activated " : "Deactivated "} ${
        getCustomerAndUPdate.accountNumber
      }  account number`
    );
    re;
    res.status(200).json(getCustomerAndUPdate);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

async function saveActivity(id, activity) {
  const AdminActivity = new adminAT({
    adminId: id,
    activity: activity,
    date: formatted,
  });
  await AdminActivity.save();
}

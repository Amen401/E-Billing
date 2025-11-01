import { admin } from "../models/AdminModel.js";
import { CustomerAccount } from "../models/customerAccount.js";
import { Officer } from "../models/OfficerModel.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { addSystemActivity } from "../controllers/systemActivityController.js";
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

export const activateDeactivateOfficer = async (req, res) => {
  try {
    const { id, isActive } = req.body;


    const updateData = { isActive };
    if (!isActive) {
      updateData.deactivatedAt = new Date();
    } else {
      updateData.deactivatedAt = null;
    }

    const updatedOfficer = await Officer.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedOfficer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    await addSystemActivity({
      event: `Officer "${updatedOfficer.name}" was ${isActive ? "activated" : "deactivated"}`,
      user: "Admin",
      status: "success",
      req,
    });

    res.status(200).json(updatedOfficer);

  } catch (error) {
    console.error("Activate/Deactivate Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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

    const user = await admin.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.username);

    return res.status(200).json({
      message: "Login successful",
      userInfo: {
        name: user.name,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const officerResetPassword = async (req, res) => {
  try {
    const id = req.body.id;
    const defaultPassword = "12345678";
    const hashedPassword = await endcodePassword(defaultPassword);

    const officer = await Officer.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }


    await addSystemActivity({
      event: `Officer "${officer.name}" password was reset`,
      user: "Admin",
      status: "success",
      req, 
    });

    res.status(200).json({
      message: "Officer password reset successfully",
      resetTo: defaultPassword,
      officer: {
        id: officer._id,
        name: officer.name,
        username: officer.username,
        email: officer.email,
        lastPasswordReset: officer.lastPasswordReset,
      },
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const customerResetPassword = async (req, res) => {
  try {
    const id = req.body.id;
    const defaultPassword = "12345678";
    const hashedPassword = await endcodePassword(defaultPassword);
    const customer = await CustomerAccount.findByIdAndUpdate(
      { customerInfo: id },
      { password },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({
      message: "Customer password reset successfully",
      resetTo: defaultPassword,
      customer: {
        id: customer._id,
        name: customer.name,
        accountnumber: customer.accountNumber,
        region: customer.region,
      },
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOfficer = async (req, res) => {
  try {
    const { name, username, email, department, assignedArea } = req.body;

    const validDepartments = [
      "Customer Support",
      "Meter Reading",
      "Maintenance",
    ];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        message: "Invalid department selection",
        allowed: validDepartments,
      });
    }

    const existingOfficer = await Officer.findOne({
      $or: [{ username }, { email }],
    });

    if (existingOfficer) {
      return res.status(400).json({
        message: "Username or Email already in use",
      });
    }

    const defaultPassword = "12345678";
    const hashedPassword = await endcodePassword(defaultPassword);

    const newOfficer = new Officer({
      name,
      username,
      email,
      department,
      assignedArea,
      password: hashedPassword,
      isActive: true,
    });

    const savedOfficer = await newOfficer.save();

    res.status(201).json({
      message: "Officer created successfully",
      officer: {
        _id: savedOfficer._id,
        name: savedOfficer.name,
        username: savedOfficer.username,
        email: savedOfficer.email,
        department: savedOfficer.department,
        assignedArea: savedOfficer.assignedArea,
        isActive: savedOfficer.isActive,
        createdAt: savedOfficer.createdAt,
      },
      defaultPassword,
    });
  } catch (error) {
    console.error("Create Officer Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

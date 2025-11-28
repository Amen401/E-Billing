import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { Customer } from "../models/CustomerModel.js";
import { Officer } from "../models/OfficerModel.js";
import { admin } from "../models/AdminModel.js";
import { saveActivity } from "../Util/activitySaver.js";
export const unifiedLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = null;
    let role = null;

  
    const customer = await Customer.findOne({ accountNumber: username });
    if (customer) {
      const valid = await comparePassword(password, customer.password);
      if (!valid) return res.status(200).json({ message: "bad credentials" });

      if (!customer.isActive)
        return res.status(200).json({ message: "Account deactivated" });

      await saveActivity(customer._id, "Customer logged in");
      
      user = customer;
      role = "customer";
    }


    if (!user) {
      const officer = await Officer.findOne({ username });

      if (officer) {
        const valid = await comparePassword(password, officer.password);
        if (!valid) return res.status(200).json({ message: "bad credentials" });

        if (!officer.isActive)
          return res.status(200).json({ message: "Account deactivated" });

        await saveActivity(officer._id, "Officer logged in");

        user = officer;
        role = "officer";
      }
    }

  
    if (!user) {
      const adminUser = await admin.findOne({ username });

      if (adminUser) {
        const valid = await comparePassword(password, adminUser.password);
        if (!valid) return res.status(200).json({ message: "bad credentials" });

        await saveActivity(adminUser._id, "Admin logged in");

        user = adminUser;
        role = "admin";
      }
    }


    if (!user) {
      return res.status(200).json({ message: "bad credentials" });
    }

    const token = generateToken(user._id, user.username || user.accountNumber);


    return res.status(200).json({
      message: "Login successful",
      role,
      userInfo: {
        id: user._id,
        name: user.name,
        username: user.username || user.accountNumber,
      },
      token,
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

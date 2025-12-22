import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { Customer } from "../models/CustomerModel.js";
import { Officer } from "../models/OfficerModel.js";
import { admin } from "../models/AdminModel.js";
import { officerAT } from "../models/OfficerActivityTracker.js";

export const unifiedLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = null;
    let role = null;

    const loginChecks = [
      {
        model: Customer,
        role: "customer",
        identifier: "accountNumber",
        activityMsg: "Customer logged in",
      },
      {
        model: Officer,
        role: "officer",
        identifier: "username",
        activityMsg: "Officer logged in",
      },
      {
        model: admin,
        role: "admin",
        identifier: "username",
        activityMsg: "Admin logged in",
      },
    ];

    for (const check of loginChecks) {
      const foundUser = await check.model.findOne({ [check.identifier]: username });
      if (!foundUser) continue;

      const valid = await comparePassword(password, foundUser.password);
      if (!valid)
        return res.status(200).json({ message: "bad credentials" });

      if (check.role !== "admin" && !foundUser.isActive)
        return res.status(200).json({ message: "Account deactivated" });

      await saveActivity(foundUser._id, check.activityMsg, check.role);

      user = foundUser;
      role = check.role;
      break;
    }

    if (!user)
      return res.status(200).json({ message: "bad credentials" });

    const token = generateToken(user._id, user.username || user.accountNumber);

    return res.status(200).json({
      message: "Login successful",
      role,
      userInfo: {
        id: user._id,
        name: user.name,
        username: user.username || user.accountNumber || user.name,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};


export async function saveActivity(userId, activity, role = "officer") {
  try {
    const formattedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const activityLog = new officerAT({
      officerId: userId, 
      activity,
      role, 
      date: formattedDate,
    });

    await activityLog.save();
  } catch (error) {
    console.error("Failed to save activity:", error);
  }
}

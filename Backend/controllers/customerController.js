import { Customer } from "../models/CustomerModel.js";
import { comparePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";

export const customerLogin = async (req, res) => {
  const { username, password } = req.body;

  const checkUsername = await Customer.findOne({
    accountNumber: username,
  });

  if (!checkUsername) {
    res.status(200).json({ message: "bad credentials" });
  }

  const checkPassword = await comparePassword(password, checkUsername.password);

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
};

export const changePassword = async (req, res) => {};

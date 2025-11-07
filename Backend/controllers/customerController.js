import { CustomerAccount } from "../models/customerAccount.js";
import { comparePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";

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

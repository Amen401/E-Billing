//import { CustomerAccount } from "../models/customerAccount.js";
import { Officer } from "../models/OfficerModel.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";

export const officerLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const checkUsername = await Officer.findOne({
    username,
  });
  console.log(checkUsername);
  if (!checkUsername) {
    res.status(200).json({ message: "bad credentials" });
  }
  const checkPassword = await comparePassword(password, checkUsername.password);
  console.log(checkPassword);
  if (!checkPassword) {
    res.status(200).json({ message: "bad credentials" });
  }

  res.status(200).json({
    message: "login successful",
    OfficerInfo: {
      username: checkUsername.username,
      name: checkUsername.name,
    },
    token: generateToken(checkUsername._id, username),
  });
};

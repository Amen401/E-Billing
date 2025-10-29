import { CustomerAccount } from "../models/customerAccount.js";
import { Officer } from "../models/OfficerModel.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";

export const createOfficer = async (req, res) => {
  try {
    const newOfficer = req.body;
    newOfficer.password = await endcodePassword(newOfficer.password);
    const newOfficerSchema = new Officer(newOfficer);

    const saveOfficer = await newOfficerSchema.save();

    res.status(200).json({
      message: "New Officer added successfully",
      newOfficer: saveOfficer,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

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

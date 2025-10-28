import { admin } from "../models/AdminModel.js";
import { Officer } from "../models/OfficerModel.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";

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
      name: new RegExp(req.body.name, "i"),
    });

    res.status(200).json(searchResult);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
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
      res
        .status(200)
        .json({
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
        res
          .status(200)
          .json({
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

    res
      .status(200)
      .json({
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

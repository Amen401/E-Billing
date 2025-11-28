import { Customer } from "../models/CustomerModel.js";
import { officerAT } from "../models/OfficerActivityTracker.js";
import { Officer } from "../models/OfficerModel.js";
import { createAccountNumberForCustomer } from "../Util/accountNumberGeneratorUtil.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { cloud } from "../Util/Cloundnary.js";
import { CustomerComplient } from "../models/CustomerComplient.js";

const date = new Date();
const formatted = date.toLocaleString("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

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

  if (!checkUsername.isActive) {
    res
      .status(200)
      .json({ message: "Account deactivated!! Contact your system Officer" });
  }
  await saveActivity(checkUsername._id, `You logged in to the system`);
  res.status(200).json({
    message: "login successful",
    OfficerInfo: checkUsername,
    token: generateToken(checkUsername._id, checkUsername.username),
  });
};
export const addCustomer = async (req, res) => {
  try {
    const regForm = req.body;
    regForm.password = await endcodePassword(regForm.password);

    let isAccountExists = true;

    while (isAccountExists) {
      regForm.accountNumber = createAccountNumberForCustomer();
      const account = await Customer.findOne({
        accountNumber: regForm.accountNumber,
      });
      if (!account) {
        isAccountExists = false;
      }
    }
    const newCustomer = new Customer(regForm);

    const save = await newCustomer.save();

    saveActivity(
      req.authUser.id,
      `Created customer account with name: ${save.name} and accountNumber: ${save.accountNumber}`
    );
    res.status(200).json({
      message: "Account created Successfully",
      accountNumber: save.accountNumber,
      password: "12345678",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const myActivities = async (req, res) => {
  try {
    const myActivities = await officerAT.find({ officerId: req.authUser.id });
    let result = [];

    if (myActivities.length <= 10) {
      result = myActivities.reverse();
    } else {
      const recentActivities = myActivities.reverse();
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
    const result = await officerAT.find({
      [filter]: new RegExp(value, "i"),
      adminId: req.authUser.id,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
export const updateUsernameOrPassword = async (req, res) => {
  try {
    const username = req.body.username;
    const oldPassword = req.body.oldPass;
    const newPass = req.body.newPass;
    const id = req.authUser.id;
    let result;
    if (oldPassword == "" && newPass == "" && username != "") {
      result = await Officer.findByIdAndUpdate(id, { username }, { new: true });

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
      const myProfile = await Officer.findById(id);
      const password = await endcodePassword(newPass);
      if (await comparePassword(oldPassword, myProfile.password)) {
        result = await Officer.findByIdAndUpdate(
          id,
          { password },
          { new: true }
        );

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
export const changeProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const officer = await Officer.findById(req.authUser.id);

    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const result = await cloud.uploader.upload(dataUri, {
      folder: "Officer-profile-pic",
      tags: [req.authUser.id, "profile_pic"],
    });

    if (officer.photo?.secure_url) {
      await cloud.uploader.destroy(officer.photo.public_id);
    }

    officer.photo = {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  officer = await Officer.findByIdAndUpdate(req.authUser.id, data, {
      new: true,
    });
    console.log(officer);
    await saveActivity(req.authUser.id, `Updated your profile picture`);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
export const updateNameOrEmail = async (req, res) => {
  try {
    const { atribute, value } = req.body;
    const updateName = await Officer.findByIdAndUpdate(
      req.authUser.id,
      { [atribute]: value },
      { new: true }
    );
    await saveActivity(req.authUser.id, `your ${atribute} updated to ${value}`);
    res.status(200).json({
      message: atribute + " updated successfully!!",
      updatedProfile: updateName,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getCustomer = async (req, res) => {
  try {
    const allCustomers = await Customer.find();
    let customerList = [];
    if (allCustomers.length > 10) {
      for (let index = 0; index < 10; index++) {
        customerList.push(allCustomers[index]);
      }
    } else {
      customerList = allCustomers;
    }
    res.status(200).json(customerList);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const officerLogout = async (req, res) => {
  try {
    await saveActivity(req.authUser.id, `You logged out`);
    res.status(200).json({ message: "Bye!!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchCustomerComplients = async (req, res) => {
  try {
    const { filter, value } = req.query;
    const complients = await CustomerComplient.find({
      [filter]: new RegExp(value, "i"),
    }).populate("resolvedBy");

    if (!complients) {
      res.status(200).json(complients);
    }

    res.status(200).json(complientCustomDto(complients));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const customerComplientInformations = async (req, res) => {
  try {
    const complientsData = await CustomerComplient.find();
    const complients = complientsData.reverse();
    const allComplients = complients.length;
    const urgentComplients = complients.filter(
      (comp) => comp.status == "urgent"
    ).length;
    const pendingComplients = complients.filter(
      (comp) => comp.status == "pending"
    ).length;
    const resolvedComplients = complients.filter(
      (comp) => comp.status == "resolved"
    ).length;

    if (complients.length <= 10) {
      res.status(200).json({
        complients: complientCustomDto(complients),
        allComplients,
        urgentComplients,
        pendingComplients,
        resolvedComplients,
      });
    }

    let someComplients = [];

    for (let index = 0; index < 10; index++) {
      someComplients.push(complients[index]);
    }

    res.status(200).json({
      someComplients: complientCustomDto(someComplients),
      allComplients,
      urgentComplients,
      pendingComplients,
      resolvedComplients,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateComplientStatus = async (req, res) => {
  try {
    const { cId, status } = req.body;
    const updatedStatus = {
      status,
      resolvedBy: status == "resolved" ? req.authUser.id : null,
    };
    const complient = await CustomerComplient.findByIdAndUpdate(
      cId,
      updatedStatus,
      { new: true }
    );
    saveActivity(
      req.authUser.id,
      `updated complient status to ${status} raised by ${complient.customerAccNumber} account number`
    );
    res
      .status(200)
      .json({ message: "Complient status updated successfully!!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
async function saveActivity(id, activity) {
  const OfficerActivity = new officerAT({
    officerId: id,
    activity: activity,
    date: formatted,
  });
  await OfficerActivity.save();
}

export function complientCustomDto(complients) {
  let complientsDto = [];
  for (let index = 0; index < complients.length; index++) {
    let complient = {
      id: complients[index]._id,
      customerName: complients[index].customerName,
      customerAccNumber: complients[index].customerAccNumber,
      subject: complients[index].subject,
      date: complients[index].date,
      status: complients[index].status,
      description: complients[index].description,
      resolvedBy:
        complients[index].status == "resolved"
          ? complients[index].resolvedBy.name
          : "",
    };
    complientsDto.push(complient);
  }
  return complientsDto;
}

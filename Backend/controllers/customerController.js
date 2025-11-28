import { CustomerComplient } from "../models/CustomerComplient.js";
import { Customer } from "../models/CustomerModel.js";
import { merterReading } from "../models/MeterReading.js";
import { paymentSchedule } from "../models/PaymentSchedule.js";
import { customerTariff } from "../models/Tariff.js";
import { detectAnomaly } from "../Util/AnomalyDetector.js";
import { cloud } from "../Util/Cloundnary.js";
import { formattedDate } from "../Util/FormattedDate.js";
import { handlePredictionRequest } from "../Util/MonthlyUsagePredictor.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { extractKWAndMeterNo } from "../Util/photoAnalyzer.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { complientCustomDto } from "./officerController.js";

export const customerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const checkUsername = await Customer.findOne({
      accountNumber: username,
    });

    if (!checkUsername) {
      res.status(200).json({ message: "bad credentials" });
    }

    const checkPassword = await comparePassword(
      password,
      checkUsername.password
    );

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
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;

    const account = await Customer.findById(req.authUser.id);

    if (await comparePassword(oldPass, account.password)) {
      const updatedAcc = await Customer.findByIdAndUpdate(req.authUser.id, {
        password: await endcodePassword(newPass),
      });

      res.status(200).json({ message: "Password updated successfully!!" });
    }
    res.status(200).json({ message: "Your old password is not correct" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const writeComplain = async (req, res) => {
  try {
    const complain = req.body;
    complain.customerAccNumber = req.authUser.username;

    const newComplain = new CustomerComplient(complain);
    newComplain.save();
    res.status(200).json({ message: "Complain submitted successfully!!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const myComplains = async (req, res) => {
  try {
    const myComplains = await CustomerComplient.find({
      customerAccNumber: req.authUser.username,
    });
    const complains = myComplains.reverse();
    if (!myComplains) {
      res.status(200).json(myComplains);
    }
    if (myComplains.length <= 10) {
      res.status(200).json({ myComplains: complientCustomDto(complains) });
    }
    let someOfMyComplain = [];
    for (let index = 0; index < 10; index++) {
      let complain = complains[index];
      someOfMyComplain.push(complain);
    }
    res.status(200).json({ myComplains: complientCustomDto(someOfMyComplain) });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const predictMyUsage = async (req, res) => {
  try {
    const usagePrediction = await handlePredictionRequest(req, res);
  } catch (error) {}
};

export const searchMyComplain = async (req, res) => {
  try {
    const { filter, value } = req.query;
    const complients = await CustomerComplient.find({
      [filter]: new RegExp(value, "i"),
      customerAccNumber: req.authUser.username,
    }).populate("resolvedBy");

    if (!complients) {
      res.status(200).json(complients);
    }

    res.status(200).json(complientCustomDto(complients));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkPaymentSchedule = async (req, res) => {
  try {
    const openedPaymentSchedule = await paymentSchedule.find({ isOpen: true });
    res.status(200).json(openedPaymentSchedule);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitReading = async (req, res) => {
  try {
    const photo = req.file;
    const base64 = Buffer.from(photo.buffer).toString("base64");
    const mimeType = photo.mimetype;
    const resp = await extractKWAndMeterNo(base64, mimeType);

    const findAccount = await Customer.findById(req.authUser.id);
    if (resp.meterNo != findAccount.meterReaderSN) {
      res.status(200).json({
        message: "This meter is not your meter. please insert your meter image",
      });
    }
    const lastReading = await merterReading
      .findOne({
        customerId: req.authUser.id,
      })
      .sort({ createdAt: -1 })
      .exec();

    const monthlyUsage = resp.kilowatt - lastReading.killowatRead;

    const uploadPhoto = await cloud.uploader.upload(base64, {
      folder: "Meter-Readings",
      tags: [req.authUser.id, "meter-readings"],
    });
    let newMeterReading = new merterReading();
    if (uploadPhoto) {
      newMeterReading.photo = {
        secure_url: uploadPhoto.secure_url,
        public_id: uploadPhoto.public_id,
      };
      newMeterReading.killowatRead = resp.killowat;
      newMeterReading.monthlyUsage = monthlyUsage;
      const anomalyStatus = await detectAnomaly(
        req.authUser.id,
        resp.killowat,
        monthlyUsage
      );
      newMeterReading.anomalyStatus = anomalyStatus.anomalyStatus;
      newMeterReading.paymentStatus = "Not Paid";
      const myTariff = await customerTariff.findOne({
        customerId: req.authUser.id,
      });
      newMeterReading.fee =
        myTariff.energyTariff * monthlyUsage + myTariff.serviceCharge;
      newMeterReading.dateOfSubmission = formattedDate();
      const paymentMonth = await paymentSchedule.findOne({ isOpen: true });
      newMeterReading.paymentMonth = paymentMonth._id;
      newMeterReading.customerId = req.authUser.id;

      const result = await newMeterReading.save();
      res.status(200).json({
        meterReadingresult: result,
        message: "Meter reading successfuly submitted",
      });
    }
    res
      .status(200)
      .json({ message: "Something is not correct please try again" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const myMonthlyUsageAnlysis = async (req, res) => {
  try {
    const lastReadings = await merterReading
      .find({ customerId: req.authUser.id })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("paymentMonth")
      .exec();
    const nextMonthUsage = await handlePredictionRequest();

    res.status(200).json(lastReadings, nextMonthUsage);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

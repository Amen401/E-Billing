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
import streamifier from "streamifier";

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
    complain.customerName = req.authUser.name || req.authUser.username;
    complain.date = new Date().toISOString();
    complain.status = "Pending";

    const newComplain = new CustomerComplient(complain);
    const savedComplain = await newComplain.save();
    return res.status(200).json(savedComplain);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const myComplains = async (req, res) => {
  try {
    let complaints = await CustomerComplient.find({
      customerAccNumber: req.authUser.username,
    }).sort({ date: -1 });

    complaints = complaints.slice(0, 10);

    const result = complientCustomDto
      ? complientCustomDto(complaints)
      : complaints;

    return res.status(200).json({ myComplains: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
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

    if (!photo) {
      return res.status(400).json({ message: "Image file is missing." });
    }

    const base64 = Buffer.from(photo.buffer).toString("base64");
    const mimeType = photo.mimetype;
    const resp = await extractKWAndMeterNo(base64, mimeType);

    if (
      typeof resp.kilowatt !== "number" ||
      resp.kilowatt === null ||
      isNaN(resp.kilowatt)
    ) {
      return res
        .status(400)
        .json({
          message: "Extracted kilowatt reading is invalid or unreadable.",
        });
    }

    const findAccount = await Customer.findById(req.authUser.id);

    if (!findAccount) {
      return res.status(404).json({ message: "Customer account not found." });
    }

    if (resp.meterNo != findAccount.meterReaderSN) {
      return res.status(403).json({
        message:
          "This meter is not linked to your account. Please insert your meter image.",
      });
    }

    const lastReading = await merterReading
      .findOne({
        customerId: req.authUser.id,
      })
      .sort({ createdAt: -1 })
      .exec();

    const previousRead = lastReading ? lastReading.killowatRead : 0;

    const monthlyUsage = resp.kilowatt - previousRead;

    const uploadPhoto = await new Promise((resolve, reject) => {
      const uploadStream = cloud.uploader.upload_stream(
        {
          folder: "Meter-Readings",
          tags: [req.authUser.id, "meter-readings"],
          quality: "auto:low",
          timeout: 300000,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(photo.buffer).pipe(uploadStream);
    });

    let newMeterReading = new merterReading();

    if (uploadPhoto) {
      newMeterReading.photo = {
        secure_url: uploadPhoto.secure_url,
        public_id: uploadPhoto.public_id,
      };

      newMeterReading.killowatRead = resp.kilowatt;

      newMeterReading.monthlyUsage = monthlyUsage;

      const anomalyStatus = await detectAnomaly(
        req.authUser.id,
        resp.kilowatt,
        monthlyUsage
      );

      newMeterReading.anomalyStatus = anomalyStatus.anomalyStatus;
      newMeterReading.paymentStatus = "Not Paid";

      const myTariff = await customerTariff.findOne({
        customerId: req.authUser.id,
      });

      if (!myTariff) {
        return res
          .status(404)
          .json({
            message:
              "Customer tariff information not found. Cannot calculate fee.",
          });
      }

      newMeterReading.fee =
        myTariff.energyTariff * monthlyUsage + myTariff.serviceCharge;
      newMeterReading.dateOfSubmission = formattedDate();

      const paymentMonth = await paymentSchedule.findOne({ isOpen: true });
      if (!paymentMonth) {
        return res
          .status(404)
          .json({ message: "No open payment schedule found." });
      }

      newMeterReading.paymentMonth = paymentMonth._id;
      newMeterReading.customerId = req.authUser.id;

      const result = await newMeterReading.save();

      return res.status(201).json({
        meterReadingresult: result,
        message: "Meter reading successfully submitted",
      });
    }

    return res
      .status(500)
      .json({
        message: "Something is not correct, please try again (upload failed).",
      });
  } catch (error) {
    console.error("Submission Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during reading submission" });
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

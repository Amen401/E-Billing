import { CustomerComplient } from "../models/CustomerComplient.js";
import { Customer } from "../models/CustomerModel.js";
import { merterReading } from "../models/MeterReading.js";
import { customerPayments } from "../models/Payments.js";
import { paymentSchedule } from "../models/PaymentSchedule.js";
import { CustomerTariff } from "../models/Tariff.js";
import { detectAnomaly } from "../Util/AnomalyDetector.js";
import { cloud } from "../Util/Cloundnary.js";
import { formattedDate } from "../Util/FormattedDate.js";
import { handlePredictionRequest } from "../Util/MonthlyUsagePredictor.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { extractKWAndMeterNo } from "../Util/photoAnalyzer.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { complientCustomDto } from "./officerController.js";
import streamifier from "streamifier";
import axios from "axios";
import crypto from "crypto";

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
  const customerId = req.authUser.id;
  const photo = req.file;

  try {
    if (!photo) {
      return res.status(400).json({ message: "Image file is missing." });
    }

    const base64 = Buffer.from(photo.buffer).toString("base64");
    const mimeType = photo.mimetype;

    const resp = await extractKWAndMeterNo(base64, mimeType);
    const { kilowatt: currentRead, meterNo: extractedMeterNo } = resp;

    if (
      typeof currentRead !== "number" ||
      currentRead === null ||
      isNaN(currentRead) ||
      currentRead < 0
    ) {
      return res.status(400).json({
        message: "Extracted kilowatt reading is invalid or unreadable.",
      });
    }

    const findAccount = await Customer.findById(customerId);
    if (!findAccount) {
      return res.status(404).json({ message: "Customer account not found." });
    }

    if (extractedMeterNo != findAccount.meterReaderSN) {
      return res.status(403).json({
        message:
          "This meter is not linked to your account. Please insert your meter image.",
      });
    }

    const lastReading = await merterReading
      .findOne({ customerId })
      .sort({ createdAt: -1 })
      .exec();
    
    const previousRead = lastReading ? lastReading.killowatRead : 0;
    const monthlyUsage = currentRead - previousRead;

    if (monthlyUsage < 0) {
      return res.status(400).json({
        message: "Current reading cannot be less than previous reading.",
      });
    }

    const uploadPhoto = await new Promise((resolve, reject) => {
      const uploadStream = cloud.uploader.upload_stream(
        {
          folder: "Meter-Readings",
          tags: [customerId, "meter-readings"],
          quality: "auto:low",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(photo.buffer).pipe(uploadStream);
    });

    if (!uploadPhoto) throw new Error("Photo upload failed");

    const [tariffDetails, paymentScheduleDetails, anomalyResult] =
      await Promise.all([
        CustomerTariff.findOne({ customerId }),
        paymentSchedule.findOne({ isOpen: true }),
        detectAnomaly(customerId, currentRead, monthlyUsage),
      ]);

    if (!tariffDetails) {
      return res.status(400).json({ 
        message: "Tariff details not found for customer." 
      });
    }

    if (!paymentScheduleDetails) {
      return res.status(400).json({ 
        message: "No active payment schedule found." 
      });
    }

    const energyTariff = Number(tariffDetails.energyTariff) || 0;
    const serviceCharge = Number(tariffDetails.serviceCharge) || 0;
    
    if (energyTariff <= 0) {
      return res.status(400).json({ 
        message: "Invalid energy tariff rate." 
      });
    }

    const energyCharge = energyTariff * monthlyUsage;

    const subtotal = energyCharge + serviceCharge;
    const vatRate = 0.15; 
    const vat = subtotal * vatRate;

    const HIGH_CONSUMPTION_THRESHOLD = 200;
    const HIGH_CONSUMPTION_RATE = 0.005;
    let highConsumptionCharge = 0;
    
    if (monthlyUsage > HIGH_CONSUMPTION_THRESHOLD) {
      highConsumptionCharge = energyCharge * HIGH_CONSUMPTION_RATE;
    }

    const totalFee = energyCharge + serviceCharge + vat + highConsumptionCharge;
    
    if (totalFee <= 0 || !isFinite(totalFee)) {
      return res.status(400).json({ 
        message: "Invalid total fee calculation." 
      });
    }

    const MAX_PAYMENT_PER_CHUNK = 100000;
    let paymentChunks = [];
    
    if (totalFee > MAX_PAYMENT_PER_CHUNK) {
      const numberOfChunks = Math.ceil(totalFee / MAX_PAYMENT_PER_CHUNK);
      const baseChunkAmount = totalFee / numberOfChunks;
      
      let remaining = totalFee;
      for (let i = 0; i < numberOfChunks; i++) {
        let chunkAmount;
        if (i === numberOfChunks - 1) {
          chunkAmount = Math.round(remaining * 100) / 100;
        } else {
          chunkAmount = Math.round(baseChunkAmount * 100) / 100;
          remaining -= chunkAmount;
        }
        paymentChunks.push(chunkAmount);
      }
    } else {
      paymentChunks.push(Math.round(totalFee * 100) / 100);
    }

    const newMeterReading = new merterReading({
      photo: {
        secure_url: uploadPhoto.secure_url,
        public_id: uploadPhoto.public_id,
      },
      killowatRead: currentRead,
      monthlyUsage,
      energyTariff: energyTariff,
      serviceCharge: serviceCharge,
      vatRate: vatRate,
      vatAmount: vat,
      highConsumptionCharge: highConsumptionCharge,
      energyCharge: energyCharge,
      anomalyStatus: anomalyResult.anomalyStatus,
      paymentStatus: "Pending",
      fee: Math.round(totalFee * 100) / 100,
      paymentChunks,
      dateOfSubmission: formattedDate(),
      paymentMonth: paymentScheduleDetails._id,
      monthName: `${paymentScheduleDetails.yearAndMonth}`,
      customerId: customerId,
      calculationDetails: {
        previousReading: previousRead,
        currentReading: currentRead,
        consumption: monthlyUsage,
        tariffRate: energyTariff,
        vatPercentage: vatRate * 100,
        highConsumptionThreshold: HIGH_CONSUMPTION_THRESHOLD,
        highConsumptionRate: HIGH_CONSUMPTION_RATE * 100
      }
    });

    await newMeterReading.save();

    res.status(200).json({
      message: "Meter reading submitted successfully.",
      meterReadingresult: newMeterReading,
      calculationBreakdown: {
        consumption: monthlyUsage,
        energyCharge: energyCharge,
        serviceCharge: serviceCharge,
        vat: vat,
        highConsumptionCharge: highConsumptionCharge,
        totalFee: totalFee,
        paymentChunks: paymentChunks
      }
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
      .populate("paymentMonth");
    const nextMonthUsage = await handlePredictionRequest(req, res);

    return res.status(200).json({
      readings: lastReadings,
      prediction: nextMonthUsage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const myMeterReadings = async (req, res) => {
  try {
    const readings = await merterReading.find({ customerId: req.authUser.id });
    res.status(200).json(readings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error during reading submission" });
  }
};
export const getmeterbyId = async (req, res) => {
  try {
    const reading = await merterReading.findById(req.params.id);
    res.status(200).json(reading);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error during reading submission" });
  }
};

const generateTxRef = () => crypto.randomBytes(16).toString("hex");

export const payBill = async (req, res) => {
  try {
    const { rId, paymentMethod } = req.body;

    const reading = await merterReading.findById(rId).populate("paymentMonth");
    if (!reading) return res.status(404).json({ message: "Reading not found" });

    const txRef = generateTxRef();
    reading.txRef = txRef;
    reading.paymentStatus = "Pending";
    await reading.save();

    const placeholderEmail = `${txRef}@mailinator.com`;

    const chapaRes = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: Number(reading.fee),
        currency: "ETB",
        email: placeholderEmail,
        first_name: req.authUser?.name || "Customer",
        tx_ref: txRef,
        callback_url: `${process.env.BACKEND_URL}/customer/chapa-callback`,
        payment_type: paymentMethod,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (process.env.CHAPA_TEST_MODE === "true") {
      reading.paymentStatus = "Paid";
      await reading.save();
      await new customerPayments({
        meterReading: reading._id,
        customerId: reading.customerId,
        paymentMonth: reading.paymentMonth,
      }).save();
    }

    res.json({
      checkoutUrl: chapaRes.data.data.checkout_url,
      tx_ref: txRef,
      amount: reading.fee,
    });
  } catch (error) {
    console.error("Chapa init error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Payment initiation failed",
      chapaError: error.response?.data || error.message,
    });
  }
};

export const chapaCallback = async (req, res) => {
  try {
    const { tx_ref, trx_ref } = req.query;
    const ref = tx_ref || trx_ref;
    if (!ref) return res.sendStatus(400);

    const reading = await merterReading.findOne({ txRef: ref });
    if (!reading) return res.sendStatus(404);

    if (process.env.CHAPA_TEST_MODE === "true") {
      reading.paymentStatus = "Paid";
      await reading.save();

      await new customerPayments({
        meterReading: reading._id,
        customerId: reading.customerId,
        paymentMonth: reading.paymentMonth,
      }).save();

      return res.sendStatus(200);
    }

    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${ref}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      }
    );

    if (verifyRes.data.data.status === "success") {
      reading.paymentStatus = "Paid";
      await reading.save();

      await new customerPayments({
        meterReading: reading._id,
        customerId: reading.customerId,
        paymentMonth: reading.paymentMonth,
      }).save();
    }

    return res.json({
      checkoutUrl: "about:blank",
      tx_ref: ref,
      amount: reading.fee,
    });
  } catch (err) {
    console.error("Callback error", err);
    res.sendStatus(500);
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { txRef } = req.params;
    const reading = await merterReading.findOne({ txRef });

    if (!reading) {
      return res.status(404).json({
        status: "failed",
        message: "Transaction not found",
      });
    }

    return res.json({
      status: reading.paymentStatus.toLowerCase(),
      paymentStatus: reading.paymentStatus,
      amount: reading.fee,
      readingId: reading._id,
    });
  } catch (err) {
    console.error("Check payment status error", err);
    res.status(500).json({
      status: "failed",
      message: "Error checking payment status",
    });
  }
};

export const getPaidBills = async (req, res) => {
  try {
    const customerId = req.authUser.id;

    const paidReadings = await merterReading
      .find({ customerId, paymentStatus: "Paid" })
      .sort({ createdAt: -1 })
      .lean();

    const bills = paidReadings.map((r) => ({
      id: r._id,
      month: r.monthName || "Unknown",
      consumption: r.monthlyUsage,
      amount: r.fee,
      dueDate: r.dateOfSubmission,
      status: r.paymentStatus,
    }));

    res.status(200).json({ bills });
  } catch (error) {
    console.error("Error fetching paid bills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateTestPaymentStatus = async (req, res) => {
  try {
    if (process.env.CHAPA_TEST_MODE !== "true") {
      return res.status(400).json({ 
        message: "Test mode only endpoint" 
      });
    }

    const { readingId } = req.body;
    const reading = await merterReading.findById(readingId);
    
    if (!reading) {
      return res.status(404).json({ 
        message: "Reading not found" 
      });
    }

    reading.paymentStatus = "Paid";
    await reading.save();

    await new customerPayments({
      meterReading: reading._id,
      customerId: reading.customerId,
      paymentMonth: reading.paymentMonth,
    }).save();

    res.json({ 
      success: true, 
      paymentStatus: reading.paymentStatus 
    });
    
  } catch (error) {
    console.error("Test payment update error:", error);
    res.status(500).json({ 
      message: "Failed to update test payment" 
    });
  }
};
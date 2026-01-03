import { Customer } from "../models/CustomerModel.js";
import { officerAT } from "../models/OfficerActivityTracker.js";
import { Officer } from "../models/OfficerModel.js";
import { createAccountNumberForCustomer } from "../Util/accountNumberGeneratorUtil.js";
import { comparePassword, endcodePassword } from "../Util/passwordEncDec.js";
import { generateToken } from "../Util/tokenGenrator.js";
import { cloud } from "../Util/Cloundnary.js";
import { CustomerComplient } from "../models/CustomerComplient.js";
import { formattedDate } from "../Util/FormattedDate.js";
import { customerPayments } from "../models/Payments.js";
import { paymentSchedule } from "../models/PaymentSchedule.js";
import { merterReading } from "../models/MeterReading.js";
import { CustomerTariff } from "../models/Tariff.js";
import { extractKWAndMeterNo } from "../Util/photoAnalyzer.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

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
    const { regForm, tarif } = req.body;
    const existingCustomer = await Customer.findOne({
      meterReaderSN: regForm.meterReaderSN,
    });
    if (existingCustomer) {
      return res.status(400).json({
        message: `Meter Serial Number ${regForm.meterReaderSN} is already used`,
      });
    }

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
    const customerTariff = new CustomerTariff({
      customerId: save._id,
      energyTariff: tarif.energyTariff,
      serviceCharge: tarif.serviceCharge,
    });
    await customerTariff.save();

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
    console.error("Error in addCustomer:", error);
    res.status(500).json({ message: "Internal server error" });
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
      officerId: req.authUser.id,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
export const updateUsernameOrPassword = async (req, res) => {
  try {
    const { username, oldPass, newPass } = req.body;
    const id = req.authUser.id;

    const myProfile = await Officer.findById(id);
    if (!myProfile) return res.status(404).json({ message: "User not found" });

    const updates= {};

    if (username && username !== myProfile.username) {
      updates.username = username;
      await saveActivity(id, `Updated your username to ${username}`);
    } else {
      updates.username = myProfile.username;
    }

    if (oldPass && newPass) {
      const isMatch = await comparePassword(oldPass, myProfile.password);
      if (!isMatch)
        return res.status(400).json({ message: "Old password is incorrect" });

      updates.password = await endcodePassword(newPass);
      await saveActivity(id, "Updated your password");
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const result = await Officer.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      message: "Profile updated successfully",
      result: {
        _id: result._id,
        name: result.name,
        username: result.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


export const changeProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let officer = await Officer.findById(req.authUser.id);

    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const result = await cloud.uploader.upload(dataUri, {
      folder: "Officer-profile-pic",
      tags: [req.authUser.id, "profile_pic"],
    });

    if (officer.photo?.secure_url) {
      await cloud.uploader.destroy(officer.photo.public_id);
    }

    officer = await Officer.findByIdAndUpdate(
      req.authUser.id,
      {
        photo: {
          secure_url: result.secure_url,
          public_id: result.public_id,
        },
      },
      { new: true }
    );

    await saveActivity(req.authUser.id, "Updated your profile picture");

    res.status(200).json({
      message: "Profile updated successfully",
      photo: officer.photo,
    });
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
    const InProgress = complients.filter(
      (comp) => comp.status == "in-progress"
    ).length;
    const pendingComplients = complients.filter(
      (comp) => comp.status == "pending"
    ).length;
    const resolvedComplients = complients.filter(
      (comp) => comp.status == "resolved"
    ).length;

    if (complients.length <= 10) {
      return res.status(200).json({
        complients: complientCustomDto(complients),
        allComplients,
        InProgress,
        pendingComplients,
        resolvedComplients,
      });
    }

    let someComplients = [];

    for (let index = 0; index < 10; index++) {
      someComplients.push(complients[index]);
    }

    return res.status(200).json({
      someComplients: complientCustomDto(someComplients),
      allComplients,
      urgentComplients,
      pendingComplients,
      resolvedComplients,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
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

    return res
      .status(200)
      .json({ message: "Complient status updated successfully!!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkMissedMonths = async (req, res) => {
  try {
    const { customerId } = req.query;
    console.log(customerId);
    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const paidMeterReadings = await merterReading
      .find({ customerId, paymentStatus: "Paid" })
      .populate("paymentMonth")
      .exec();

    const paidMonthsSet = new Set();
    paidMeterReadings.forEach((reading) => {
      if (reading.paymentMonth?.yearAndMonth) {
        paidMonthsSet.add(reading.paymentMonth.yearAndMonth);
      }
    });

    const allScheduled = await paymentSchedule.find().sort({ yearAndMonth: 1 });

    const missedMonths = allScheduled.filter(
      (month) => !paidMonthsSet.has(month.yearAndMonth)
    );

    res.status(200).json({
      customerId,
      missedCount: missedMonths.length,
      missedMonths,
    });
  } catch (error) {
    console.error("Check Missed Months Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const newSchedule = new paymentSchedule(req.body);
    await newSchedule.save();
    await saveActivity(
      req.authUser.id,
      `Created new payment schedule ${newSchedule.yearAndMonth}`
    );
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const closePaymentSchedule = async (req, res) => {
  try {
    const sch = await paymentSchedule.findByIdAndUpdate(
      req.body.id,
      { isOpen: false },
      { new: true }
    );

    if (!sch) {
      return res
        .status(404)
        .json({ success: false, message: "Schedule not found" });
    }

    await saveActivity(
      req.authUser.id,
      `Closed payment schedule ${sch.yearAndMonth}`
    );

    return res.status(200).json({ success: true, data: sch });
  } catch (error) {
    console.error("Failed to close schedule:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllSchedule = async (req, res) => {
  try {
    const schedules = await paymentSchedule.find();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const manualMeterReadingAndPayment = async (req, res) => {
  try {
    const { cId, months, fine = 0 } = req.body;
    const photo = req.file;

    if (!photo)
      return res.status(400).json({ message: "Meter image required" });
    if (!cId) return res.status(400).json({ message: "Customer ID required" });

    const parsedMonths = JSON.parse(months);
    if (!Array.isArray(parsedMonths) || parsedMonths.length === 0) {
      return res.status(400).json({ message: "Invalid months" });
    }

    // Convert image to base64 and extract meter data
    const base64 = Buffer.from(photo.buffer).toString("base64");
    const resp = await extractKWAndMeterNo(base64, photo.mimetype);

    const customer = await Customer.findById(cId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    if (resp.meterNo !== customer.meterReaderSN) {
      return res.status(403).json({ message: "Meter mismatch" });
    }

    // Upload image to cloud
    const upload = await cloud.uploader.upload(
      `data:${photo.mimetype};base64,${base64}`,
      { folder: "Meter-Readings" }
    );

    const lastReading = await merterReading
      .findOne({ customerId: cId })
      .sort({ createdAt: -1 });
    const previousRead = lastReading ? lastReading.killowatRead : 0;

    const monthlyUsage = resp.kilowatt - previousRead;

    const tariff = await CustomerTariff.findOne({ customerId: cId });
    if (!tariff) return res.status(400).json({ message: "Tariff not found" });

    const energyTariff = Number(tariff.energyTariff);
    const serviceCharge = Number(tariff.serviceCharge);
    const energyCharge = energyTariff * monthlyUsage;
    const vatRate = 0.15;

    const highConsumptionCharge = monthlyUsage > 200 ? energyCharge * 0.005 : 0;

    let totalFee =
      energyCharge +
      serviceCharge +
      energyCharge * vatRate +
      highConsumptionCharge +
      Number(fine);
    totalFee = Math.min(totalFee, 10000);

    totalFee = isNaN(totalFee) ? 0 : totalFee;

    // Split into payment chunks if needed
    const MAX_PAYMENT_PER_CHUNK = 100000;
    const paymentChunks = [];
    const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
    let total = round2(totalFee);

    if (total > MAX_PAYMENT_PER_CHUNK) {
      const numChunks = Math.ceil(total / MAX_PAYMENT_PER_CHUNK);
      const baseChunk = round2(total / numChunks);
      let remaining = total;

      for (let i = 0; i < numChunks; i++) {
        const chunk = i === numChunks - 1 ? round2(remaining) : baseChunk;
        paymentChunks.push(chunk);
        remaining = round2(remaining - chunk);
      }
    } else {
      paymentChunks.push(round2(total));
    }

    // Save readings and payments
    const readings = [];
    const currentRead = previousRead + monthlyUsage;

    for (let i = 0; i < parsedMonths.length; i++) {
      const m = parsedMonths[i];
      const reading = await merterReading.create({
        photo: {
          secure_url: upload.secure_url,
          public_id: upload.public_id,
        },
        killowatRead: previousRead + monthlyUsage * (i + 1),
        monthlyUsage,
        anomalyStatus: "Normal",
        paymentStatus: "Paid",
        fee: round2(totalFee),
        dateOfSubmission: formattedDate(),
        paymentMonth: m._id,
        monthName: m.monthName,
        customerId: cId,
        officerId: req.authUser.id,
        calculationDetails: {
          previousReading: previousRead,
          currentReading: currentRead,
          consumption: monthlyUsage,
          tariffRate: energyTariff,
          vatPercentage: vatRate * 100,
        },
      });

      await customerPayments.create({
        meterReading: reading._id,
        customerId: cId,
        paymentMonth: m._id,
        monthName: m.monthName,
      });

      readings.push(reading);
    }

    await saveActivity(
      req.authUser.id,
      `Manual payment for ${customer.accountNumber}`
    );

    res.status(200).json({
      message: "Payment successful",
      summary: {
        previousRead,
        currentRead,
        totalUsage: monthlyUsage,
        totalBill: round2(totalFee),
        months: parsedMonths.length,
        paymentChunks,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchMeterReadings = async (req, res) => {
  try {
    const { value } = req.query;
    const customers = await Customer.find({
      $or: [
        { meterReaderSN: RegExp(value, "i") },
        { accountNumber: RegExp(value, "i") },
      ],
    });
    if (!customers) {
      res.status(200).json({ message: "No account or meter reading found" });
    }
    const customerId = customers.map((c) => c._id);

    const meterReadings = await merterReading.find({
      customerId: { $in: customerId },
    });
    res.status(200).json(meterReadings);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeMeterReadingStatus = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await merterReading
      .findByIdAndUpdate(
        id,
        {
          anomalyStatus: "Normal",
        },
        { new: true }
      )
      .populate("customerId", "paymentMonth");
    await saveActivity(
      req.authUser.id,
      `Changed reading status to Normal of  ${result.customerId.accountNumber} 
      account ${result.paymentMonth.yearAndMonth}`
    );
    res.status(200).json({ message: "Status updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllMeterReadings = async (req, res) => {
  try {
    const meterReadings = await merterReading
      .find()
      .populate("customerId", "name accountNumber")
      .populate("paymentMonth", "yearAndMonth");

    res.status(200).json(meterReadings);
  } catch (error) {
    console.error("Failed to fetch meter readings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const payMissedPaymentMonths = async (req, res) => {
  try {
    const reading = merterReading
      .findById(rId)
      .populate("customerId", "paymentMonth");
    const recordPaymet = new customerPayments({
      meterReading: reading._id,
      customerId: reading.customerId._id,
      paymentMonth: reading.paymentMonth._id,
    });

    await merterReading.findByIdAndUpdate(reading._id, {
      paymentStatus: "Paid",
    });
    await recordPaymet.save();
    await saveActivity(
      req.authUser.id,
      `Changed reading status to Normal of  ${result.customerId.accountNumber} 
      account ${result.paymentMonth.yearAndMonth}`
    );
    res.status(200).json({ message: "Paid sucessfully" });
  } catch (error) {}
};
async function saveActivity(id, activity) {
  const OfficerActivity = new officerAT({
    officerId: id,
    activity: activity,
    date: formattedDate(),
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
export const getOfficerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const allComplaints = await CustomerComplient.find();
    const reportsGenerated = allComplaints.length;
    const pendingComplaints = allComplaints.filter(
      (c) => c.status === "pending"
    ).length;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const readingsToday = await officerAT.countDocuments({
      date: { $gte: startOfDay.toISOString() },
    });

    res.status(200).json({
      customersRegistered: totalCustomers,
      readingsToday,
      reportsGenerated,
      pendingComplaints,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, department, userGroup } = req.body;
    const { start, end } = getDateRange(startDate, endDate);

    let report;

    switch (reportType) {
      case "officer-report":
        report = await officerReport(start, end, department, userGroup);
        break;

      case "meter-readings":
        report = await meterReadingsReport(start, end);
        break;

      case "revenue":
        report = await revenueReport(start, end);
        break;

      case "customer-complaints":
        report = await complaintsReport(start, end);
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({
      reportType,
      generatedBy: req.authUser.id,
      generatedAt: new Date(),
      filters: { startDate, endDate, department, userGroup },
      data: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

const officerReport = async (start, end, department, role) => {
  const officers = await Officer.find({
    ...(department !== "all" && { department }),
    ...(role !== "all" && { role }),
  });

  const activities = await officerAT
    .find({
      officerId: { $in: officers.map((o) => o._id) },
      date: { $gte: start, $lte: end },
    })
    .populate("officerId", "name department");

  return {
    summary: {
      totalOfficers: officers.length,
      totalActivities: activities.length,
    },
    activities,
  };
};
const meterReadingsReport = async (start, end) => {
  const readings = await merterReading
    .find({
      createdAt: { $gte: start, $lte: end },
    })
    .populate("customerId", "name accountNumber")
    .populate("officerId", "name");

  return {
    totalReadings: readings.length,
    readings,
  };
};

const revenueReport = async (start, end) => {
  const payments = await customerPayments.find({
    createdAt: { $gte: start, $lte: end },
  });

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return {
    totalPayments: payments.length,
    totalRevenue,
    payments,
  };
};
const complaintsReport = async (start, end) => {
  try {
    const complaints = await CustomerComplient.find({
      date: {
        $gte: start.toISOString(),
        $lte: end.toISOString(),
      },
    })
      .populate("resolvedBy", "name")
      .sort({ date: -1 });
    const resolved = complaints.filter(
      (c) => c.status && c.status.toLowerCase() === "resolved"
    ).length;

    const pending = complaints.filter(
      (c) =>
        c.status &&
        (c.status.toLowerCase() === "pending" ||
          c.status.toLowerCase() === "pending")
    ).length;

    const inProgress = complaints.filter(
      (c) => c.status && c.status.toLowerCase() === "in-progress"
    ).length;

    const closed = complaints.filter(
      (c) => c.status && c.status.toLowerCase() === "closed"
    ).length;

    return {
      totalComplaints: complaints.length,
      resolved,
      pending,
      inProgress,
      closed,
      complaints: complaints.map((complaint) => ({
        id: complaint._id,
        customerName: complaint.customerName,
        customerAccNumber: complaint.customerAccNumber,
        subject: complaint.subject,
        date: complaint.date,
        status: complaint.status,
        description: complaint.description,
        resolvedBy: complaint.resolvedBy?.name || "",
      })),
    };
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return {
      totalComplaints: 0,
      resolved: 0,
      pending: 0,
      inProgress: 0,
      closed: 0,
      complaints: [],
    };
  }
};

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

export const addTariff = async (req, res) => {
  try {
    const newTariff = new CustomerTariff(req.body);
    const result = await newTariff.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTarifss = async (req, res) => {
  try {
    const tariff = await CustomerTariff.findOne();
    res.status(200).json(tariff);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTariff = async (req, res) => {
  try {
    const { tId, block, value } = req.body;
    const updateT = await CustomerTariff.findByIdAndUpdate(
      tId,
      { [block]: value },
      { new: true }
    );
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
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
    // const customerTariff = new CustomerTariff({
    //   customerId: save._id,
    //   energyTariff: tarif.energyTariff,
    //   serviceCharge: tarif.serviceCharge,
    // });
    //await customerTariff.save();

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
      return res.status(200).json({
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
    const { yearAndMonth } = req.body;

    // 1️⃣ Validate input
    if (!yearAndMonth) {
      return res.status(400).json({ message: "yearAndMonth is required" });
    }

    // 2️⃣ Check if any schedule is currently open
    const isAnyOpenSchedule = await paymentSchedule.findOne({ isOpen: true });
    if (isAnyOpenSchedule) {
      return res
        .status(400)
        .json({ message: "There is already an open schedule on this month", isAnyOpenSchedule });
    }

    const existsForMonth = await paymentSchedule.findOne({ yearAndMonth });
    if (existsForMonth) {
      return res
        .status(400)
        .json({ message: "A schedule already exists for this month", existsForMonth });
    }

    const newSchedule = new paymentSchedule(req.body);
    await newSchedule.save();

    await saveActivity(
      req.authUser.id,
      `Created new payment schedule ${newSchedule.yearAndMonth}`
    );

    return res.status(201).json(newSchedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    const photo = req.file;
    const { cId, months, fine = 0 } = req.body;

    if (!photo) {
      return res.status(400).json({ message: "Meter image is required" });
    }

    if (!cId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // Parse months and validate
    let parsedMonths;
    try {
      parsedMonths = JSON.parse(months);
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid months format" });
    }

    if (
      !parsedMonths ||
      !Array.isArray(parsedMonths) ||
      parsedMonths.length === 0
    ) {
      return res.status(400).json({ message: "No valid months provided" });
    }

    // Validate each month entry
    for (const month of parsedMonths) {
      if (!month || !month._id || !month.monthName) {
        return res.status(400).json({
          message: "Invalid month data. Each month must have _id and monthName",
        });
      }
    }

    const base64 = Buffer.from(photo.buffer).toString("base64");
    const mimeType = photo.mimetype;

    const dataUri = `data:${mimeType};base64,${base64}`;

    const resp = await extractKWAndMeterNo(base64, mimeType);
    const findAccount = await Customer.findById(cId);
    if (!findAccount) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (resp.meterNo != findAccount.meterReaderSN) {
      return res.status(403).json({
        message:
          "This meter is not your meter. Please insert correct meter image",
      });
    }

    const uploadImage = await cloud.uploader.upload(dataUri, {
      folder: "Meter-Readings",
      tags: [req.authUser.id, "meter-readings"],
    });

    const lastReading = await merterReading
      .findOne({ customerId: cId })
      .sort({ createdAt: -1 });

    const previousRead = lastReading ? lastReading.killowatRead : 0;
    const monthlyUsage = resp.kilowatt - previousRead;
    const eachMonthUsage = monthlyUsage / parsedMonths.length;

    const myTariff = await CustomerTariff.findOne();
    if (!myTariff) {
      return res.status(400).json({ message: "Tariff not found for customer" });
    }
    let energyTariff = Number(tariffDetails[0].block1);

    if (monthlyUsage > 50 && monthlyUsage <= 100) {
      energyTariff = Number(tariffDetails[0].block2);
    } else if (monthlyUsage > 100 && monthlyUsage <= 200) {
      energyTariff = Number(tariffDetails[0].block3);
    } else if (monthlyUsage > 200 && monthlyUsage <= 300) {
      energyTariff = Number(tariffDetails[0].block4);
    } else if (monthlyUsage > 300 && monthlyUsage <= 400) {
      energyTariff = Number(tariffDetails[0].block5);
    } else if (monthlyUsage > 400 && monthlyUsage < 500) {
      energyTariff = Number(tariffDetails[0].block6);
    } else {
      energyTariff = Number(tariffDetails[0].block1);
    }

    let serviceCharge = Number(tariffDetails[0].domesticUnder50);
    if (findAccount.purpose == "Domestic" && monthlyUsage > 50) {
      serviceCharge = Number(tariffDetails[0].domesticAbove50);
    }
    if (findAccount.purpose != "Domestic") {
      serviceCharge = Number(tariffDetails[0].allUsage);
    }

    const vatRate = 0.15;

    let totalPayment = 0;
    const breakdowns = [];
    const meterReadings = [];

    for (let index = 0; index < parsedMonths.length; index++) {
      const currentMonth = parsedMonths[index];

      const energyCharge = energyTariff * eachMonthUsage;
      const subtotal = energyCharge + serviceCharge + Number(fine);
      const vatAmount = subtotal * vatRate;
      const totalFee = subtotal + vatAmount;

      const newReading = new merterReading({
        photo: {
          secure_url: uploadImage.secure_url,
          public_id: uploadImage.public_id,
        },
        killowatRead: previousRead + eachMonthUsage * (index + 1),
        monthlyUsage: eachMonthUsage,
        anomalyStatus: "Normal",
        paymentStatus: "Paid",
        fee: totalFee,
        dateOfSubmission: formattedDate(),
        paymentMonth: currentMonth._id,
        monthName: currentMonth.monthName,
        customerId: cId,
        officerId: req.authUser.id,
        calculationDetails: {
          previousReading: previousRead + eachMonthUsage * index,
          currentReading: previousRead + eachMonthUsage * (index + 1),
          consumption: eachMonthUsage,
          energyCharge,
          serviceCharge,
          fine: Number(fine),
          vatRate: vatRate * 100,
          vatAmount,
          totalFee,
        },
      });

      const result = await newReading.save();

      await customerPayments.create({
        meterReading: result._id,
        customerId: cId,
        paymentMonth: currentMonth._id,
        monthName: currentMonth.monthName,
      });

      totalPayment += totalFee;
      breakdowns.push(newReading.calculationDetails);
      meterReadings.push(result._id);
    }

    await saveActivity(
      req.authUser.id,
      `Manually paid ${findAccount.accountNumber} for ${parsedMonths.length} months`
    );

    res.status(200).json({
      message: "Manual payment processed successfully",
      totalPayment,
      meterReadingresult: {
        kilowatt: resp.kilowatt,
        monthlyUsage: eachMonthUsage,
        totalMonths: parsedMonths.length,
      },
      calculationBreakdown: breakdowns,
      processedMonths: parsedMonths.map((m) => m.monthName),
    });
  } catch (error) {
    console.error("Manual Payment Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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
      // Uncomment if needed
      // case "officer-report":
      //   report = await officerReport(start, end, department, userGroup);
      //   break;

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
      generatedBy:req.authUser?.username || req.authUser?.name  || "Unknown",
      generatedAt: new Date(),
      filters: { startDate, endDate, department, userGroup },
      data: report,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};



const meterReadingsReport = async (start, end) => {
  const readings = await merterReading
    .find({ createdAt: { $gte: start, $lte: end } })
    .populate("customerId", "name accountNumber")
    .sort({ createdAt: -1 });

  return {
    totalReadings: readings.length,
    readings,
  };
};



export const revenueReport = async (start, end) => {
  const startDate = new Date(start);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setUTCHours(23, 59, 59, 999);

  const readings = await merterReading
    .find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
    .populate("customerId", "name accountNumber depositBirr")
    .lean();

  let totalRevenue = 0;
  const uniqueCustomers = new Map(); 

  const payments = readings.map((r) => {
    const isPaid = r.paymentStatus === "Paid";
    const fee = r.fee || 0;

    if (isPaid) {
      totalRevenue += fee;
    }

    // track unique customers to sum their deposits correctly
    if (r.customerId && r.customerId._id) {
      uniqueCustomers.set(r.customerId._id.toString(), r.customerId.depositBirr || 0);
    }

    // Map to the format your React Frontend Table expects
    return {
      id: r._id,
      customer: r.customerId?.name || "Unknown",
      accountNumber: r.customerId?.accountNumber || "N/A",
      amount: fee,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
      status: r.paymentStatus,
      method: "Electronic/Cash", // Default label
    };
  });

  // Calculate total deposited money from the unique set of customers
  const totalDepositedMoney = Array.from(uniqueCustomers.values()).reduce(
    (sum, val) => sum + val,
    0
  );

  const paidReadings = payments.filter((p) => p.status === "Paid");

  return {
    reportType: "revenue",
    generatedAt: new Date().toISOString(),
    // Summary data for the top cards in React
    summary: {
      totalPayments: paidReadings.length,
      totalRevenue: totalRevenue,
      totalDepositedMoney: totalDepositedMoney,
      unpaidPaymentsCount: payments.length - paidReadings.length,
    },
    // Detailed data for the table
    data: {
      payments: payments, 
    },
  };
};

const complaintsReport = async (start, end) => {
  try {
    const complaints = await CustomerComplient.find({
      date: { $gte: start, $lte: end },
    })
      .populate("resolvedBy", "name")
      .sort({ date: -1 });

    const statusCount = complaints.reduce(
      (acc, c) => {
        const status = c.status?.toLowerCase();
        if (status === "resolved") acc.resolved++;
        else if (status === "pending") acc.pending++;
        else if (status === "in-progress") acc.inProgress++;
        else if (status === "closed") acc.closed++;
        return acc;
      },
      { resolved: 0, pending: 0, inProgress: 0, closed: 0 }
    );

    return {
      totalComplaints: complaints.length,
      ...statusCount,
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

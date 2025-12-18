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

export const checkMissedMonthes = async (req, res) => {
  try {
    const { id } = req.query;

    const lastPayment = await customerPayments
      .findOne({ customerId: id })
      .populate("paymentMonth")
      .sort({ createdAt: -1 });

    let lastPaidYearMonth = null;

    if (lastPayment) {
      lastPaidYearMonth = lastPayment.paymentMonth.yearAndMonth;
    }

    const query = lastPaidYearMonth
      ? { yearAndMonth: { $gt: lastPaidYearMonth } }
      : {};

    const missedMonths = await paymentSchedule
      .find(query)
      .sort({ yearAndMonth: 1 });

    res.status(200).json({
      count: missedMonths.length,
      missedMonths,
    });
  } catch (error) {
    console.error(error);
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
    await saveActivity(
      req.authUser.id,
      `Closed payment schedule ${sch.yearAndMonth}`
    );
  } catch (error) {}
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

    if (!parsedMonths || !Array.isArray(parsedMonths) || parsedMonths.length === 0) {
      return res.status(400).json({ message: "No valid months provided" });
    }

    // Validate each month entry
    for (const month of parsedMonths) {
      if (!month || !month._id || !month.monthName) {
        return res.status(400).json({ 
          message: "Invalid month data. Each month must have _id and monthName" 
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
        message: "This meter is not your meter. Please insert correct meter image",
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

    const myTariff = await CustomerTariff.findOne({ customerId: cId });
    if (!myTariff) {
      return res.status(400).json({ message: "Tariff not found for customer" });
    }

    const energyTariff = Number(myTariff.energyTariff) || 0;
    const serviceCharge = Number(myTariff.serviceCharge) || 0;
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
        paymentMonth: currentMonth._id, // Make sure this is a valid ObjectId
        monthName: currentMonth.monthName, // Make sure monthName is included
        customerId: cId,
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
      processedMonths: parsedMonths.map(m => m.monthName),
    });
  } catch (error) {
    console.error("Manual Payment Error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
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
    const meterReadings = await merterReading.find();
    res.status(200).json(meterReadings);
  } catch (error) {
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
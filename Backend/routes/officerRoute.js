import express from "express";
import {
  addCustomer,
  changeProfilePicture,
  checkMissedMonths,
  closePaymentSchedule,
  createSchedule,
  customerComplientInformations,
  getCustomer,
  manualMeterReadingAndPayment,
  myActivities,
  officerLogin,
  officerLogout,
  searchCustomerComplients,
  searchMyActivities,
  updateComplientStatus,
  updateNameOrEmail,
  updateUsernameOrPassword,
  getOfficerStats,
  getAllSchedule,
  changeMeterReadingStatus,
  searchMeterReadings,
  getAllMeterReadings,
  payMissedPaymentMonths,
  generateReport,
  meterReadingAndRevenueReport,
  getYearSchedules,
  addTariff,
  getTarifss,
  updateTariff,
} from "../controllers/officerController.js";

import { verifyToken } from "../Util/tokenVerify.js";
import { searchCustomer } from "../controllers/adminController.js";
import { upload } from "../middleware/multer.js";
const officerRouter = express.Router();

officerRouter.post("/add-customer", verifyToken, addCustomer);
officerRouter.post("/login", officerLogin);
officerRouter.get("/my-activities", verifyToken, myActivities);
officerRouter.post("/search-my-activities", verifyToken, searchMyActivities);
officerRouter.post("/search-customer", verifyToken, searchCustomer);
officerRouter.get("/get-customers", verifyToken, getCustomer);
officerRouter.post("/officer-logout", verifyToken, officerLogout);
officerRouter.post(
  "/change-profile-pic",
  verifyToken,
  upload.single("image"),

  changeProfilePicture
);

officerRouter.post("/update-name-or-email", verifyToken, updateNameOrEmail);
officerRouter.post("/update-up", verifyToken, updateUsernameOrPassword);

officerRouter.post("/create-schedule", verifyToken, createSchedule);
officerRouter.post("/close-schedule", verifyToken, closePaymentSchedule);
officerRouter.get("/get-schedule", verifyToken, getAllSchedule);

officerRouter.get(
  "/customer-complient-infos",
  verifyToken,
  customerComplientInformations
);
officerRouter.post(
  "/search-customer-complients",
  verifyToken,
  searchCustomerComplients
);
// // New Updated Report
// officerRouter.post(
//   "/meter-reading-report",
//   verifyToken,
//   meterReadingAndRevenueReport
// );
// New Updated functionality for Report
// officerRouter.post("/get-exist-schedules", verifyToken, existsForMonth);
officerRouter.put(
  "/update-complient-status",
  verifyToken,
  updateComplientStatus
);
//Tarif routes
officerRouter.post("/add-tariff", verifyToken, addTariff);
officerRouter.get("/get-tariff", verifyToken, getTarifss);
officerRouter.put("/update-tariff", verifyToken, updateTariff);

officerRouter.get("/get-missed-payments", verifyToken, checkMissedMonths);
officerRouter.post("/pay-missed-payments", verifyToken, payMissedPaymentMonths);
officerRouter.post("/update-comp-status", verifyToken, updateComplientStatus);
officerRouter.get("/get-officer-stats", verifyToken, getOfficerStats);
officerRouter.post(
  "/change-reading-status",
  verifyToken,
  changeMeterReadingStatus
);
officerRouter.get("/search-meter-readings", verifyToken, searchMeterReadings);
officerRouter.get("/get-all-meter-readings", verifyToken, getAllMeterReadings);
officerRouter.post(
  "/pay-manualy",
  verifyToken,
  upload.single("photo"),
  manualMeterReadingAndPayment
);
officerRouter.post("/reports/generate", verifyToken, generateReport);

export default officerRouter;

import express from "express";
import {
  addCustomer,
  changeProfilePicture,
  checkMissedMonthes,
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
} from "../controllers/officerController.js";

import { verifyToken } from "../Util/tokenVerify.js";
import { searchCustomer } from "../controllers/adminController.js";
import { upload } from "../middleware/multer.js";
const officerRouter = express.Router();

officerRouter.post("/add-customer", verifyToken, addCustomer);
officerRouter.post("/login", officerLogin);
officerRouter.get("/my-activities", verifyToken, myActivities);
officerRouter.get("/search-my-activities", verifyToken, searchMyActivities);
officerRouter.post("/search-customer", verifyToken, searchCustomer);
officerRouter.get("/get-customers", verifyToken, getCustomer);
officerRouter.post("/officer-logout", verifyToken, officerLogout);
officerRouter.post(
  "/change-profile-pic",
  upload.single("image"),
  verifyToken,
  changeProfilePicture
);

officerRouter.post("/update-name-or-email", verifyToken, updateNameOrEmail);
officerRouter.post("/update-up", verifyToken, updateUsernameOrPassword);

officerRouter.post("/create-schedule", verifyToken, createSchedule);
officerRouter.post("/close-schedule", verifyToken, closePaymentSchedule);

officerRouter.post("/pay-manualy", verifyToken, manualMeterReadingAndPayment);
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
officerRouter.put(
  "/update-complient-status",
  verifyToken,
  updateComplientStatus
);
officerRouter.get("/get-missed-payments", verifyToken, checkMissedMonthes);
officerRouter.post("/update-comp-status", verifyToken, updateComplientStatus);
officerRouter.get("/get-officer-stats", verifyToken, getOfficerStats);

export default officerRouter;

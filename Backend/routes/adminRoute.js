import express from "express";
import {
  activateDeactivateOfficer,
  adminLogin,
  createAdmin,
  customerResetPassword,
  officerResetPassword,
  searchOfficer,
  updateName,
  createOfficer,
  getOfficerStats,
  updateUsernameOrPassword,
} from "../controllers/adminController.js";
import { verifyToken } from "../Util/tokenVerify.js";
import {getSystemActivities} from "../controllers/systemActivityController.js"

const adminRouter = express.Router();

adminRouter.post("/add-admin", verifyToken, createAdmin);
adminRouter.get("/search-officer", verifyToken, searchOfficer);
adminRouter.post("/create-officer", verifyToken, createOfficer);
adminRouter.post("/ad-officer", verifyToken, activateDeactivateOfficer);
adminRouter.post("/update-name", verifyToken, updateName);
adminRouter.post("/update-up", verifyToken, updateUsernameOrPassword);
adminRouter.post("/orp", verifyToken, officerResetPassword);
adminRouter.post("/crp", verifyToken, customerResetPassword);
adminRouter.post("/login", adminLogin);
adminRouter.get("/officers/stats",getOfficerStats)
adminRouter.get("/system-activities", verifyToken, getSystemActivities); 

export default adminRouter;

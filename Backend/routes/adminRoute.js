import express from "express";
import {
  activateDeactivateCustomer,
  activateDeactivateOfficer,
  adminLogin,
  createAdmin,
  createOfficer,
  customerInformationAndList,
  customerResetPassword,
  myActivities,
  officerResetPassword,
  officersInformationAndList,
  searchCustomer,
  searchOfficer,
  updateName,
  updateUsernameOrPassword,
} from "../controllers/adminController.js";
import { verifyToken } from "../Util/tokenVerify.js";

const adminRouter = express.Router();

adminRouter.post("/add-admin", createAdmin);
adminRouter.get("/search-officer", verifyToken, searchOfficer);
adminRouter.post("/search-customer", verifyToken, searchCustomer);
adminRouter.post("/ad-officer", verifyToken, activateDeactivateOfficer);
adminRouter.post("/update-name", verifyToken, updateName);
adminRouter.post("/update-up", verifyToken, updateUsernameOrPassword);
adminRouter.post("/orp", verifyToken, officerResetPassword);
adminRouter.post("/crp", verifyToken, customerResetPassword);
adminRouter.post("/add-officer", verifyToken, createOfficer);
adminRouter.post("/login", adminLogin);
adminRouter.get("/my-activities", verifyToken, myActivities);
adminRouter.get("/customer-info", verifyToken, customerInformationAndList);
adminRouter.get("/officer-info", verifyToken, officersInformationAndList);

adminRouter.post("/ad-customer", verifyToken, activateDeactivateCustomer);

export default adminRouter;

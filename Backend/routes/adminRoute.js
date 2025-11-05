import express from "express";
import {
  activateDeactivateOfficer,
  adminLogin,
  createAdmin,
  createOfficer,
  customerResetPassword,
  officerResetPassword,
  searchCustomer,
  searchOfficer,
  updateName,
  updateUsernameOrPassword,
} from "../controllers/adminController.js";
import { verifyToken } from "../Util/tokenVerify.js";

const adminRouter = express.Router();

adminRouter.post("/add-admin", verifyToken, createAdmin);
adminRouter.post("/search-officer", verifyToken, searchOfficer);
adminRouter.post("/search-customer", verifyToken, searchCustomer);
adminRouter.post("/ad-officer", verifyToken, activateDeactivateOfficer);
adminRouter.post("/update-name", verifyToken, updateName);
adminRouter.post("/update-up", verifyToken, updateUsernameOrPassword);
adminRouter.post("/orp", verifyToken, officerResetPassword);
adminRouter.post("/crp", verifyToken, customerResetPassword);
adminRouter.post("/add-officer", verifyToken, createOfficer);
adminRouter.post("/login", adminLogin);

export default adminRouter;

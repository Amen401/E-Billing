import express from "express";
import {
  addCustomer,
  changeProfilePicture,
  customerComplientInformations,
  getCustomer,
  myActivities,
  officerLogin,
  officerLogout,
  searchCustomerComplients,
  searchMyActivities,
  updateComplientStatus,
  updateNameOrEmail,
  updateUsernameOrPassword,
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
  verifyToken,
  upload.single("image"),
  changeProfilePicture
);
officerRouter.post("/update-name-or-email", verifyToken, updateNameOrEmail);
officerRouter.post("/update-up", verifyToken, updateUsernameOrPassword);
officerRouter.get(
  "/search-customer-comp",
  verifyToken,
  searchCustomerComplients
);
officerRouter.get(
  "/get-customer-comp-info",
  verifyToken,
  customerComplientInformations
);
officerRouter.post("/update-comp-status", verifyToken, updateComplientStatus);

export default officerRouter;

import express from "express";
import {
  addCustomer,
  myActivities,
  officerLogin,
  searchMyActivities,
} from "../controllers/officerController.js";

import { verifyToken } from "../Util/tokenVerify.js";
import { searchCustomer } from "../controllers/adminController.js";

const officerRouter = express.Router();

officerRouter.post("/add-customer", verifyToken, addCustomer);
officerRouter.post("/login", officerLogin);
officerRouter.get("/my-activities", verifyToken, myActivities);
officerRouter.get("/search-my-activities", verifyToken, searchMyActivities);
adminRouter.post("/search-customer", verifyToken, searchCustomer);

export default officerRouter;

import express from "express";
import {
  addCustomer,
  customerLogin,
} from "../controllers/customerController.js";
import { verifyToken } from "../Util/tokenVerify.js";

const customerRouter = express.Router();

customerRouter.post("/add-customer", verifyToken, addCustomer);
customerRouter.post("/login", customerLogin);

export default customerRouter;

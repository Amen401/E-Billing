import express from "express";
import {
  changePassword,
  customerLogin,
} from "../controllers/customerController.js";
import { verifyToken } from "../Util/tokenVerify.js";

const customerRouter = express.Router();

customerRouter.post("/login", customerLogin);
customerRouter.post("/update-password", verifyToken, changePassword);

export default customerRouter;

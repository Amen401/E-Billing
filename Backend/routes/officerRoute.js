import express from "express";
import { officerLogin } from "../controllers/officerController.js";
import { addCustomer } from "../controllers/customerController.js";
import { verifyToken } from "../Util/tokenVerify.js";

const officerRouter = express.Router();

officerRouter.post("/add-customer", verifyToken, addCustomer);
officerRouter.post("/login", officerLogin);

export default officerRouter;

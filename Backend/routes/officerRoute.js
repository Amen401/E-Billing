import express from "express";
import { createOfficer } from "../controllers/officerController.js";
import { addCustomer } from "../controllers/customerController.js";

const officerRouter = express.Router();

officerRouter.post("/add-officer", createOfficer);
officerRouter.post("/add-customer", addCustomer);

export default officerRouter;

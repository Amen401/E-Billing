import express from "express";
import { customerLogin } from "../controllers/customerController.js";
import { verifyToken } from "../Util/tokenVerify.js";

const customerRouter = express.Router();

customerRouter.post("/login", customerLogin);

export default customerRouter;

import express from "express";
import {
  changePassword,
  customerLogin,
  myComplains,
  searchMyComplain,
  writeComplain,
} from "../controllers/customerController.js";
import { verifyToken } from "../Util/tokenVerify.js";

const customerRouter = express.Router();

customerRouter.post("/login", customerLogin);
customerRouter.post("/update-password", verifyToken, changePassword);
customerRouter.post("/write-complain", verifyToken, writeComplain);
customerRouter.get("/search-my-complain", verifyToken, searchMyComplain);
customerRouter.get("/my-complain", verifyToken, myComplains);

export default customerRouter;

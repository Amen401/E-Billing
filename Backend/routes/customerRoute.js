import express from "express";
import {
  changePassword,
  customerLogin,
  myComplains,
  myMeterReadings,
  myMonthlyUsageAnlysis,
  searchMyComplain,
  submitReading,
  writeComplain,
  payBill,
  checkPaymentStatus,
  chapaCallback,
  getPaidBills,
  getmeterbyId,
  updateTestPaymentStatus
} from "../controllers/customerController.js";
import { verifyToken } from "../Util/tokenVerify.js";
import { upload } from "../middleware/multer.js";

const customerRouter = express.Router();

customerRouter.post("/login", customerLogin);
customerRouter.post("/update-password", verifyToken, changePassword);
customerRouter.post("/write-complain", verifyToken, writeComplain);
customerRouter.get("/search-my-complain", verifyToken, searchMyComplain);
customerRouter.get("/my-complain", verifyToken, myComplains);
customerRouter.get(
  "/my-monthly-usage-analysis",
  verifyToken,
  myMonthlyUsageAnlysis
);
customerRouter.get("/my-meter-readings", verifyToken, myMeterReadings);
customerRouter.post(
  "/submit-reading",
  verifyToken,
  upload.single("image"),
  submitReading
);

customerRouter.post("/pay-bill", verifyToken, payBill);

customerRouter.get("/payment-status/:txRef", verifyToken, checkPaymentStatus);
customerRouter.post('/test-payment', updateTestPaymentStatus);
customerRouter.get("/chapa-callback", chapaCallback);
customerRouter.get("/paid-bill", verifyToken, getPaidBills);

customerRouter.get("/meter-by-id/:id",verifyToken,getmeterbyId);

export default customerRouter;

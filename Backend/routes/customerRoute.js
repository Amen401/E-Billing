import express from "express";
import {
  changePassword,
  customerLogin,
  myComplains,
  myMonthlyUsageAnlysis,
  searchMyComplain,
  submitReading,
  writeComplain,
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
customerRouter.post(
  "/submit-reading",
  verifyToken,
  (req, res, next) => {
    console.log("Before upload - Headers:", req.headers['authorization']);
    console.log("Before upload - Content-Type:", req.headers['content-type']);
    
    upload.single("image")(req, res, function (err) {
      if (err) {
        console.log("Multer error:", err);
        return res.status(400).json({ message: err.message });
      }
      console.log("After upload - File received:", req.file);
      next();
    });
  },
  submitReading
);
export default customerRouter;

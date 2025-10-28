import express, { json } from "express";
import dotenv from "dotenv";
import { databaseConnection } from "./config/databaseConfig.js";
import cors from "cors";
import adminRouter from "./routes/adminRoute.js";
import customerRouter from "./routes/customerRoute.js";
import officerRouter from "./routes/officerRoute.js";

const app = express();

dotenv.config();
databaseConnection();

app.use(express.json());
app.use(cors());

app.use("/admin", adminRouter);
app.use("/customer", customerRouter);
app.use("/officer", officerRouter);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is runing on http\\localhost:${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import { databaseConnection } from "./config/databaseConfig.js";
import cors from "cors";
import http from "http";

const app = express();

dotenv.config();
databaseConnection();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

import adminRouter from "./routes/adminRoute.js";
import customerRouter from "./routes/customerRoute.js";
import officerRouter from "./routes/officerRoute.js";
import { unifiedLogin } from "./common/unifiedLogin.js";


app.use("/customer", customerRouter);
app.use("/admin", adminRouter);
app.use("/officer", officerRouter);
app.post("/auth/login", unifiedLogin);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.timeout = 140000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
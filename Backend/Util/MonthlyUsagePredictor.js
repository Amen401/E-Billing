import { spawn } from "child_process";
import { MongoClient } from "mongodb";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MONGO_URI = process.env.URL;
const DB_NAME = process.env.DB_NAME;
const COLLECTION = "Predictions";

export async function handlePredictionRequest(req) {
  const scriptPath = path.join(process.cwd(), "Python", "Monthly_Pred.py");
  const customerId = req.authUser._id?.toString() || req.authUser.id;
  
  const uniqueId = crypto.randomBytes(4).toString("hex");
  const tempOutputFile = path.join(process.cwd(), `temp_forecast_${uniqueId}.json`);

  const pythonArgs = [
    scriptPath,
    "--mongo", MONGO_URI,
    "--db", DB_NAME,
    "--coll", "meterreadings",
    "--customer", customerId,
    "--out", tempOutputFile,
  ];

  return new Promise((resolve, reject) => {
    // Determine python command (python3 usually for linux, python for windows)
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const pythonProcess = spawn(pythonCmd, pythonArgs, { windowsHide: true });

    let scriptErr = "";
    
    // Safety Timeout: Kill script if it takes longer than 30 seconds
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error("Prediction timed out after 30 seconds"));
    }, 30000);

    pythonProcess.stderr.on("data", (data) => {
      scriptErr += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      clearTimeout(timeout);
      try {
        if (code !== 0) {
          throw new Error(scriptErr || "Python script exited with error");
        }

        const data = await fs.readFile(tempOutputFile, "utf-8");
        const jsonData = JSON.parse(data);

        // Update MongoDB
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        
        await db.collection(COLLECTION).updateOne(
          { customerId: jsonData.customerId },
          { $set: { ...jsonData, lastUpdated: new Date() } },
          { upsert: true }
        );
        await client.close();

        await fs.unlink(tempOutputFile);
        resolve(jsonData);
      } catch (err) {
        // Cleanup temp file if it exists
        try { await fs.access(tempOutputFile); await fs.unlink(tempOutputFile); } catch (e) {}
        reject(err);
      }
    });
  });
}
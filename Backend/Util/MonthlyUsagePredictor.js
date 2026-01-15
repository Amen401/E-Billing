import { spawn } from "child_process";
import { MongoClient } from "mongodb";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MONGO_URI = process.env.URL;
const DB_NAME = process.env.DB_NAME;
const COLLECTION = "Predictions";

export async function handlePredictionRequest(req) {
  // Use path.resolve to handle OS-specific slashes (Windows vs Linux)
  const scriptPath = path.resolve(process.cwd(), "Python", "Monthly_Pred.py");
  const customerId = req.authUser._id?.toString() || req.authUser.id;

  // Create unique temp file to avoid race conditions
  const uniqueId = crypto.randomBytes(4).toString("hex");
  const tempOutputFile = path.resolve(process.cwd(), `temp_forecast_${customerId}_${uniqueId}.json`);

  const pythonArgs = [
    scriptPath,
    "--mongo", MONGO_URI,
    "--db", DB_NAME,
    "--coll", "meterreadings",
    "--customer", customerId,
    "--out", tempOutputFile,
  ];

  return new Promise((resolve, reject) => {
    // Note: use 'python' or 'python3' depending on your environment
    const pythonProcess = spawn("python", pythonArgs, { windowsHide: true });

    let scriptErr = "";

    pythonProcess.stderr.on("data", (data) => {
      scriptErr += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      try {
        if (code !== 0) {
          throw new Error(`Python Script Failed (Code ${code}): ${scriptErr}`);
        }

        // Verify file exists before reading
        await fs.access(tempOutputFile);
        const data = await fs.readFile(tempOutputFile, "utf-8");
        const jsonData = JSON.parse(data);

        // Update Database
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        
        await db.collection(COLLECTION).updateOne(
          { customerId: jsonData.customerId },
          { $set: { ...jsonData, lastCalculated: new Date() } },
          { upsert: true }
        );
        await client.close();

        // Cleanup
        await fs.unlink(tempOutputFile);
        resolve(jsonData);
      } catch (err) {
        // Attempt cleanup of temp file if it exists
        try { await fs.unlink(tempOutputFile); } catch (e) {}
        reject(err);
      }
    });
  });
}
import { spawn } from "child_process";
import { MongoClient } from "mongodb";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MONGO_URI = process.env.URL;
const DB_NAME = process.env.DB_NAME;
const COLLECTION = "Predictions";

export async function handlePredictionRequest(req) {
  const customerId = req.authUser._id?.toString() || req.authUser.id;
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const predColl = db.collection(COLLECTION);

    // --- STEP 1: CACHE CHECK ---
    // If prediction exists and is less than 1 hour old, return it immediately
    const existingPred = await predColl.findOne({ customerId });
    if (existingPred && existingPred.lastUpdated) {
      const ageInMs = new Date() - new Date(existingPred.lastUpdated);
      if (ageInMs < 1000 * 60 * 60) { // 60 minutes
        console.log("Returning cached prediction");
        return existingPred;
      }
    }

    // --- STEP 2: RUN PYTHON ---
    const scriptPath = path.join(process.cwd(), "Python", "Monthly_Pred.py");
    const uniqueId = crypto.randomBytes(4).toString("hex");
    const tempFile = path.join(process.cwd(), `tmp_${customerId}_${uniqueId}.json`);

    const pythonArgs = [scriptPath, "--mongo", MONGO_URI, "--db", DB_NAME, "--coll", "meterreadings", "--customer", customerId, "--out", tempFile];

    const result = await new Promise((resolve, reject) => {
      const py = spawn(process.platform === "win32" ? "python" : "python3", pythonArgs);
      let errorData = "";

      py.stderr.on("data", (data) => (errorData += data.toString()));
      py.on("close", async (code) => {
        if (code !== 0) return reject(new Error(errorData || "Python process failed"));
        
        try {
          const raw = await fs.readFile(tempFile, "utf8");
          const parsed = JSON.parse(raw);
          await fs.unlink(tempFile).catch(() => {}); // Clean up
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    // --- STEP 3: UPDATE DB ---
    const finalData = { ...result, lastUpdated: new Date() };
    await predColl.updateOne(
      { customerId },
      { $set: finalData },
      { upsert: true }
    );

    return finalData;

  } catch (err) {
    console.error("Prediction Logic Failed:", err.message);
    throw err;
  } finally {
    await client.close();
  }
}
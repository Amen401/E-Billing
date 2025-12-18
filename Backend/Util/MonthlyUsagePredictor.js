import { spawn } from "child_process";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import fs from "fs";


dotenv.config();

const PYTHON_SCRIPT = `${process.cwd()}/Python/Monthly_Pred.py`;
const MONGO_URI = process.env.URL;
const DB_NAME = process.env.DB_NAME;
const COLLECTION = "Predictions";

export async function handlePredictionRequest(req) {
  const customerId = req.authUser._id?.toString() || req.authUser.id;
  console.log("id", customerId);

  const pythonArgs = [
    PYTHON_SCRIPT,
    "--mongo",
    process.env.URL, 
    "--db",
    DB_NAME,
    "--coll",
    "meterreadings", 
    "--customer",
    customerId,
    "--out",
    "forecast.json",
  ];

  const pythonProcess = spawn("python", pythonArgs, { windowsHide: true });

  pythonProcess.stdout.on("data", (data) => console.log(data.toString()));
  pythonProcess.stderr.on("data", (data) => console.error(data.toString()));

  console.log("Running Python with args:", pythonArgs.join(" "));

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", pythonArgs, { windowsHide: true });

    let scriptOut = "";
    let scriptErr = "";

    pythonProcess.stderr.on("data", (d) => (scriptErr += d.toString()));
    pythonProcess.stdout.on("data", (d) => {
      scriptOut += d.toString();
    });

    pythonProcess.on("close", async (code) => {
      try {
        if (code !== 0) return reject(scriptErr || "Python script failed.");

        const jsonData = JSON.parse(fs.readFileSync("forecast.json", "utf-8"));

        // Update MongoDB with the prediction
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        await db
          .collection(COLLECTION)
          .updateOne(
            { customerId: jsonData.customerId },
            { $set: jsonData },
            { upsert: true }
          );
        await client.close();

        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    });
  });
}






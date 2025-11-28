import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

const MONGO_URI = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "test";

const PYTHON_SCRIPT_REL_PATH = path.join(
  "Backend",
  "Python",
  "Monthly_Pred.py"
);

if (!MONGO_URI) {
  console.error(
    "FATAL ERROR: MONGO_URI not found in environment variables. Check your .env file."
  );
  process.exit(1);
}

export async function handlePredictionRequest(req, res) {
  const customerId = req.authUser.id;
  const OUT_FILE = `forecast_${customerId}_${Date.now()}.json`;

  const pythonArgs = [
    PYTHON_SCRIPT_REL_PATH,
    "--mongo",
    MONGO_URI,
    "--db",
    DB_NAME,
    "--customer",
    customerId,
    "--out",
    OUT_FILE,
  ];

  try {
    const pythonProcess = spawn("python3", pythonArgs);

    let scriptOutput = "";
    let scriptError = "";

    pythonProcess.stdout.on("data", (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      scriptError += data.toString();
    });

    const code = await new Promise((resolve) => {
      pythonProcess.on("close", resolve);
    });

    if (code !== 0) {
      console.error(
        `Python script exited with code ${code}. Error: ${scriptError}`
      );
      return res.status(500).json({
        error: "Forecasting failed on Python side.",
        details: scriptError || scriptOutput,
      });
    }

    console.log(`Python Script Success Output: ${scriptOutput.trim()}`);

    const data = await fs.readFile(OUT_FILE, "utf-8");
    const result = JSON.parse(data);

    await fs.unlink(OUT_FILE);

    return res.json(result);
  } catch (error) {
    console.error("Express/Execution error:", error);

    try {
      await fs.unlink(OUT_FILE);
    } catch {}
    return res.status(500).json({
      error: "Server error during execution.",
      details: error.message,
    });
  }
}

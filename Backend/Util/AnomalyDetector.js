import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const detectAnomaly = async (customerId, killowatRead, monthlyUsage) => {
  return new Promise((resolve, reject) => {
    const pyPath = path.join(__dirname, "..", "Python", "detect_anomaly.py");

    console.log("Looking for Python script at:", pyPath);
    
const py = spawn("python", [pyPath]);


    const payload = {
      customerId,
      killowatRead,
      monthlyUsage,
    };

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

    let result = "";
    let errorOutput = "";

    py.stdout.on("data", (data) => {
      result += data.toString();
      console.log("Python stdout:", data.toString());
    });

    py.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("Python stderr:", data.toString());
    });

    py.on("close", (code) => {
      console.log("Python process exited with code:", code);
      console.log("Full Python output:", result);
      
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
        return;
      }
      
      try {
        if (result.trim()) {
          const parsed = JSON.parse(result);
          resolve(parsed);
        } else {
          reject(new Error("Python script returned empty output"));
        }
      } catch (err) {
        console.error("Failed to parse Python output. Raw output:", result);
        reject(new Error(`JSON parse error: ${err.message}`));
      }
    });
    
    py.on("error", (err) => {
      console.error("Failed to spawn Python process:", err);
      reject(err);
    });
  });
};
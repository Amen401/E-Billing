import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const detectAnomaly = async (customerId, killowatRead, monthlyUsage) => {
  return new Promise((resolve) => {
    const pyPath = path.join(__dirname, "..", "Python", "detect_anomaly.py");
    const py = spawn("python", [pyPath]);

    const payload = { customerId, killowatRead, monthlyUsage };
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

      try {
        if (result.trim()) {
          const parsed = JSON.parse(result);
          if (!parsed.anomalyStatus) parsed.anomalyStatus = "Unknown";
          resolve(parsed);
        } else {
          console.warn("Python returned empty output. Using default anomalyStatus.");
          resolve({ anomalyStatus: "Unknown" });
        }
      } catch (err) {
        console.error("Failed to parse Python output:", err);
        resolve({ anomalyStatus: "Unknown" });
      }
    });

    py.on("error", (err) => {
      console.error("Failed to spawn Python process:", err);
      resolve({ anomalyStatus: "Unknown" });
    });
  });
};

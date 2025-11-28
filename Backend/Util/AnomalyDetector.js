import { spawn } from "child_process";

export const detectAnomaly = async (customerId, killowatRead, monthlyUsage) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["detect_anomaly.py"]);

    const payload = {
      customerId,
      killowatRead,
      monthlyUsage,
    };

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

    let result = "";

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error("Python Error:", data.toString());
    });

    py.on("close", () => {
      try {
        resolve(JSON.parse(result));
      } catch (err) {
        reject(err);
      }
    });
  });
};

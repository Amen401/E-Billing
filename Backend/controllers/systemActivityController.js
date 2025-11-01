import SystemActivity from "../models/SystemActivity.js";
import moment from "moment";

export const getClientIp = (req) => {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return req.ip;
};


export const getSystemActivities = async (req, res) => {
  try {
    const activities = await SystemActivity.find().sort({ timestamp: -1 });

    const formattedActivities = activities.map((act) => ({
      _id: act._id,
      event: act.event,
      user: act.user,
      timestamp: moment(act.timestamp).format("YYYY-MM-DD HH:mm:ss"), 
      status: act.status,
      ipAddress: act.ipAddress === "::1" ? "localhost" : act.ipAddress, 
    }));

    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error("Fetch System Activities Error:", error);
    res.status(500).json({ message: "Failed to fetch system activities" });
  }
};


export const addSystemActivity = async ({ event, user, status, req }) => {
  try {
    const ipAddress = getClientIp(req);
    const newActivity = new SystemActivity({
      event,
      user,
      status,
      ipAddress: ipAddress === "::1" ? "localhost" : ipAddress,
      timestamp: new Date(),
    });

    await newActivity.save();
  } catch (error) {
    console.error("Add System Activity Error:", error);
  }
};

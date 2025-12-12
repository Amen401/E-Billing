import { v2 as cloudinary } from "cloudinary";

const cl = cloudinary;

cl.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
  timeout: 120000,
});

export const cloud = cl;

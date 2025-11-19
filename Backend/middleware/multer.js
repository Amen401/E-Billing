import multer from "multer";

const storage = multer.memoryStorage();
const up = multer({ storage });

export const upload = up;

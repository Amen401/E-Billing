import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    res.status(400).json({ message: "no token found" });
  }

  const token = header.split(" ")[1];

  try {
    const verify = jwt.verify(token, process.env.SECRET_KEY);
    //    req.authUser = verify;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token!" });
  }
};

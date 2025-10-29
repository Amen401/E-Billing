import jwt from "jsonwebtoken";

export const generateToken = (id, username) => {
  const token = jwt.sign({ id, username }, process.env.SECRET_KEY, {
    expiresIn: "2h",
  });
  return token;
};

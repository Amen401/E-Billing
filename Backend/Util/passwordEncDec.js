import bcrypt from "bcrypt"

const numberOfRounds = 10;

export const endcodePassword = async (password) => {
    const encPassword = await bcrypt.hash(password, numberOfRounds);
    return encPassword;
}

export const comparePassword = async (password, encPassword) => {
    const isTheSame = await bcrypt.compare(password, encPassword);
    return isTheSame;
}
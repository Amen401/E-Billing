export const createAccountNumberForCustomer = () => {
  const format = "10000";
  const randomNum =
    Math.floor(Math.random() * (99000000 - 10000000 + 1)) + 10000000;

  return format + randomNum;
};

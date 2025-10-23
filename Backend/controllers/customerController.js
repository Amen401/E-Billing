import { Customer } from "../models/CustomerModel"

const registration = async (req, res) => {
    const regForm = req.body();
  Customer.create()
}
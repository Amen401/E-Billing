import { Officer } from "../models/OfficerModel.js"
import { endcodePassword } from "../Util/passwordEncDec.js";

export const createOfficer = async (req, res) => {
    try {

        const newOfficer = req.body;
        newOfficer.password = await endcodePassword(newOfficer.password);
        const newOfficerSchema = new Officer(newOfficer);

        
        const saveOfficer = await newOfficerSchema.save()

        res.status(200).json({message: "New Officer added successfully", newOfficer: saveOfficer})
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
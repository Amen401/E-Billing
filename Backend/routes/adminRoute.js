import express from "express"
import { activateDeactivateOfficer, createAdmin, searchOfficer, updateName, updateUsernameOrPassword } from "../controllers/adminController.js"

const adminRouter = express.Router();

adminRouter.post("/add-admin", createAdmin)
adminRouter.post("/search-officer", searchOfficer)
adminRouter.post("/ad-officer", activateDeactivateOfficer)
adminRouter.post("/update-name", updateName)
adminRouter.post("/update-up", updateUsernameOrPassword)



export default adminRouter;
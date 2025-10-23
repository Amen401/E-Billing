import express, { json } from "express"
import dotenv from "dotenv"
import { databaseConnection } from "./config/databaseConfig.js"
import cors from "cors"


const app = express();

dotenv.config();
databaseConnection();

app.use(express.json())
app.use(cors())


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is runing on http\\localhost:${PORT}`)
})
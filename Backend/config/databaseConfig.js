import mongoose from "mongoose";


export const databaseConnection = async () => {
    try {
        const conn = await mongoose.connect(process.env.URL);
        console.log(`Database connected at ${conn.connection.port}`)
    } catch (error) {
        console.log("database not connected", error);
        process.exit(1)
    }
}
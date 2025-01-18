import Errors from "@/common/errors";
import mongoose from "mongoose";

export async function dbConnect() {
    try {
        const mongoURL = process.env.MONGO_URL;
        if (!mongoURL) {
            throw new Error(Errors.MONGO_URL_NOT_DEFINED.message);
        }
        if (mongoose.connection.readyState >= 1) return;
        mongoose.connect(mongoURL);
        const connection = mongoose.connection;
        connection.on("error", (error) => {
            console.error(error.message, "while connecting with MongoDB");
            process.exit(1);
        });
        connection.once("connected", () => {
            console.log("Connected to MongoDB");
        })
        return connection;
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message, "while connecting with MongoDB");
        } else {
            console.error("An unknown error occurred while connecting with MongoDB");
        }
    }
}
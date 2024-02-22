import mongoose from "mongoose";

import {DB_NAME} from "../constants.js";

const connectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MongoDb_URL}/${DB_NAME}`);
        console.log(`Mongo db connected to ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Mongo db connection failed",error);
        process.exit(1);
    }
}

export default connectDb;
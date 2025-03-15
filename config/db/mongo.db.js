
import mongoose from "mongoose";
// import {DB_NAME} from "../constant.js"
const DB_NAME = "astrochats";

const connectDB = async ()=>{
    try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected successfully`);
    }
    catch(error){
        console.log("ERROR: ", error);
        throw err
    }
}

export default connectDB;
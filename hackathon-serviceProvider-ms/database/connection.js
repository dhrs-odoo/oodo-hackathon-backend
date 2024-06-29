import mongoose from "mongoose";
import { DB_URL } from "../config/index.js";

const connectToDatabase = async () => {
  try {
    console.log(DB_URL);
    mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    const db = mongoose.connection;

    db.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    db.once("open", async () => {
      // Create the index after the connection is established
      try {
        await db
          .collection("serviceproviderdetails")
          .createIndex({ "orderLocation.coordinates": "2dsphere" });
        console.log("Index created successfully");
      } catch (err) {
        console.error("Error creating index:", err);
      }
    });
    console.log("Db Connected");
  } catch (error) {
    console.error("Error ============");
    console.error(error);
    process.exit(1);
  }
};

export default connectToDatabase;

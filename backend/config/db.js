import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI не е зададен в .env!");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error(`❌ Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;

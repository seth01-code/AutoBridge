import dotenv from "dotenv";
import path from "path";

// 🔥 FORCE LOAD .env.local FROM ROOT
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { connectDB } from "../lib/mongodb.ts";

async function run() {
  try {
    console.log("ENV CHECK:", process.env.MONGODB_URI);

    await connectDB();

    console.log("MongoDB connected successfully 🚀");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
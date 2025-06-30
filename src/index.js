import express from "express";
import dotenvx from "@dotenvx/dotenvx";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";

import cookieParser from "cookie-parser";

dotenvx.config();
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/auth", messageRoutes);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} BOSS!!`);
  connectDB(); // Actually call the function with await
});

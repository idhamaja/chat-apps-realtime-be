import express from "express";
import dotenvx from "@dotenvx/dotenvx";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

import cookieParser from "cookie-parser";

dotenvx.config();
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} BOSS!!`);
  connectDB(); // Actually call the function with await
});

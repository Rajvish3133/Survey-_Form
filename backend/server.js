import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import {connection} from "./database/db.js";

dotenv.config();

const app = express();

app.use(cors({
     origin: "http://localhost:5173",
     methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
})
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/surveys", surveyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connection();
});
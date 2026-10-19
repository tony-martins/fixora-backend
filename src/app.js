import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://fixora-frontend-one.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

export default app;

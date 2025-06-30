import express from "express";
import 'dotenv/config';
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js"
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
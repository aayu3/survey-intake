import express from "express";
import 'dotenv/config';
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js"
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const templateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  form: z.any(),
});

app.get("/health", (req, res) => res.send("OK"));

app.post("tempaltes", async (req, res) => {
  try {
    const body = templateSchema.parse(req.body);
    const template = await prisma.surveyTemplate.create({
      data: {
        title: body.title,
        description: body.description,
        form: body.form,
      },
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
import express from "express";
import 'dotenv/config';
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js"
import { z } from "zod";
import admin from "firebase-admin";

const serviceAccount = admin.credential.cert("./firebase-admin.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const templateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  form: z.any(),
});

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    req.uid = (await admin.auth().verifyIdToken(token)).uid;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/health", (req, res) => res.send("OK"));

app.get("/templates", requireAuth,async (req, res) => {
  try {
    const templates = await prisma.surveyTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {isActive: true},
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/template", requireAuth, async (req, res) => {
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

app.get("/template/:id", requireAuth, async (req, res) => {
  try { 
    const template = await prisma.surveyTemplate.findUnique({
      where: { id: req.params.id, isActive: true },
    });
    res.json(template);
  } catch (error) {
    res.status(404).json({ error: "Template not found" });
  }
});

app.post("/user", requireAuth, async (req, res) => {``
  try {
    const email = req.body.email;
    const id = req.body.uid
    const user = await prisma.user.create({
      data: {
        email: email,
        id: id,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
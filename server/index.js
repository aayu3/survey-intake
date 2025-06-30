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

const responseSchema = z.object({
  templateId: z.string().min(1),
  answers: z.any(),
  status: z.string().min(1),
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

app.post("/submit", requireAuth, async (req, res) => {
  try {
    console.log("body", req.body)
    const body = responseSchema.parse(req.body);
    const existing = await prisma.surveyResponse.findFirst({
      where: {
        templateId: body.templateId,
        userId: req.uid,
      },
    });

    let saved;
    if (existing) {
      saved = await prisma.surveyResponse.update({
        where: {id: existing.id},
        data: {
          answer: body.answers,
          status: body.status,
        },
      });
    } else {
      saved = await prisma.surveyResponse.create({
        data: {
          templateId: body.templateId,
          userId: req.uid,
          answer: body.answers,
          status: body.status,
        },
      });
    }

    return res.status(201).json(saved);
  } catch (error) {
    console.log("Submit error:", error);
    return res.status(400).json({ error: error.message });
  }
});

app.get("/responses/:templateId", requireAuth, async (req, res) => {    
  try {
    const responses = await prisma.surveyResponse.findFirst({
      where: {
        templateId: req.params.templateId,
        userId: req.uid,
      },
    });
    if (!responses) {
      return res.status(404).json({ error: "Responses not found" });
    }
    return res.status(200).json(responses);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
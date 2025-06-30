import { z } from "zod";

const multipleChoiceQuestionSchema = z.object({
    type: z.literal("multipleChoice"),
    title: z.string().min(1),
    question: z.string().min(1),
    options: z.array(z.string()).min(2),
});

const textQuestionSchema = z.object({
    type: z.literal("text"),
    title: z.string().min(1),
    question: z.string().min(1),
});

export const questionSchema = z.discriminatedUnion("type", [multipleChoiceQuestionSchema, textQuestionSchema]);

export type Question = z.infer<typeof questionSchema>;
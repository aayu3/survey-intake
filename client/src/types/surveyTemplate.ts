import { z } from "zod";
import { questionSchema } from "./questions";

export const surveyTemplateSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    form: z.array(questionSchema).min(1),
});

export type SurveyTemplate = z.infer<typeof surveyTemplateSchema>;
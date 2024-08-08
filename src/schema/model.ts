import { z } from "zod";

export const modelSchema = z.object({
  provider: z.enum(["OLLAMA", "OPENAI"]),
  model: z.string(),
  url: z.string(),
  apiKey: z.string().nullable(),
});

export type Model = z.infer<typeof modelSchema>;

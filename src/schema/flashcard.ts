import { z } from "zod";

export const fcSchema = z
  .object({
    id: z.number(),
    createdAt: z.string().datetime(),
    status: z.enum(["IN_PROGRESS", "CREATED", "COMPLETED"]),
  })
  .and(
    z.discriminatedUnion("status", [
      z.object({
        status: z.literal("CREATED"),
      }),
      z.object({
        status: z.enum(["IN_PROGRESS", "COMPLETED"]),
        front: z.string(),
        back: z.string(),
      }),
    ]),
  );

export type Flashcard = z.infer<typeof fcSchema>;

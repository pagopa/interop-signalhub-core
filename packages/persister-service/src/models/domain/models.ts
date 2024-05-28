import { z } from "zod";

export const SignalEvent = z.object({
  signalType: z.enum(["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"]),
  objectId: z.string(),
  objectType: z.string(),
  eserviceId: z.string(),
  signalId: z.number(),
});

export const Signal = z.object({
  correlationId: z.string(),
  signalId: z.number(),
  signalType: z.string(),
  objectId: z.string(),
  eserviceId: z.string(),
  objectType: z.string(),
  tmstInsert: z.string().default(new Date().toISOString()),
});

export type Signal = z.infer<typeof Signal>;
export type SignalEvent = z.infer<typeof SignalEvent>;

import { z } from "zod";

export const SignalEvent = z.object({
  signalType: z.enum(["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"]),
  objectId: z.string(),
  objectType: z.string(),
  eserviceId: z.string(),
  signalId: z.number(),
});

export type SignalEvent = z.infer<typeof SignalEvent>;

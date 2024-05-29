import { z } from "zod";

export const SignalType = z.enum(["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"]);

export const SignalSchema = z.object({
  signalType: SignalType,
  objectId: z.string(),
  eserviceId: z.string(),
  signalId: z.number(),
  objectType: z.string(),
});

export const SignalMessage = z.object({
  correlationId: z.string(),
  signalType: SignalType,
  objectId: z.string(),
  eserviceId: z.string(),
  signalId: z.number(),
  objectType: z.string(),
});

export const Signal = SignalMessage;

export type SignalRequest = z.infer<typeof SignalSchema>;
export type SignalMessage = z.infer<typeof SignalMessage>;
export type Signal = z.infer<typeof Signal>;

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

export const SignalMessageSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Signal Message Schema",
  type: "object",
  properties: {
    correlationId: {
      type: "string",
    },
    signalId: {
      type: "number",
    },
    objectId: {
      type: "string",
    },
    eserviceId: {
      type: "string",
    },
    objectType: {
      type: "string",
    },
    signalType: {
      enum: ["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"],
    },
  },
  required: [
    "correlationId",
    "objectId",
    "eserviceId",
    "signalId",
    "objectType",
    "signalType",
  ],
};

export const SMessageSchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    SignalMessage
  ),
});

export const SignalPushResponse = SignalSchema.pick({ signalId: true });

export const Signal = SignalMessage;
export type SignalRequest = z.infer<typeof SignalSchema>;
export type SignalMessage = z.infer<typeof SignalMessage>;
export type Signal = z.infer<typeof Signal>;

import { z } from "zod";

const StandardJWTClaims = z.object({
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  // All standard claims except "sub", which is not present in UI tokens
  iss: z.string(),
  jti: z.string(),
  nbf: z.number(),
});

export const AuthToken = StandardJWTClaims.merge(
  z.object({
    client_id: z.string().uuid(),
    organizationId: z.string().uuid(),
    sub: z.string(),
  }),
);
export type AuthToken = z.infer<typeof AuthToken>;

export const SessionData = z.object({
  organizationId: z.string().uuid(),
});
export type SessionData = z.infer<typeof SessionData>;

export const AppContext = z.object({
  correlationId: z.string(),
  serviceName: z.string(),
  sessionData: SessionData,
});

export const Headers = z.object({
  authorization: z.string().nullish(),
  "x-correlation-id": z.string().nullish(),
});

export type Headers = z.infer<typeof Headers>;
export type AppContext = z.infer<typeof AppContext>;

export const SignalType = z.enum(["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"]);

const SignalSchema = z.object({
  eserviceId: z.string(),
  objectId: z.string(),
  objectType: z.string(),
  signalId: z.number(),
  signalType: SignalType,
});

export const SignalPayload = SignalSchema;
export type SignalPayload = z.infer<typeof SignalSchema>;

export const SignalResponse = SignalSchema;
export type SignalResponse = z.infer<typeof SignalSchema>;

export const SignalPushResponse = SignalSchema.pick({ signalId: true });
export const SignalPullResponse = z.object({
  lastSignalId: z.number().nullish(),
  signals: z.array(SignalResponse),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SignalRecord = any;

export const SignalMessage = SignalSchema.extend({
  correlationId: z.string(),
});

export const SignalMessageSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  properties: {
    correlationId: {
      type: "string",
    },
    eserviceId: {
      type: "string",
    },
    objectId: {
      type: "string",
    },
    objectType: {
      type: "string",
    },
    signalId: {
      type: "number",
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
  title: "Signal Message Schema",
  type: "object",
};

export const SMessageSchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    SignalMessage,
  ),
});

export type SignalMessage = z.infer<typeof SignalMessage>;
export const Signal = SignalMessage;
export type Signal = z.infer<typeof Signal>;

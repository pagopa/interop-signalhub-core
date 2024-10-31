import { z } from "zod";

const StandardJWTClaims = z.object({
  // All standard claims except "sub", which is not present in UI tokens
  iss: z.string(),
  aud: z.string(),
  exp: z.number(),
  nbf: z.number(),
  iat: z.number(),
  jti: z.string()
});

export const AuthToken = StandardJWTClaims.merge(
  z.object({
    organizationId: z.string().uuid(),
    client_id: z.string().uuid(),
    sub: z.string()
  })
);
export type AuthToken = z.infer<typeof AuthToken>;

export const SessionData = z.object({
  organizationId: z.string().uuid()
});
export type SessionData = z.infer<typeof SessionData>;

export const AppContext = z.object({
  serviceName: z.string(),
  correlationId: z.string(),
  sessionData: SessionData
});

export const Headers = z.object({
  authorization: z.string().nullish(),
  "x-correlation-id": z.string().nullish()
});

export type Headers = z.infer<typeof Headers>;
export type AppContext = z.infer<typeof AppContext>;

export const SignalType = z.enum(["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"]);

const SignalSchema = z.object({
  signalType: SignalType,
  objectId: z.string(),
  eserviceId: z.string(),
  signalId: z.number(),
  objectType: z.string()
});

export const SignalPayload = SignalSchema;
export type SignalPayload = z.infer<typeof SignalSchema>;

export const SignalResponse = SignalSchema;
export type SignalResponse = z.infer<typeof SignalSchema>;

export const SignalPushResponse = SignalSchema.pick({ signalId: true });
export const SignalPullResponse = z.object({
  signals: z.array(SignalResponse),
  lastSignalId: z.number().nullish()
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SignalRecord = any;

export const SignalMessage = SignalSchema.extend({
  correlationId: z.string()
});

export const SignalMessageSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Signal Message Schema",
  type: "object",
  properties: {
    correlationId: {
      type: "string"
    },
    signalId: {
      type: "number"
    },
    objectId: {
      type: "string"
    },
    eserviceId: {
      type: "string"
    },
    objectType: {
      type: "string"
    },
    signalType: {
      enum: ["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"]
    }
  },
  required: [
    "correlationId",
    "objectId",
    "eserviceId",
    "signalId",
    "objectType",
    "signalType"
  ]
};

export const SMessageSchema = z.object({
  value: z.preprocess(
    (v) => (v != null ? JSON.parse(v.toString()) : null),
    SignalMessage
  )
});

export type SignalMessage = z.infer<typeof SignalMessage>;
export const Signal = SignalMessage;
export type Signal = z.infer<typeof Signal>;

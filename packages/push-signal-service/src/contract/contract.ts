import { initContract } from "@ts-rest/core";
import {
  ApiError,
  CommonErrorCodes,
  operationForbidden,
  unauthorizedError,
} from "signalhub-commons";
import { z } from "zod";

const SIGNAL_TYPE = ["CREATE", "UPDATE", "DELETE", "SEEDUPDATE"] as const;

const Signal = z.object({
  signalId: z.number(),
});

const SignalSchema = z.object({
  signalType: z.enum(SIGNAL_TYPE),
  objectId: z.string(),
  eserviceId: z.string(),
  signalId: z.number(),
  objectType: z.string(),
});

export type SignalRequest = z.infer<typeof SignalSchema>;
export type Signal = z.infer<typeof Signal>;
const c = initContract();

export const contract = c.router(
  {
    pushSignal: {
      summary: "Push Signal",
      method: "POST",
      path: "/push-signal",
      responses: {
        200: Signal,
        400: c.type<ApiError<CommonErrorCodes>>(),
        401: c.type<typeof unauthorizedError>(),
        403: c.type<typeof operationForbidden>(),
        429: c.type<ApiError<CommonErrorCodes>>(),
      },
      body: SignalSchema,
    },
  },
  {
    baseHeaders: z.object({
      authorization: z.string(),
    }),
  }
);

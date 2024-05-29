import { initContract } from "@ts-rest/core";
import { SignalSchema, SignalPushResponse, Problem } from "signalhub-commons";
import { z } from "zod";

const c = initContract();

export const contract = c.router(
  {
    pushSignal: {
      summary: "Push Signal",
      method: "POST",
      path: "/push-signal",
      responses: {
        200: SignalPushResponse,
        400: c.type<Problem>(), // common error
        401: c.type<Problem>(), // unauthorizedError
        403: c.type<Problem>(), // operationForbidden
        429: c.type<Problem>(), // common errors
        500: c.type<Problem>(), // generic error
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

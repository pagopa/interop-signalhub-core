import { initContract } from "@ts-rest/core";
import { SignalPayload, SignalPushResponse, Problem } from "signalhub-commons";
import { z } from "zod";

const c = initContract();

export const contract = c.router(
  {
    pushSignal: {
      summary: "Push Signal",
      description: "Insert a signal",
      metadata: {
        auth: true,
        role: "user",
      } as const,
      method: "POST",
      path: "/push-signal",
      responses: {
        200: SignalPushResponse,
        400: Problem,
        401: Problem,
        403: Problem,
        500: Problem,
      },
      body: SignalPayload,
    },
  },
  {
    baseHeaders: z.object({
      authorization: z.string(),
    }),
  }
);

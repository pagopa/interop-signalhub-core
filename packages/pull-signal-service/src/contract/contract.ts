import { initContract } from "@ts-rest/core";
import { Problem, SignalPullResponse } from "signalhub-commons";
import { z } from "zod";

const c = initContract();

export const contract = c.router(
  {
    pullSignal: {
      summary: "Pull Signal",
      method: "GET",
      path: "/pull-signal/{eserviceId}",
      responses: {
        200: SignalPullResponse,
        206: SignalPullResponse,
        400: Problem,
        401: Problem,
        403: Problem,
        500: Problem,
      },
      query: z.object({
        signalId: z.string().transform(Number),
        size: z.string().transform(Number).optional(),
      }),
    },
  },
  {
    baseHeaders: z.object({
      authorization: z.string(),
    }),
  }
);

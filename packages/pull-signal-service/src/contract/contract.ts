import { initContract } from "@ts-rest/core";
import { Problem, SignalPullResponse } from "signalhub-commons";
import { z } from "zod";

const c = initContract();

export const contract = c.router(
  {
    pullSignal: {
      summary: "Pull Signal",
      method: "GET",
      path: "/pull-signal/:eserviceId",
      pathParams: z.object({
        eserviceId: z.string(),
      }),
      query: z.object({
        signalId: z.coerce.number().min(0).default(0),
        size: z.coerce.number().min(0).optional().default(0),
      }),
      responses: {
        200: SignalPullResponse,
        206: SignalPullResponse,
        400: Problem,
        401: Problem,
        403: Problem,
        500: Problem,
      },
    },
  },
  {
    baseHeaders: z.object({
      authorization: z.string(),
    }),
  }
);

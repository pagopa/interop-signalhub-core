import { initContract } from "@ts-rest/core";
import { SignalPullResponse, Problem } from "signalhub-commons";
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
        400: c.type<Problem>(),
        401: c.type<Problem>(),
        403: c.type<Problem>(),
        404: c.type<Problem>(),
        429: c.type<Problem>(),
        500: c.type<Problem>(),
      },
    },
  },
  {
    baseHeaders: z.object({
      authorization: z.string(),
    }),
  }
);

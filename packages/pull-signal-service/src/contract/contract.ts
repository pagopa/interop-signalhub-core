import { initContract } from "@ts-rest/core";
import { SignalPushResponse, Problem } from "signalhub-commons";
import { z } from "zod";

const c = initContract();

export const contract = c.router(
  {
    pullSignal: {
      summary: "Pull Signal",
      method: "GET",
      path: "/pull-signal",
      responses: {
        200: SignalPushResponse,
        400: c.type<Problem>(),
        401: c.type<Problem>(),
        403: c.type<Problem>(),
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

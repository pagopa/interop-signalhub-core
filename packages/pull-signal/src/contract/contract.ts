import { initContract } from "@ts-rest/core";
import { Problem, SignalPullResponse } from "pagopa-signalhub-commons";
import { z } from "zod";

const c = initContract();

export const contract = c.router(
  {
    pullSignal: {
      summary: "Get a list of signals",
      description:
        "Retrieve a list o signals on a specific eservice starting from signalId",
      method: "GET",
      path: "/signals/:eserviceId",
      pathParams: z.object({
        eserviceId: z.string(),
      }),
      query: z.object({
        signalId: z.coerce.number().min(0).default(0),
        size: z.coerce.number().min(1).max(100).optional().default(10),
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

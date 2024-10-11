import { initContract } from "@ts-rest/core";
import {
  Problem as ProblemComponent,
  SignalPullResponse as SignalPullResponseComponent,
  SignalResponse,
  SignalType,
} from "pagopa-signalhub-commons";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const c = initContract();

// Here we use "extend" ZOD api only to add keyword "openapi" in order to generate openAPI document with component section
// Read more here: https://github.com/asteasolutions/zod-to-openapi.

const Problem = ProblemComponent.openapi("problem");
const SignalPullResponse = SignalPullResponseComponent.extend({
  signals: z.array(
    SignalResponse.extend({
      signalType: SignalType.openapi("signalType"),
    })
  ),
}).openapi("SignalPullResponse");

export const contract = c.router({
  getStatus: {
    summary: "Health status endpoint",
    description: "Should return OK",
    method: "GET",
    path: "/status",
    responses: {
      200: z.literal("OK"),
    },
  },
  pullSignal: {
    summary: "Get a list of signals",
    description:
      "Retrieve a list o signals on a specific eservice starting from signalId",
    method: "GET",
    path: "/signals/:eserviceId",
    pathParams: z.object({
      eserviceId: z.string(),
    }),
    headers: z.object({
      authorization: z.string(),
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
});

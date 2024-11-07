import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { initContract } from "@ts-rest/core";
import {
  Problem as ProblemComponent,
  SignalPayload as SignalPayloadComponent,
  SignalPushResponse as SignalPushResponseComponent,
  SignalType
} from "pagopa-signalhub-commons";
import { z } from "zod";

import { config } from "../config/env.js";

extendZodWithOpenApi(z);

const c = initContract();

export const pathPrefix = `/${config.apiPushVersion}/push`;

// Here we use "extend" ZOD api only to add keyword "openapi" in order to generate openAPI document with component section
// Read more here: https://github.com/asteasolutions/zod-to-openapi

const Problem = ProblemComponent.openapi("problem");
const SignalPushResponse =
  SignalPushResponseComponent.openapi("SignalPushResponse");
const SignalPayload = SignalPayloadComponent.extend({
  signalType: SignalType.openapi("signalType")
}).openapi("SignalPayload");

export const contract = c.router(
  {
    getStatus: {
      summary: "Health status endpoint",
      description: "Should return OK",
      method: "GET",
      path: "/status",
      responses: {
        200: z.literal("OK")
      }
    },
    pushSignal: {
      summary: "Push Signal",
      description: "Insert a signal",
      headers: z.object({
        authorization: z.string()
      }),
      metadata: {
        auth: true,
        role: "user"
      } as const,
      method: "POST",
      path: "/signals",
      responses: {
        200: SignalPushResponse,
        400: Problem,
        401: Problem,
        403: Problem,
        500: Problem
      },
      body: SignalPayload
    }
  },
  {
    pathPrefix
  }
);

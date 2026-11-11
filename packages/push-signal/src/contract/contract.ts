import { initContract } from "@ts-rest/core";
import {
  Problem as ProblemComponent,
  SignalPayload as SignalPayloadComponent,
  SignalPushResponse as SignalPushResponseComponent,
  SignalType
} from "pagopa-signalhub-commons";
import { z } from "zod";

import { config } from "../config/env.js";

const c = initContract();

export const pathPrefix = `/${config.apiVersion}/push`;

const Problem = ProblemComponent.meta({ id: "problem" });
const SignalPushResponse = SignalPushResponseComponent.meta({
  id: "SignalPushResponse"
});
const SignalPayload = SignalPayloadComponent.extend({
  signalType: SignalType.meta({ id: "signalType" })
}).meta({ id: "SignalPayload" });

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
        429: Problem,
        500: Problem
      },
      body: SignalPayload
    }
  },
  {
    pathPrefix
  }
);

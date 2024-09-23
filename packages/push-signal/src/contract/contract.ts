import { initContract } from "@ts-rest/core";
import {
  SignalPayload,
  SignalPushResponse,
  Problem,
} from "pagopa-signalhub-commons";
import { z } from "zod";
import { config } from "../config/env.js";

const c = initContract();

const pathPrefix = `/${config.apiPushVersion}/push`;

export const contract = c.router(
  {
    getStatus: {
      summary: "Health status endpoint",
      description: "Should return OK",
      method: "GET",
      path: "/status",
      responses: {
        200: z.literal("OK"),
      },
    },
    pushSignal: {
      summary: "Push Signal",
      description: "Insert a signal",
      headers: z.object({
        authorization: z.string(),
      }),
      metadata: {
        auth: true,
        role: "user",
      } as const,
      method: "POST",
      path: "/signals",
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
    pathPrefix,
  }
);

import { initContract } from "@ts-rest/core";
import {
  ApiError,
  CommonErrorCodes,
  operationForbidden,
  unauthorizedError,
  SignalSchema,
  SignalPushResponse,
} from "signalhub-commons";
import { z } from "zod";

const c = initContract();

export const contract = c.router(
  {
    pushSignal: {
      summary: "Push Signal",
      method: "POST",
      path: "/push-signal",
      responses: {
        200: SignalPushResponse,
        400: c.type<ApiError<CommonErrorCodes>>(),
        401: c.type<typeof unauthorizedError>(),
        403: c.type<typeof operationForbidden>(),
        429: c.type<ApiError<CommonErrorCodes>>(),
      },
      body: SignalSchema,
    },
  },
  {
    baseHeaders: z.object({
      authorization: z.string(),
    }),
  }
);

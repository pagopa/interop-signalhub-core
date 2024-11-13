import { NextFunction, Request, Response } from "express";
import { constants } from "http2";

import {
  genericError,
  makeApiProblemBuilder,
  tooManyRequestsError
} from "../errors/index.js";
import { Logger } from "../logging/index.js";
import { rateLimiterHeadersFromStatus } from "./rateLimiterUtils.js";
import { RateLimiter } from "./redisRateLimiter.js";

const makeApiProblem = makeApiProblemBuilder({});

export function rateLimiterMiddleware(
  rateLimiter: RateLimiter,
  logger: Logger
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { correlationId, sessionData } = request.ctx;
    const { organizationId } = sessionData;

    if (!organizationId) {
      const errorRes = makeApiProblem(
        genericError("Missing expected organizationId claim in token"),
        () => constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        logger,
        correlationId
      );
      return response.status(errorRes.status).send(errorRes);
    }

    const rateLimiterStatus = await rateLimiter.rateLimitBy(
      organizationId,
      logger
    );

    if (rateLimiterStatus.limitReached) {
      const headers = rateLimiterHeadersFromStatus(rateLimiterStatus);
      return response
        .status(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
        .set(headers)
        .json(
          makeApiProblem(
            tooManyRequestsError(organizationId),
            () => constants.HTTP_STATUS_TOO_MANY_REQUESTS,
            logger,
            correlationId
          )
        );
    } else {
      return next();
    }
  };
}
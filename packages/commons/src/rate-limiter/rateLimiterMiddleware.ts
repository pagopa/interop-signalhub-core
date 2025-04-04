import { NextFunction, Request, Response } from "express";
import { constants } from "http2";

import {
  genericError,
  makeApiProblemBuilder,
  tooManyRequestsError
} from "../errors/index.js";
import { logger } from "../index.js";
import { rateLimiterHeadersFromStatus } from "./rateLimiterUtils.js";
import { RateLimiter } from "./redisRateLimiter.js";

const makeApiProblem = makeApiProblemBuilder({});

export function rateLimiterMiddleware(rateLimiter: RateLimiter) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { serviceName, correlationId, sessionData } = request.ctx;
    const { organizationId } = sessionData;
    const log = logger({ serviceName, correlationId });

    log.debug(
      `RateLimiterMiddleware::rateLimiterMiddleware, organizationId: ${organizationId}`
    );

    if (!organizationId) {
      const errorRes = makeApiProblem(
        genericError("Missing expected organizationId claim in token"),
        () => constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
        log,
        correlationId
      );
      return response.status(errorRes.status).send(errorRes);
    }

    const rateLimiterStatus = await rateLimiter.rateLimitBy(
      organizationId,
      log
    );

    const headers = rateLimiterHeadersFromStatus(rateLimiterStatus);
    response.set(headers);

    if (rateLimiterStatus.limitReached) {
      return response
        .status(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
        .json(
          makeApiProblem(
            tooManyRequestsError(organizationId),
            () => constants.HTTP_STATUS_TOO_MANY_REQUESTS,
            log,
            correlationId
          )
        );
    }
    return next();
  };
}

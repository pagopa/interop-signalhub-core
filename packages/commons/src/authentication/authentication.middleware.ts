import { NextFunction, Request, Response } from "express";
import { P, match } from "ts-pattern";

import {
  genericInternalError,
  jwtDecodingError,
  jwtNotPresent,
  makeApiProblemBuilder,
  missingBearer,
  missingHeader,
} from "../errors/index.js";
import { Logger, logger } from "../logging/index.js";
import { Headers } from "../models/index.js";
import { readSessionDataFromJwtToken, validateToken } from "./jwt.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authenticationMiddleware = async (
  req: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const validateTokenAndAddSessionDataToContext = async (
    authHeader: string,
    logger: Logger,
  ): Promise<void> => {
    if (!authHeader) {
      throw jwtNotPresent;
    }

    const authorizationHeader = authHeader.split(" ");

    if (
      authorizationHeader.length !== 2 ||
      authorizationHeader[0] !== "Bearer"
    ) {
      logger.warn(
        `Authentication: no authentication has been provided for this call ${req.method} ${req.url}`,
      );
      throw missingBearer;
    }

    const jwtToken = authorizationHeader[1];
    const validationResult = await validateToken(jwtToken, logger);

    if (!validationResult.success) {
      throw jwtDecodingError(validationResult.err);
    }

    // eslint-disable-next-line functional/immutable-data
    req.ctx.sessionData = readSessionDataFromJwtToken(jwtToken);
  };

  const log = logger({
    correlationId: req.ctx?.correlationId,
    eserviceId: req.params.eserviceId,
    serviceName: req.ctx?.serviceName,
  });

  try {
    log.info("Authentication voucher");
    const headers = Headers.safeParse(req.headers);

    if (!headers.success) {
      throw missingHeader();
    }

    return await match(headers.data)
      .with(
        {
          authorization: P.string,
        },
        async (headers) => {
          await validateTokenAndAddSessionDataToContext(
            headers.authorization,
            log,
          );
          next();
        },
      )
      .with(
        {
          authorization: P.nullish,
          "x-correlation-id": P._,
        },
        () => {
          log.warn(
            `No authentication has been provided for this call ${req.method} ${req.url}`,
          );

          throw jwtNotPresent;
        },
      )
      .with(
        {
          authorization: P.string,
          "x-correlation-id": P.nullish,
        },
        () => {
          log.warn(
            `No authentication has been provided for this call ${req.method} ${req.url}`,
          );

          throw missingHeader("jwtNotPresent");
        },
      )
      .otherwise(() => {
        throw genericInternalError;
      });
  } catch (error) {
    const problem = makeApiProblem(
      error,
      (err) =>
        match(err.code)
          .with("unauthorizedError", () => 401)
          .with("jwtDecodingError", () => 401)
          .with("operationForbidden", () => 403)
          .with("missingHeader", () => 400)
          .otherwise(() => 500),
      log,
      req.ctx.correlationId,
    );

    return response.status(problem.status).json(problem).end();
  }
};

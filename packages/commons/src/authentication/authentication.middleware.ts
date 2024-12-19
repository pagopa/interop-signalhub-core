import { NextFunction, Request, Response } from "express";
import { P, match } from "ts-pattern";

import {
  genericInternalError,
  jwtDecodingError,
  jwtNotPresent,
  makeApiProblemBuilder,
  missingBearer,
  missingHeader
} from "../errors/index.js";
import { Logger, logger } from "../logging/index.js";
import { Headers } from "../models/index.js";
import { readSessionDataFromJwtToken, validateToken } from "./jwt.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authenticationMiddleware = async (
  req: Request,
  response: Response,
  next: NextFunction
): Promise<void | Response> => {
  const validateTokenAndAddSessionDataToContext = async (
    authHeader: string,
    logger: Logger
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
        `Authentication: no authentication has been provided for this call ${req.method} ${req.url}`
      );
      throw missingBearer;
    }

    const jwtToken = authorizationHeader[1];
    const validationResult = await validateToken(jwtToken, logger);

    if (!validationResult.success) {
      throw jwtDecodingError(validationResult.err);
    }

    const { organizationId, clientId } = readSessionDataFromJwtToken(jwtToken);
    req.ctx.sessionData = {
      organizationId
    };
    log.info(
      `Authentication:: organizationID: ${organizationId} clientID: ${clientId}`
    );
  };

  const log = logger({
    serviceName: req.ctx?.serviceName,
    correlationId: req.ctx?.correlationId,
    eserviceId: req.params.eserviceId
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
          authorization: P.string
        },
        async (headers) => {
          await validateTokenAndAddSessionDataToContext(
            headers.authorization,
            log
          );
          next();
        }
      )
      .with(
        P.union({ authorization: P.nullish }, P.not({ authorization: P._ })),
        () => {
          log.warn(
            `No authentication has been provided for this call ${req.method} ${req.url}`
          );

          throw jwtNotPresent;
        }
      )
      .otherwise(() => {
        throw genericInternalError;
      });
  } catch (error) {
    const problem = makeApiProblem(
      error,
      (err) =>
        match(err.code)
          .with(
            P.union(
              "unauthorizedError",
              "jwtDecodingError",
              "jwtNotPresent",
              "missingHeader"
            ),
            () => 401
          )
          .with("operationForbidden", () => 403)
          .otherwise(() => 500),
      log,
      req.ctx.correlationId
    );

    return response.status(problem.status).json(problem).end();
  }
};

import { Response, Request, NextFunction } from "express";
import { P, match } from "ts-pattern";
import { Logger, logger } from "../logging/index.js";
import { Headers } from "../models/index.js";
import {
  genericInternalError,
  jwtDecodingError,
  jwtNotPresent,
  makeApiProblemBuilder,
  missingBearer,
  missingHeader,
} from "../errors/index.js";
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
        `No authentication has been provided for this call ${req.method} ${req.url}`
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

  const loggerInstance = logger({
    serviceName: req.ctx?.serviceName,
    correlationId: req.ctx?.correlationId,
  });

  try {
    loggerInstance.info("Authentication BEGIN");
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
            loggerInstance
          );
          loggerInstance.info("Authentication END");
          next();
        }
      )
      .with(
        {
          authorization: P.nullish,
          "x-correlation-id": P._,
        },
        () => {
          loggerInstance.warn(
            `No authentication has been provided for this call ${req.method} ${req.url}`
          );

          throw jwtNotPresent;
        }
      )
      .with(
        {
          authorization: P.string,
          "x-correlation-id": P.nullish,
        },
        () => {
          loggerInstance.warn(
            `No authentication has been provided for this call ${req.method} ${req.url}`
          );

          throw missingHeader("jwtNotPresent");
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
          .with("unauthorizedError", () => 401)
          .with("jwtDecodingError", () => 401)
          .with("operationForbidden", () => 403)
          .with("missingHeader", () => 400)
          .otherwise(() => 500),
      loggerInstance,
      req.ctx.correlationId
    );

    return response.status(problem.status).json(problem).end();
  }
};

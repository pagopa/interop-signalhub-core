import { Response, Request, NextFunction } from "express";
import { P, match } from "ts-pattern";
import { readAuthDataFromJwtToken, validateToken } from "./jwt.js";
import { Logger, logger } from "../logging/index.js";
import { Headers } from "../config/express.config.js";
import {
  jwtNotPresent,
  makeApiProblemBuilder,
  missingBearer,
  missingHeader,
  unauthorizedError,
} from "../errors/index.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authenticationMiddleware = async (
  req: Request,
  response: Response,
  next: NextFunction
) => {
  const validateTokenAndAddAuthDataToContext = async (
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
    const valid = await validateToken(jwtToken, logger);
    if (!valid) {
      throw unauthorizedError("Invalid token");
    }

    const authData = readAuthDataFromJwtToken(jwtToken);
    req.ctx.authData = authData;

    loggerInstance.info("Authentication proccess ended");
    next();
  };

  const loggerInstance = logger({
    serviceName: req.ctx?.serviceName,
    correlationId: req.ctx?.correlationId,
  });

  try {
    loggerInstance.info("Authentication process start");
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
          await validateTokenAndAddAuthDataToContext(
            headers.authorization,
            loggerInstance
          );
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
        throw missingHeader("ass");
      });
  } catch (error) {
    const problem = makeApiProblem(
      error,
      (err) =>
        match(err.code)
          .with("unauthorizedError", () => 401)
          .with("operationForbidden", () => 403)
          .with("missingHeader", () => 400)
          .otherwise(() => 500),
      loggerInstance
    );

    return response.status(problem.status).json(problem).end();
  }
};

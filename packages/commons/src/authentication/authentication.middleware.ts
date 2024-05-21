import { Response, Request, NextFunction } from "express";
import { P, match } from "ts-pattern";
import { readAuthDataFromJwtToken, validateToken } from "./jwt.js";
import { Logger, logger } from "../logging/index.js";
import { AppContext, Headers } from "../config/express.config.js";
import { v4 as uuidv4 } from "uuid";
import {
  makeApiProblemBuilder,
  missingBearer,
  missingHeader,
  unauthorizedError,
} from "../errors/index.js";

const makeApiProblem = makeApiProblemBuilder({});

export const contextMiddleware = async (
  req: Request,
  _response: Response,
  next: NextFunction
) => {
  // eslint-disable-next-line functional/immutable-data
  req.ctx = {
    serviceName: "push",
    correlationId: uuidv4(),
  } as AppContext;
  next();
};

export const authenticationMiddleware = async (
  req: Request,
  response: Response,
  next: NextFunction
) => {
  const validateTokenAndAddAuthDataToContext = async (
    authHeader: string,
    logger: Logger
  ): Promise<void> => {
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
    // eslint-disable-next-line functional/immutable-data
    req.ctx.authData = authData;
    next();
  };

  const loggerInstance = logger({
    serviceName: req.ctx?.serviceName,
    correlationId: req.ctx?.correlationId,
  });

  try {
    loggerInstance.info("Start to authenticate: ");
    const headers = Headers.safeParse(req.headers);

    if (!headers.success) {
      loggerInstance.error(headers.error);
      response.send("Invalid headers");
      next();
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
      .otherwise(() => {
        throw missingHeader();
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

export const authorizationMiddleware = async (
  req: Request,
  _response: Response,
  next: NextFunction
) => {
  console.log("authorizationMiddleware", req.ctx);
  next();
};

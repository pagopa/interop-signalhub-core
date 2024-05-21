import { Response, Request, NextFunction } from "express";
import { P, match } from "ts-pattern";
import { validateToken } from "./jwt.js";
import { Logger, logger } from "../logging/index.js";
import { Headers } from "../config/express.config.js";
import {
  makeApiProblemBuilder,
  missingHeader,
  unauthorizedError,
} from "../errors/index.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authenticationMiddleware = async (
  req: Request,
  response: Response,
  next: NextFunction
) => {
  const addCtxAuthData = async (
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
      throw Error("Missing bearer");
    }

    const jwtToken = authorizationHeader[1];
    const valid = await validateToken(jwtToken, logger);
    if (!valid) {
      throw unauthorizedError("Invalid token");
    }

    // const authData: AuthData = readAuthDataFromJwtToken(jwtToken);
    // eslint-disable-next-line functional/immutable-data
    // req.ctx.authData = authData;
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
          await addCtxAuthData(headers.authorization, loggerInstance);
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

import { Request, Response, NextFunction } from "express";
import { logger, makeApiProblemBuilder } from "signalhub-commons";
import { match } from "ts-pattern";
import { StoreService } from "../services/store.service.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authorizationMiddleware = (storeService: StoreService) => {
  return async (req: Request, response: Response, next: NextFunction) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    if (process.env.SKIP_AUTH_VERIFICATION) {
      loggerInstance.debug("Authorization SKIP");
      return next();
    }
    try {
      loggerInstance.info("Authorization BEGIN");
      const { eserviceId } = req.body;
      await storeService.canProducerDepositSignal(
        req.ctx.sessionData.purposeId,
        eserviceId,
        loggerInstance
      );
      loggerInstance.debug("Authorization END");
      next();
    } catch (error) {
      const problem = makeApiProblem(
        error,
        (err) =>
          match(err.code)
            .with("unauthorizedError", () => 401)
            .with("operationForbidden", () => 403)
            .otherwise(() => 500),
        loggerInstance,
        req.ctx.correlationId
      );
      response.status(problem.status).json(problem).end();
    }
  };
};

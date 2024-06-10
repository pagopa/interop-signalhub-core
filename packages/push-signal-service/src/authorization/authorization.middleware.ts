import { Request, Response, NextFunction } from "express";
import {
  logger,
  makeApiProblemBuilder,
  operationForbidden,
} from "signalhub-commons";
import { match } from "ts-pattern";
import { StoreService } from "../services/store.service.js";
import { getAgreementByPurpose } from "signalhub-interop-client";

const makeApiProblem = makeApiProblemBuilder({});

export const authorizationMiddleware = (storeService: StoreService) => {
  return async (req: Request, response: Response, next: NextFunction) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    try {
      loggerInstance.info("Authorization BEGIN");

      const agreement = await getAgreementByPurpose(
        req.ctx.sessionData.purposeId
      );

      if (!agreement) {
        throw operationForbidden;
      }

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

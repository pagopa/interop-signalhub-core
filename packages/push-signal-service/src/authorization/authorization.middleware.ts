import { Request, Response, NextFunction } from "express";
import {
  logger,
  makeApiProblemBuilder,
  operationForbidden,
} from "signalhub-commons";
import { match } from "ts-pattern";
import { StoreService } from "../services/store.service.js";
import { InteropClientService } from "../services/interopClient.service.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authorizationMiddleware =
  (storeService: StoreService, interopClientservice: InteropClientService) =>
  async (
    req: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    try {
      loggerInstance.info("Authorization BEGIN");

      const agreement = await interopClientservice.getAgreementByPurposeId(
        req.ctx.sessionData.purposeId
      );

      if (!agreement) {
        loggerInstance.error(`Authorization middleware:: Agreement not found`);
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

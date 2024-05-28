import { Request, Response, NextFunction } from "express";
import { logger, makeApiProblemBuilder } from "signalhub-commons";
import { match } from "ts-pattern";
import { producerHasAgreementWithPushSignalEService } from "./authorization.utils.js";
import { SignalService } from "../services/signal.service.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authorizationMiddleware = async (
  req: Request,
  response: Response,
  next: NextFunction,
  signalService: SignalService
): Promise<void> => {
  const loggerInstance = logger({
    serviceName: req.ctx.serviceName,
    correlationId: req.ctx.correlationId,
  });
  if (process.env.SKIP_AUTH_VERIFICATION) {
    loggerInstance.info("Authorization SKIP");
    return next();
  }
  try {
    loggerInstance.info("Authorization BEGIN");
    const producerId = await producerHasAgreementWithPushSignalEService(
      req.ctx.sessionData.purposeId
    );
    const { eserviceId } = req.body;

    await signalService.isOwned(producerId, eserviceId, loggerInstance);
    loggerInstance.info("Authorization END");
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

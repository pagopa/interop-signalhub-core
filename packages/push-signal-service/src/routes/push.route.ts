import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { contract } from "../contract/contract.js";
import { logger, Problem, SignalRequest } from "signalhub-commons";
import { match } from "ts-pattern";
import { StoreService } from "../services/store.service.js";
import { makeApiProblem } from "../model/domain/errors.js";
import { QuequeService } from "../services/queque.service.js";
import { DomainService } from "../services/domain.service.js";

const s = initServer();

export const pushRoutes = (
  domainService: DomainService,
  storeService: StoreService,
  quequeService: QuequeService
) => {
  const pushSignal: AppRouteImplementation<
    typeof contract.pushSignal
  > = async ({ body, req }) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    loggerInstance.info("pushController BEGIN");
    try {
      const { signalId, eserviceId } = body;
      await storeService.verifySignalDuplicated(
        signalId,
        eserviceId,
        loggerInstance
      );
      const message = domainService.signalToMessage(
        body as SignalRequest,
        req.ctx.correlationId,
        loggerInstance
      );
      await quequeService.send(message, loggerInstance);
      return {
        status: 200,
        body: {
          signalId,
        },
      };
    } catch (error) {
      // error sqs, error serialization message
      const problem: Problem = makeApiProblem(
        error,
        (err) =>
          match(err.code)
            .with("signalDuplicate", () => 400)
            .with("signalNotSended", () => 400)
            .with("genericError", () => 500)
            .otherwise(() => 500),
        loggerInstance,
        req.ctx.correlationId
      );
      switch (problem.status) {
        case 400:
          return {
            status: 400,
            body: problem,
          };
        default:
          return {
            status: 500,
            body: problem,
          };
      }
    }
  };

  return s.router(contract, {
    pushSignal,
  });
};

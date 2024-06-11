import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { contract } from "../contract/contract.js";
import { logger, Problem } from "signalhub-commons";
import { match } from "ts-pattern";
import { StoreService } from "../services/store.service.js";
import { makeApiProblem } from "../model/domain/errors.js";

const s = initServer();

export const pullRoutes = (_storeService: StoreService) => {
  const pullSignal: AppRouteImplementation<
    typeof contract.pullSignal
  > = async ({ req }) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    loggerInstance.info("pushController BEGIN");
    try {
      const signalId = 1;

      return {
        status: 200,
        body: {
          signalId,
        },
      };
    } catch (error) {
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
    pullSignal: pullSignal,
  });
};

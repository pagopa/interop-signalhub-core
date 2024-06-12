import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { contract } from "../contract/contract.js";
import { logger, Problem, SignalPayload } from "signalhub-commons";
import { match } from "ts-pattern";
import { StoreService } from "../services/store.service.js";
import { makeApiProblem } from "../model/domain/errors.js";
import { InteropClientService } from "../services/interopClient.service.js";
import { consumerAuthorization } from "../authorization/authorization.js";

const s = initServer();

export const pullRoutes = (
  storeService: StoreService,
  interopClientService: InteropClientService
) => {
  const pullSignal: AppRouteImplementation<
    typeof contract.pullSignal
  > = async ({ req }) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    loggerInstance.info(
      `pullController BEGIN with params: ${JSON.stringify(
        req.params
      )}, query: ${JSON.stringify(req.query)}`
    );
    try {
      await consumerAuthorization(
        storeService,
        interopClientService,
        loggerInstance
      ).verify(req.ctx.sessionData.purposeId, req.params.eserviceId);
      const signal: SignalPayload = {
        signalId: 1,
        eserviceId: "eservice-id-test",
        objectId: "object-id-test",
        objectType: "object-type-test",
        signalType: "CREATE",
      };
      return {
        status: 200,
        body: {
          signals: [signal],
          lastSignalId: 1,
        },
      };
    } catch (error) {
      const problem: Problem = makeApiProblem(
        error,
        (err) =>
          match(err.code)
            .with("unauthorizedError", () => 401)
            .with("operationForbidden", () => 403)
            .with("genericError", () => 500)
            .otherwise(() => 500),
        loggerInstance,
        req.ctx.correlationId
      );
      switch (problem.status) {
        case 401:
          return {
            status: 401,
            body: problem,
          };
        case 403:
          return {
            status: 403,
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

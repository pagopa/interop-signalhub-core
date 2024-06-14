import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { logger, Problem } from "signalhub-commons";
import { match } from "ts-pattern";
import { contract } from "../contract/contract.js";
import { StoreService } from "../services/store.service.js";
import { makeApiProblem } from "../model/domain/errors.js";
import { InteropClientService } from "../services/interopClient.service.js";
import { consumerAuthorization } from "../authorization/authorization.js";

const s = initServer();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
      const { eserviceId } = req.params;
      const { purposeId } = req.ctx.sessionData;
      const { signalId, size } = req.query;
      await consumerAuthorization(
        storeService,
        interopClientService,
        loggerInstance
      ).verify(purposeId, eserviceId);
      loggerInstance.info(
        `pullController get signals: signalId ${signalId}, size: ${size}`
      );
      const { signals, lastSignalId } = await storeService.pullSignal(
        eserviceId,
        signalId,
        size,
        loggerInstance
      );
      return {
        status: 200,
        body: {
          signals,
          lastSignalId: lastSignalId as number,
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
    pullSignal,
  });
};

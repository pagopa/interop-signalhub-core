import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { logger, Problem } from "signalhub-commons";
import { match } from "ts-pattern";
import { contract } from "../contract/contract.js";
import { makeApiProblem } from "../model/domain/errors.js";
import { SignalService } from "../services/signal.service.js";
import { InteropService } from "../services/interop.service.js";

const s = initServer();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pullRoutes = (
  signalService: SignalService,
  interopService: InteropService
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
      )}, query: ${JSON.stringify(req.query)}, session: ${JSON.stringify(
        req.ctx.sessionData
      )}`
    );
    try {
      const { eserviceId } = req.params;
      const { purposeId } = req.ctx.sessionData;
      const { signalId, size } = req.query;

      await interopService.verifyAuthorization(
        purposeId,
        eserviceId,
        loggerInstance
      );

      const { signals, nextSignalId, lastSignalId } =
        await signalService.getSignal(
          eserviceId,
          signalId,
          size,
          loggerInstance
        );
      const status = nextSignalId ? 206 : 200;
      return {
        status,
        body: {
          signals,
          lastSignalId,
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

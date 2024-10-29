import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { Problem, logger } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

import { contract } from "../contract/contract.js";
import { makeApiProblem } from "../model/domain/errors.js";
import { InteropService } from "../services/interop.service.js";
import { SignalService } from "../services/signal.service.js";

const s = initServer();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pullRoutes = (
  signalService: SignalService,
  interopService: InteropService,
) => {
  const getStatus: AppRouteImplementation<
    typeof contract.getStatus
  > = async () => ({
    body: "OK",
    status: 200,
  });
  const pullSignal: AppRouteImplementation<
    typeof contract.pullSignal
  > = async ({ req }) => {
    const log = logger({
      correlationId: req.ctx.correlationId,
      serviceName: req.ctx.serviceName,
    });
    try {
      const { eserviceId } = req.params;
      const { organizationId } = req.ctx.sessionData;
      const { signalId, size } = req.query;

      log.info(`Pulling signals for e-service ${eserviceId}`);

      await interopService.consumerIsAuthorizedToPullSignals(
        organizationId,
        eserviceId,
        log,
      );

      const { lastSignalId, nextSignalId, signals } =
        await signalService.getSignal(eserviceId, signalId, size, log);
      const status = nextSignalId ? 206 : 200;
      return {
        body: {
          lastSignalId,
          signals,
        },
        status,
      };
    } catch (error) {
      const problem: Problem = makeApiProblem(
        error,
        (err) =>
          match(err.code)
            .with("unauthorizedError", () => 401)
            .with("operationPullForbidden", () => 403)
            .with("genericError", () => 500)
            .otherwise(() => 500),
        log,
        req.ctx.correlationId,
      );
      switch (problem.status) {
        case 401:
          return {
            body: problem,
            status: 401,
          };
        case 403:
          return {
            body: problem,
            status: 403,
          };
        default:
          return {
            body: problem,
            status: 500,
          };
      }
    }
  };

  return s.router(contract, {
    getStatus,
    pullSignal,
  });
};

import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { Problem, logger } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

import { contract } from "../contract/contract.js";
import { makeApiProblem } from "../model/domain/errors.js";
import { InteropService } from "../services/interop.service.js";
import { SignalService } from "../services/signal.service.js";

const s = initServer();

export const pullRoutes = (
  signalService: SignalService,
  interopService: InteropService
) => {
  const getStatus: AppRouteImplementation<
    typeof contract.getStatus
  > = async () => ({
    status: 200,
    body: "OK"
  });
  const pullSignal: AppRouteImplementation<
    typeof contract.pullSignal
  > = async ({ req }) => {
    const log = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId
    });
    try {
      const { eserviceId } = req.params;
      const { organizationId } = req.ctx.sessionData;
      const { signalId, size } = req.query;

      log.info(`Pulling signals for e-service ${eserviceId}`);

      await interopService.consumerIsAuthorizedToPullSignals(
        organizationId,
        eserviceId,
        log
      );

      const { signals, nextSignalId, lastSignalId } =
        await signalService.getSignal(eserviceId, signalId, size, log);
      const status = nextSignalId ? 206 : 200;
      return {
        status,
        body: {
          signals,
          lastSignalId
        }
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
        req.ctx.correlationId
      );
      switch (problem.status) {
        case 401:
          return {
            status: 401,
            body: problem
          };
        case 403:
          return {
            status: 403,
            body: problem
          };
        default:
          return {
            status: 500,
            body: problem
          };
      }
    }
  };

  return s.router(contract, {
    pullSignal,
    getStatus
  });
};

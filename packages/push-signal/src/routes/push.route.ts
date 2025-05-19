import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { Problem, SignalPayload, logger } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";

import { contract } from "../contract/contract.js";
import { makeApiProblem } from "../models/domain/errors.js";
import { toSignalMessage } from "../models/domain/toSignalMessage.js";
import { InteropService } from "../services/interop.service.js";
import { QueueService } from "../services/queque.service.js";
import { SignalService } from "../services/signal.service.js";

const s = initServer();

export const pushRoutes = (
  signalService: SignalService,
  interopService: InteropService,
  quequeService: QueueService
) => {
  const getStatus: AppRouteImplementation<
    typeof contract.getStatus
  > = async () => ({
    status: 200,
    body: "OK"
  });
  const pushSignal: AppRouteImplementation<
    typeof contract.pushSignal
  > = async ({ body, req }) => {
    const log = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId
    });
    try {
      const { signalId, eserviceId } = body;
      const { organizationId } = req.ctx.sessionData;
      log.info(`Pushing signalId: ${signalId} for e-service ${eserviceId}`);
      log.debug(
        `DUMP signal: objectType: ${body.signalType}, objectId: ${body.objectId}, signalType: ${body.signalType}`
      );

      await interopService.producerIsAuthorizedToPushSignals(
        organizationId,
        eserviceId,
        log
      );

      await signalService.verifySignalDuplicatedOrConsolidated(
        signalId,
        eserviceId,
        log
      );

      const message = toSignalMessage(
        body as SignalPayload,
        req.ctx.correlationId
      );
      await quequeService.send(message, log);
      return {
        status: 200,
        body: {
          signalId
        }
      };
    } catch (error) {
      const problem: Problem = makeApiProblem(
        error,
        (err) =>
          match(err.code)
            .with("signalDuplicate", () => 400)
            .with("signalNotSended", () => 400)
            .with("unauthorizedError", () => 401)
            .with("operationPushForbidden", () => 403)
            .with("genericError", () => 500)
            .otherwise(() => 500),
        log,
        req.ctx.correlationId
      );
      switch (problem.status) {
        case 400:
          return {
            status: 400,
            body: problem
          };
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
    pushSignal,
    getStatus
  });
};

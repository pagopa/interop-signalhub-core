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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pushRoutes = (
  signalService: SignalService,
  interopService: InteropService,
  quequeService: QueueService,
) => {
  const getStatus: AppRouteImplementation<
    typeof contract.getStatus
  > = async () => ({
    body: "OK",
    status: 200,
  });
  const pushSignal: AppRouteImplementation<
    typeof contract.pushSignal
  > = async ({ body, req }) => {
    const log = logger({
      correlationId: req.ctx.correlationId,
      serviceName: req.ctx.serviceName,
    });
    try {
      const { eserviceId, signalId } = body;
      const { organizationId } = req.ctx.sessionData;
      log.info(`Pushing signalId: ${signalId} for e-service ${eserviceId}`);
      log.debug(
        `DUMP signal: objectType: ${body.signalType}, objectId: ${body.objectId}, signalType: ${body.signalType}`,
      );

      await interopService.producerIsAuthorizedToPushSignals(
        organizationId,
        eserviceId,
        log,
      );

      await signalService.verifySignalDuplicated(signalId, eserviceId, log);

      const message = toSignalMessage(
        body as SignalPayload,
        req.ctx.correlationId,
      );
      await quequeService.send(message, log);
      return {
        body: {
          signalId,
        },
        status: 200,
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
        req.ctx.correlationId,
      );
      switch (problem.status) {
        case 400:
          return {
            body: problem,
            status: 400,
          };
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
    pushSignal,
  });
};

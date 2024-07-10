import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { logger, Problem, SignalPayload } from "signalhub-commons";
import { match } from "ts-pattern";
import {
  HttpStatusPushSignalErrorCode,
  contract,
} from "../contract/contract.js";
import { SignalService } from "../services/signal.service.js";
import { makeApiProblem, makeTsResponseError } from "../model/domain/errors.js";
import { QuequeService } from "../services/queque.service.js";
import { DomainService } from "../services/domain.service.js";
import { InteropService } from "../services/interop.service.js";

const s = initServer();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pushRoutes = (
  signalService: SignalService,
  interopService: InteropService,
  domainService: DomainService,
  quequeService: QuequeService
) => {
  const pushSignal: AppRouteImplementation<
    typeof contract.pushSignal
  > = async ({ body, req }) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    loggerInstance.info(
      `pushController BEGIN with body: ${JSON.stringify(
        body
      )}, session: ${JSON.stringify(req.ctx.sessionData)}`
    );
    try {
      const { signalId, eserviceId } = body;
      const { purposeId } = req.ctx.sessionData;

      await interopService.verifyAuthorization(
        purposeId,
        eserviceId,
        loggerInstance
      );

      await signalService.verifySignalDuplicated(
        signalId,
        eserviceId,
        loggerInstance
      );

      const message = domainService.signalToMessage(
        body as SignalPayload,
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
      const problem: Problem = makeApiProblem(
        error,
        (err) =>
          match(err.code)
            .with("signalDuplicate", () => 400)
            .with("signalNotSended", () => 400)
            .with("unauthorizedError", () => 402)
            .with("operationForbidden", () => 403)
            .with("genericError", () => 500)
            .otherwise(() => 500),
        loggerInstance,
        req.ctx.correlationId
      );

      return makeTsResponseError<HttpStatusPushSignalErrorCode>(
        problem,
        problem.status as HttpStatusPushSignalErrorCode
      );
    }
  };

  return s.router(contract, {
    pushSignal,
  });
};

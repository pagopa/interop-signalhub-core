import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { logger, Problem, SignalPayload } from "signalhub-commons";
import { match } from "ts-pattern";
import { contract } from "../contract/contract.js";
import { StoreService } from "../services/store.service.js";
import { makeApiProblem } from "../model/domain/errors.js";
import { QuequeService } from "../services/queque.service.js";
import { DomainService } from "../services/domain.service.js";
import { producerAuthorization } from "../authorization/authorization.js";
import { InteropClientService } from "../services/interopClient.service.js";

const s = initServer();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const pushRoutes = (
  domainService: DomainService,
  storeService: StoreService,
  quequeService: QuequeService,
  interopClientService: InteropClientService
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
      await producerAuthorization(
        storeService,
        interopClientService,
        loggerInstance
      ).verify(req.ctx.sessionData.purposeId, eserviceId);

      await storeService.verifySignalDuplicated(
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
            .with("unauthorizedError", () => 401)
            .with("operationForbidden", () => 403)
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
    pushSignal,
  });
};

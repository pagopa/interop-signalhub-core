import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { contract } from "../contract/contract.js";
import { logger, Problem, SignalRequest } from "signalhub-commons";
import { match } from "ts-pattern";
import { SignalService } from "../services/signal.service.js";
import { makeApiProblem } from "../model/domain/errors.js";
import signalRequestToSignalMessage from "../model/domain/toSignalMessage.js";
import signalMessageToQuequeMessage from "../model/domain/toJson.js";
import { QuequeService } from "../services/queque.service.js";

const s = initServer();

export const router = (
  signalService: SignalService,
  quequeService: QuequeService
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
      await signalService.signalAlreadyExists(
        signalId,
        eserviceId,
        loggerInstance
      );
      const signalMessage = signalRequestToSignalMessage(
        body as SignalRequest,
        req.ctx.correlationId
      );
      const queueMessage = signalMessageToQuequeMessage(signalMessage);
      await quequeService.send(queueMessage, loggerInstance);

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
            .otherwise(() => 500),
        loggerInstance,
        req.ctx.correlationId
      );
      return {
        status: 400,
        body: problem,
      };
    }
  };

  return s.router(contract, {
    pushSignal,
  });
};

import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { contract } from "../contract/contract.js";
import { logger } from "signalhub-commons";
import {
  SignalService,
  // signalServiceBuilder,
} from "../services/signal.service.js";

const s = initServer();
// const signalService = signalServiceBuilder();

export const router = (signalService: SignalService) => {
  const pushSignal: AppRouteImplementation<
    typeof contract.pushSignal
  > = async ({ body, req }) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    const { signalId, eserviceId } = body;

    loggerInstance.info("pushController BEGIN");
    const signalPresent = await signalService.signalIdAlreadyExists(
      signalId,
      eserviceId,
      loggerInstance
    );
    loggerInstance.info(
      `pushController signalId [${signalId}] with e-service [${eserviceId}] is present? ${JSON.stringify(signalPresent)}`
    );
    return {
      status: 200,
      body: {
        signalId: 1,
      },
    };
  };

  return s.router(contract, {
    pushSignal,
  });
};

import { contract } from "../contract/contract.js";
import { signalServiceBuilder } from "../services/signal.service.js";
import { logger } from "signalhub-commons";
import { AppRouteImplementation } from "@ts-rest/express";

export const pushController: AppRouteImplementation<
  typeof contract.pushSignal
> = async (request) => {
  const loggerInstance = logger({
    serviceName: request.req.ctx.serviceName,
    correlationId: request.req.ctx.correlationId,
  });
  const signalService = signalServiceBuilder();
  const { signalId, eserviceId } = request.body;

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

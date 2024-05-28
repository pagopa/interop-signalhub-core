import { AppRouteImplementation, initServer } from "@ts-rest/express";
import { contract } from "../contract/contract.js";
import { logger, SQS } from "signalhub-commons";
import { SignalService } from "../services/signal.service.js";
import { config } from "../utilities/config.js";

const s = initServer();

export const router = (signalService: SignalService) => {
  const pushSignal: AppRouteImplementation<
    typeof contract.pushSignal
  > = async ({ body, req }) => {
    const loggerInstance = logger({
      serviceName: req.ctx.serviceName,
      correlationId: req.ctx.correlationId,
    });
    try {
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
      const sqsClient: SQS.SQSClient = SQS.instantiateClient({
        region: config.region,
        endpoint: config.queueEndpoint,
      });
      SQS.sendMessage(sqsClient, config.queueUrl, JSON.stringify(body));

      return {
        status: 200,
        body: {
          signalId,
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error: "error" + JSON.stringify(error),
        },
      };
    }
  };

  return s.router(contract, {
    pushSignal,
  });
};

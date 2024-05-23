import { config } from "../utilities/config.js";
import { contract } from "../contract/contract.js";
import { createDbInstance } from "../repositories/db.js";
import { signalServiceBuilder } from "../services/signal.service.js";
import { logger } from "signalhub-commons";
import { AppRouteImplementation } from "@ts-rest/express";

const signalService = signalServiceBuilder(
  createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    schema: config.signalhubStoreDbSchema,
    useSSL: config.signalhubStoreDbUseSSL,
  })
);

export const pushController: AppRouteImplementation<
  typeof contract.pushSignal
> = async (request) => {
  const loggerInstance = logger({
    serviceName: request.req.ctx.serviceName,
    correlationId: request.req.ctx.correlationId,
  });

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

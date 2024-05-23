import { Request, Response } from "express";
import { config } from "../utilities/config.js";
import { createDbInstance } from "../repositories/db.js";
import { signalHubServiceBuilder } from "../services/signalhub.service.js";
import { logger } from "signalhub-commons";

const signalHubService = signalHubServiceBuilder(
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

export const pushController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const loggerInstance = logger({
    serviceName: req.ctx.serviceName,
    correlationId: req.ctx.correlationId,
  });
  const { signalId, eserviceId } = req.body;
  loggerInstance.info("pushController BEGIN");
  const signalPresent = await signalHubService.signalAlreadyExists(
    signalId,
    eserviceId,
    loggerInstance
  );
  loggerInstance.info(
    `pushController signalId [${signalId}] with e-service [${eserviceId}] is present? ${JSON.stringify(signalPresent)}`
  );
  res.status(200).json({ status: "ok" });
};

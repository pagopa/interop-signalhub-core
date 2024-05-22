import { Request, Response } from "express";
import { config } from "../utilities/config.js";
import { initDB } from "../repositories/db.js";
import { signalHubServiceBuilder } from "../services/signalhub.service.js";
import { logger } from "signalhub-commons";

const signalHubService = signalHubServiceBuilder(
  initDB({
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
  loggerInstance.info("pushController BEGIN");
  const done = await signalHubService.getAThing(loggerInstance);
  loggerInstance.info(`pushController ${JSON.stringify(done)}`);
  res.status(200).json({ status: "ok" });
};

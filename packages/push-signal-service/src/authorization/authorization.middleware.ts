import { Request, Response, NextFunction } from "express";
import { logger, makeApiProblemBuilder } from "signalhub-commons";
import { match } from "ts-pattern";
import {
  isProducerEserviceOwned,
  producerHasAgreementWithPushSignalEService,
} from "./authorization.utils.js";

const makeApiProblem = makeApiProblemBuilder({});

export const authorizationMiddleware = async (
  req: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  const loggerInstance = logger({
    serviceName: req.ctx.serviceName,
    correlationId: req.ctx.correlationId,
  });
  try {
    loggerInstance.info("Authorization BEGIN");
    const producerId = await producerHasAgreementWithPushSignalEService(
      req.ctx.sessionData.purposeId
    );

    const { eserviceId } = req.body;

    console.log("eserviceId", eserviceId);
    console.log("prodId", producerId);
    await isProducerEserviceOwned(producerId, eserviceId);
    loggerInstance.info("Authorization END");
    next();
  } catch (error) {
    const problem = makeApiProblem(
      error,
      (err) =>
        match(err.code)
          .with("unauthorizedError", () => 401)
          .with("operationForbidden", () => 403)
          .otherwise(() => 500),
      loggerInstance
    );
    response.status(problem.status).json(problem).end();
  }
};

// 1) Il produttore di segnali è un fruitore di deposito segnali . Questo viene controllato partendo dalla purposeId e recuperando eventualmente organizationId,AgreementId e eServiceId
// 2) Va controllato che il produttore di sengnali è l'erogatore dell'e-service per cui sta depositando un segnale.
// 3) In caso di risposta affermativa si può andare avanti

// Task:
// Implementare data.json (uno per i diversi ambienti momentaneamente)
// completare la gestione degli environment
// Collegamento a DB (installazione pacchetto pg)
// Migliorare la gestione degli errori
// Migliorare la gestione dell'autenticazione

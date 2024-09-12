import express, { Express } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import {
  authenticationMiddleware,
  contextMiddleware,
  logger,
  loggerMiddleware,
  skipForUrl,
} from "pagopa-signalhub-commons";
import { contract } from "./contract/contract.js";
import { pushRoutes } from "./routes/push.route.js";
import { validationErrorHandler } from "./validation/validation.js";
import { serviceBuilder } from "./services/service.builder.js";

const serviceName = "push-signal";

// services
const { signalService, quequeService, interopService } = serviceBuilder();

// express
const app: Express = express();
app.use(express.json());
app.use(contextMiddleware(serviceName));
app.use(skipForUrl("/status", loggerMiddleware()));
app.use(skipForUrl("/status", authenticationMiddleware));

// Disable the "X-Powered-By: Express" HTTP header for security reasons: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

// ts-rest
const routes = pushRoutes(signalService, interopService, quequeService);
createExpressEndpoints(contract, routes, app, {
  requestValidationErrorHandler: validationErrorHandler(
    logger({
      serviceName,
    })
  ),
});

export default app;

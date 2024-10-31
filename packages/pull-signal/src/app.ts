import { createExpressEndpoints } from "@ts-rest/express";
import express, { Express } from "express";
import {
  authenticationMiddleware,
  contextMiddleware,
  logger,
  loggerMiddleware,
  skipForUrl
} from "pagopa-signalhub-commons";

import { contract } from "./contract/contract.js";
import { setupHealthRoute } from "./routes/health.route.js";
import { pullRoutes } from "./routes/pull.route.js";
import { serviceBuilder } from "./services/service.builder.js";
import { validationErrorHandler } from "./validation/validation.js";

const serviceName = "pull-signal";

// services
const { signalService, interopService } = serviceBuilder();

// express
const app: Express = express();
setupHealthRoute(app);
app.use(contextMiddleware(serviceName));
app.use(skipForUrl("/status", loggerMiddleware()));
app.use(authenticationMiddleware);

// Disable the "X-Powered-By: Express" HTTP header for security reasons: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

// ts-rest
const routes = pullRoutes(signalService, interopService);
createExpressEndpoints(contract, routes, app, {
  requestValidationErrorHandler: validationErrorHandler(
    logger({
      serviceName
    })
  )
});

export default app;

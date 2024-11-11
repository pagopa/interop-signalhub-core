import { createExpressEndpoints } from "@ts-rest/express";
import express, { Express } from "express";
import {
  authenticationMiddleware,
  contextMiddleware,
  logger,
  loggerMiddleware,
  parserErrorMiddlware,
  rateLimiterMiddleware,
  skipForUrl
} from "pagopa-signalhub-commons";

import { contract } from "./contract/contract.js";
import { setupHealthRoute } from "./routes/health.route.js";
import { pushRoutes } from "./routes/push.route.js";
import { serviceBuilder } from "./services/service.builder.js";
import { validationErrorHandler } from "./validation/validation.js";

const serviceName = "push-signal";

// services
const { signalService, quequeService, interopService, rateLimiter } =
  serviceBuilder();

// logger
const loggerInstance = logger({
  serviceName
});

// express
const app: Express = express();
app.use(express.json());
setupHealthRoute(app);

app.use(parserErrorMiddlware(loggerInstance));
app.use(contextMiddleware(serviceName));
app.use(skipForUrl("/status", loggerMiddleware()));
app.use(authenticationMiddleware);
app.use(rateLimiterMiddleware(rateLimiter, loggerInstance));

// Disable the "X-Powered-By: Express" HTTP header for security reasons: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

// ts-rest
const routes = pushRoutes(signalService, interopService, quequeService);
createExpressEndpoints(contract, routes, app, {
  requestValidationErrorHandler: validationErrorHandler(
    logger({
      serviceName
    })
  )
});

export default app;

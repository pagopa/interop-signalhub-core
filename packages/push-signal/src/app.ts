import { createExpressEndpoints } from "@ts-rest/express";
import express, { Express } from "express";
import {
  authenticationMiddleware,
  contextMiddleware,
  loggerMiddleware,
  parserErrorMiddleware,
  rateLimiterMiddleware,
  skipForUrl
} from "pagopa-signalhub-commons";

import { contract } from "./contract/contract.js";
import { setupHealthRoute } from "./routes/health.route.js";
import { pushRoutes } from "./routes/push.route.js";
import { rateLimiterBuilder } from "./services/rateLimiter.builder.js";
import { serviceBuilder } from "./services/service.builder.js";
import { validationErrorHandler } from "./validation/validation.js";

const serviceName = "push-signal";

// services
const { signalService, quequeService, interopService } = serviceBuilder();
const { rateLimiter } = await rateLimiterBuilder();

// express
const app: Express = express();
app.use(express.json());
setupHealthRoute(app);
app.use(contextMiddleware(serviceName));
app.use(parserErrorMiddleware(serviceName));
app.use(skipForUrl("/status", loggerMiddleware()));
app.use(authenticationMiddleware);
app.use(rateLimiterMiddleware(rateLimiter));

// Disable the "X-Powered-By: Express" HTTP header for security reasons: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

// ts-rest
const routes = pushRoutes(signalService, interopService, quequeService);
createExpressEndpoints(contract, routes, app, {
  requestValidationErrorHandler: validationErrorHandler()
});

export default app;

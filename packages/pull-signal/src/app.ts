import express, { Express } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import {
  authenticationMiddleware,
  contextMiddleware,
} from "pagopa-signalhub-commons";
import { contract } from "./contract/contract.js";
import { pullRoutes } from "./routes/pull.route.js";
import { validationErrorHandler } from "./validation/validation.js";
import { serviceBuilder } from "./services/service.builder.js";
import { setupHealthRoute } from "./routes/health.route.js";

const serviceName = "pull-signal";

// services
const { signalService, interopService } = serviceBuilder();

// express
const app: Express = express();
app.use(contextMiddleware(serviceName));
setupHealthRoute(app);
app.use(authenticationMiddleware);

// Disable the "X-Powered-By: Express" HTTP header for security reasons: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

// ts-rest
const routes = pullRoutes(signalService, interopService);
createExpressEndpoints(contract, routes, app, {
  requestValidationErrorHandler: validationErrorHandler(),
});

export default app;

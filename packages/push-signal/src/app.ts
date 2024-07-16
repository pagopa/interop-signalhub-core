import express, { Express } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import {
  authenticationMiddleware,
  contextMiddleware,
} from "pagopa-signalhub-commons";
import { contract } from "./contract/contract.js";
import { pushRoutes } from "./routes/push.route.js";
import { validationErrorHandler } from "./validation/validation.js";
import { serviceBuilder } from "./services/service.builder.js";
import { setupHealthRoute } from "./routes/health.route.js";

const serviceName = "push-signal";

// services
const { signalService, quequeService, interopService } = serviceBuilder();

// express
const app: Express = express();
app.use(express.json());
app.use(contextMiddleware(serviceName));
setupHealthRoute(app);
app.use(authenticationMiddleware);

// Disable the "X-Powered-By: Express" HTTP header for security reasons: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#recommendation_16
app.disable("x-powered-by");

// ts-rest
const tsServer = initServer();
const routes = tsServer.router(
  contract,
  pushRoutes(signalService, interopService, quequeService)
);

createExpressEndpoints(contract, routes, app, {
  requestValidationErrorHandler: validationErrorHandler(),
});

export default app;

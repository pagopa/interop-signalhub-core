import express, { Express } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { contract } from "./contract/contract.js";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import { pushRoutes } from "./routes/push.route.js";
import { setupSwaggerRoute } from "./routes/swagger.route.js";
import { validationErrorHandler } from "./validation/validation.js";
import { serviceBuilder } from "./services/service.builder.js";
import "./config/env.js";

const app: Express = express();
app.use(express.json());
setupSwaggerRoute(app);

const { domainService, storeService, quequeService } = serviceBuilder();

const tsServer = initServer();
const routes = tsServer.router(
  contract,
  pushRoutes(domainService, storeService, quequeService)
);

createExpressEndpoints(contract, routes, app, {
  globalMiddleware: [
    contextMiddleware,
    authenticationMiddleware,
    authorizationMiddleware(storeService),
  ],
  requestValidationErrorHandler: validationErrorHandler(),
});

export default app;

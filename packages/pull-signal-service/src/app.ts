import express, { Express } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { contract } from "./contract/contract.js";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import { pullRoutes } from "./routes/pull.route.js";
import { setupSwaggerRoute } from "./routes/swagger.route.js";
import { validationErrorHandler } from "./validation/validation.js";
import { serviceBuilder } from "./services/service.builder.js";

// services
const { storeService, interopClientService } = serviceBuilder();

// express
const app: Express = express();
app.use(contextMiddleware("pull"));
app.use(authenticationMiddleware);
app.use(authorizationMiddleware(storeService, interopClientService));
setupSwaggerRoute(app);

// ts-rest
const tsServer = initServer();
const routes = tsServer.router(contract, pullRoutes(storeService));

createExpressEndpoints(contract, routes, app, {
  requestValidationErrorHandler: validationErrorHandler(),
});

export default app;

import express, { Express } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { contract } from "./contract/contract.js";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import { signalServiceBuilder } from "./services/signal.service.js";
import { router } from "./routes/push.route.js";
import { setupSwaggerRoute } from "./routes/swagger.route.js";
import { QuequeServiceBuilder } from "./services/queque.service.js";
import "./config/env.js";

const app: Express = express();
app.use(express.json());
setupSwaggerRoute(app);

const signalService = signalServiceBuilder();
const quequeService = QuequeServiceBuilder();

const tsServer = initServer();
const routes = tsServer.router(contract, router(signalService, quequeService));

createExpressEndpoints(contract, routes, app, {
  globalMiddleware: [
    contextMiddleware,
    authenticationMiddleware,
    authorizationMiddleware(signalService),
  ],
});

export default app;

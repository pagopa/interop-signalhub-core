import express, { Express } from "express";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { authenticationMiddleware, contextMiddleware } from "signalhub-commons";
import { contract } from "./contract/contract.js";
import { authorizationMiddleware } from "./authorization/authorization.middleware.js";
import { pushRoutes } from "./routes/push.route.js";
import { storeServiceBuilder } from "./services/store.service.js";
import { setupSwaggerRoute } from "./routes/swagger.route.js";
import { quequeServiceBuilder } from "./services/queque.service.js";
import { domainServiceBuilder } from "./services/domain.service.js";
import "./config/env.js";

const app: Express = express();
app.use(express.json());
setupSwaggerRoute(app);

const storeService = storeServiceBuilder();
const quequeService = quequeServiceBuilder();
const domainService = domainServiceBuilder();

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
});

export default app;
